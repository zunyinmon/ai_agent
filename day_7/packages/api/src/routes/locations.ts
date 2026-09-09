import { Router, Request, Response } from 'express';
import db from '../db/client';
import { Location } from '@property-portal/shared';

const router = Router();

// ─── GET /api/locations ───────────────────────────────────────────────────────
router.get('/', (_req: Request, res: Response) => {
  const locations = db.prepare('SELECT id, name, latitude, longitude FROM locations').all() as Location[];
  return res.json(locations);
});

export default router;
