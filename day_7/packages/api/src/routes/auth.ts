import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterSchema, LoginSchema, PublicUser, Role } from '@property-portal/shared';
import db from '../db/client';

const router = Router();
const BCRYPT_SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '7d';

router.post('/register', async (req: Request, res: Response) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    const errorMsg = result.error.errors.map(e => e.message).join(', ');
    return res.status(400).json({ error: errorMsg || 'Invalid registration input' });
  }

  const { email, password, role } = result.data;

  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const insertResult = db
      .prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
      .run(email, passwordHash, role);

    const userId = Number(insertResult.lastInsertRowid);
    const createdUser = db
      .prepare('SELECT id, email, role, created_at FROM users WHERE id = ?')
      .get(userId) as PublicUser;

    const secret = process.env.JWT_SECRET || 'dev_secret_change_in_prod';
    const token = jwt.sign(
      {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      },
      secret,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      token,
      user: createdUser,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    const errorMsg = result.error.errors.map(e => e.message).join(', ');
    return res.status(400).json({ error: errorMsg || 'Invalid login input' });
  }

  const { email, password } = result.data;

  try {
    const user = db
      .prepare('SELECT id, email, password_hash, role, created_at FROM users WHERE email = ?')
      .get(email) as { id: number; email: string; password_hash: string; role: Role; created_at: string } | undefined;

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };

    const secret = process.env.JWT_SECRET || 'dev_secret_change_in_prod';
    const token = jwt.sign(
      {
        id: publicUser.id,
        email: publicUser.email,
        role: publicUser.role,
      },
      secret,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      user: publicUser,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to log in' });
  }
});

export default router;
