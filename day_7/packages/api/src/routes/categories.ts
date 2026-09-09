import { Router, Request, Response } from 'express';
import db from '../db/client';
import { Category } from '@property-portal/shared';

const router = Router();

// ─── GET /api/categories ──────────────────────────────────────────────────────
router.get('/', (_req: Request, res: Response) => {
  const categories = db.prepare('SELECT id, name FROM categories').all() as Category[];
  return res.json(categories);
});

export default router;
