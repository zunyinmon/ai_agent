import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { EnquirySchema } from '@property-portal/shared';
import type { Enquiry } from '@property-portal/shared';
import db from '../db/client';

const router = Router({ mergeParams: true });

// ─── POST /api/properties/:id/enquiries (public) ──────────────────────────────
router.post('/', (req: Request, res: Response) => {
  const propertyId = Number(req.params.id);
  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return res.status(400).json({ error: 'Invalid property ID' });
  }

  const property = db.prepare('SELECT id FROM properties WHERE id = ?').get(propertyId);
  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  const result = EnquirySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors.map(e => e.message).join(', ') });
  }

  const { sender_name, sender_email, sender_phone, message } = result.data;

  const insertResult = db
    .prepare(
      `INSERT INTO enquiries (property_id, sender_name, sender_email, sender_phone, message)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(propertyId, sender_name, sender_email, sender_phone ?? null, message);

  const enquiry = db
    .prepare('SELECT * FROM enquiries WHERE id = ?')
    .get(Number(insertResult.lastInsertRowid)) as Enquiry;

  return res.status(201).json(enquiry);
});

// ─── GET /api/properties/:id/enquiries (agent/admin only) ─────────────────────
router.get('/', authenticate, authorize('agent', 'admin'), (req: Request, res: Response) => {
  const propertyId = Number(req.params.id);
  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return res.status(400).json({ error: 'Invalid property ID' });
  }

  const property = db
    .prepare('SELECT id, agent_id FROM properties WHERE id = ?')
    .get(propertyId) as { id: number; agent_id: number } | undefined;

  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  // Agents can only view enquiries for their own listings
  if (req.user!.role === 'agent' && property.agent_id !== req.user!.id) {
    return res.status(403).json({ error: 'You do not own this listing' });
  }

  const enquiries = db
    .prepare('SELECT * FROM enquiries WHERE property_id = ? ORDER BY created_at DESC')
    .all(propertyId) as Enquiry[];

  return res.json(enquiries);
});

export default router;
