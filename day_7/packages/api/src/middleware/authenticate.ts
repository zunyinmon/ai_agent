import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@property-portal/shared';

interface JwtPayload {
  id: number;
  email: string;
  role: Role;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'dev_secret_change_in_prod';

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (!decoded || typeof decoded !== 'object' || !decoded.id || !decoded.email || !decoded.role) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};
