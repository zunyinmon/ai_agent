import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import type { Property, Favourite } from '@property-portal/shared';
import db from '../db/client';

const router = Router();

// ─── GET /api/favourites ──────────────────────────────────────────────────────
router.get('/', authenticate, (req: Request, res: Response) => {
  const userId = req.user!.id;

  const properties = db
    .prepare(
      `SELECT p.*
       FROM properties p
       INNER JOIN favourites f ON f.property_id = p.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`
    )
    .all(userId) as Property[];

  return res.json(properties);
});

// ─── POST /api/favourites/:propertyId ─────────────────────────────────────────
router.post('/:propertyId', authenticate, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const propertyId = Number(req.params.propertyId);

  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return res.status(400).json({ error: 'Invalid property ID' });
  }

  const property = db.prepare('SELECT id FROM properties WHERE id = ?').get(propertyId);
  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  const existing = db
    .prepare('SELECT id FROM favourites WHERE user_id = ? AND property_id = ?')
    .get(userId, propertyId);

  if (existing) {
    return res.status(409).json({ error: 'Property already in favourites' });
  }

  const result = db
    .prepare('INSERT INTO favourites (user_id, property_id) VALUES (?, ?)')
    .run(userId, propertyId);

  const favourite = db
    .prepare('SELECT * FROM favourites WHERE id = ?')
    .get(Number(result.lastInsertRowid)) as Favourite;

  return res.status(201).json(favourite);
});

// ─── DELETE /api/favourites/:propertyId ───────────────────────────────────────
router.delete('/:propertyId', authenticate, (req: Request, res: Response) => {
  const userId = req.user!.id;
  const propertyId = Number(req.params.propertyId);

  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return res.status(400).json({ error: 'Invalid property ID' });
  }

  const existing = db
    .prepare('SELECT id FROM favourites WHERE user_id = ? AND property_id = ?')
    .get(userId, propertyId);

  if (!existing) {
    return res.status(404).json({ error: 'Favourite not found' });
  }

  db.prepare('DELETE FROM favourites WHERE user_id = ? AND property_id = ?').run(userId, propertyId);

  return res.status(204).send();
});

export default router;
