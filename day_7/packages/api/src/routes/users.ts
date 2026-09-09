import { Router, Request, Response } from 'express';
import db from '../db/client';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { PublicUser, Role } from '@property-portal/shared';

const router = Router();

const VALID_ROLES: Role[] = ['admin', 'agent', 'buyer_renter'];

// ─── GET /api/users ───────────────────────────────────────────────────────────
router.get('/', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
  const offset = (page - 1) * limit;

  const total = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  const data = db
    .prepare('SELECT id, email, role, created_at FROM users ORDER BY id LIMIT ? OFFSET ?')
    .all(limit, offset) as PublicUser[];

  return res.json({ data, total, page, limit });
});

// ─── PUT /api/users/:id/role ──────────────────────────────────────────────────
router.put('/:id/role', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { role } = req.body as { role: Role };

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
  }

  const result = db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updated = db
    .prepare('SELECT id, email, role, created_at FROM users WHERE id = ?')
    .get(id) as PublicUser;

  return res.json(updated);
});

export default router;
