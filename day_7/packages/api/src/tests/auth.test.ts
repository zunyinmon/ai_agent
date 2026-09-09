import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db/client';
import app from '../app';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@property-portal/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';

describe('Auth Routes & Middleware Tests', () => {
  beforeEach(() => {
    // Clean up test users while maintaining seeded properties or clean references
    db.prepare('DELETE FROM favourites').run();
    db.prepare('DELETE FROM enquiries').run();
    db.prepare('DELETE FROM property_images').run();
    db.prepare('DELETE FROM properties').run();
    db.prepare('DELETE FROM users').run();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return JWT + PublicUser', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'buyer_renter',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.role).toBe('buyer_renter');
      expect(res.body.user).not.toHaveProperty('password_hash');

      // Verify token payload
      const decoded = jwt.verify(res.body.token, JWT_SECRET) as any;
      expect(decoded.id).toBe(res.body.user.id);
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('buyer_renter');
      expect(decoded).not.toHaveProperty('password_hash');
    });

    it('should default role to buyer_renter if not provided', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'defaultrole@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('buyer_renter');
    });

    it('should reject registration if email is already registered', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ error: 'Email already registered' });
    });

    it('should reject registration if fields are missing or invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'loginuser@example.com',
          password: 'correctpassword',
          role: 'agent',
        });
    });

    it('should log in successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'correctpassword',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('loginuser@example.com');
      expect(res.body.user.role).toBe('agent');
      expect(res.body.user).not.toHaveProperty('password_hash');

      const decoded = jwt.verify(res.body.token, JWT_SECRET) as any;
      expect(decoded.email).toBe('loginuser@example.com');
      expect(decoded.role).toBe('agent');
      expect(decoded).not.toHaveProperty('password_hash');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid email or password' });
    });

    it('should reject login with unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'correctpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid email or password' });
    });

    it('should reject login with invalid request body', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'bad-email',
          password: '12',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('authenticate & authorize middleware unit tests', () => {
    const testApp = express();
    testApp.use(express.json());

    // Protected route requiring authentication
    testApp.get('/test/protected', authenticate, (req: Request, res: Response) => {
      res.json({ message: 'authenticated', user: req.user });
    });

    // Guarded route requiring admin role
    testApp.get(
      '/test/admin-only',
      authenticate,
      authorize('admin'),
      (req: Request, res: Response) => {
        res.json({ message: 'admin access granted', user: req.user });
      }
    );

    // Guarded route requiring agent or admin role
    testApp.get(
      '/test/agent-or-admin',
      authenticate,
      authorize('admin', 'agent'),
      (req: Request, res: Response) => {
        res.json({ message: 'agent or admin access granted', user: req.user });
      }
    );

    it('authenticate: should allow valid token and populate req.user', async () => {
      const token = jwt.sign(
        { id: 1, email: 'auth@test.com', role: 'agent' as Role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const res = await request(testApp)
        .get('/test/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual({
        id: 1,
        email: 'auth@test.com',
        role: 'agent',
      });
    });

    it('authenticate: should return 401 when token is missing', async () => {
      const res = await request(testApp).get('/test/protected');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Authentication token required' });
    });

    it('authenticate: should return 401 when token is invalid', async () => {
      const res = await request(testApp)
        .get('/test/protected')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid or expired authentication token' });
    });

    it('authorize: should allow user with required role', async () => {
      const adminToken = jwt.sign(
        { id: 99, email: 'admin@test.com', role: 'admin' as Role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const res = await request(testApp)
        .get('/test/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('admin access granted');
    });

    it('authorize: should reject user without required role with 403', async () => {
      const buyerToken = jwt.sign(
        { id: 10, email: 'buyer@test.com', role: 'buyer_renter' as Role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const res = await request(testApp)
        .get('/test/admin-only')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Access denied: insufficient permissions' });
    });

    it('authorize: should allow any role in the allowed list', async () => {
      const agentToken = jwt.sign(
        { id: 2, email: 'agent@test.com', role: 'agent' as Role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const res = await request(testApp)
        .get('/test/agent-or-admin')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('agent or admin access granted');
    });
  });
});
