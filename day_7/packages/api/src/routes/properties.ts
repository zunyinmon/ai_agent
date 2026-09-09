import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { upload } from '../lib/upload';
import {
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../db/queries/properties';
import db from '../db/client';
import {
  CreatePropertySchema,
  UpdatePropertySchema,
} from '@property-portal/shared';

const router = Router();
const MAX_IMAGES = 10;

// ─── GET /api/properties ──────────────────────────────────────────────────────
router.get('/', (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));

  const filters: Record<string, string | number> = {};

  if (req.query.location_id) filters.location_id = Number(req.query.location_id);
  if (req.query.category_id) filters.category_id = Number(req.query.category_id);
  if (req.query.listing_type) filters.listing_type = String(req.query.listing_type);
  if (req.query.min_price_mmk) filters.min_price_mmk = Number(req.query.min_price_mmk);
  if (req.query.max_price_mmk) filters.max_price_mmk = Number(req.query.max_price_mmk);

  const result = listProperties(filters, { page, limit });
  return res.json(result);
});

// ─── GET /api/properties/:id ──────────────────────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid property ID' });
  }

  const property = getPropertyById(id);
  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }

  return res.json(property);
});

// ─── POST /api/properties ─────────────────────────────────────────────────────
router.post('/', authenticate, authorize('agent', 'admin'), (req: Request, res: Response) => {
  const result = CreatePropertySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors.map(e => e.message).join(', ') });
  }

  const property = createProperty({ ...result.data, agent_id: req.user!.id });
  return res.status(201).json(property);
});

// ─── PUT /api/properties/:id ──────────────────────────────────────────────────
router.put('/:id', authenticate, authorize('agent', 'admin'), (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid property ID' });
  }

  const existing = getPropertyById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Property not found' });
  }

  if (req.user!.role === 'agent' && existing.agent_id !== req.user!.id) {
    return res.status(403).json({ error: 'You do not own this listing' });
  }

  const result = UpdatePropertySchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors.map(e => e.message).join(', ') });
  }

  const updated = updateProperty(id, result.data);
  return res.json(updated);
});

// ─── DELETE /api/properties/:id ───────────────────────────────────────────────
router.delete('/:id', authenticate, authorize('agent', 'admin'), (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid property ID' });
  }

  const existing = getPropertyById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Property not found' });
  }

  if (req.user!.role === 'agent' && existing.agent_id !== req.user!.id) {
    return res.status(403).json({ error: 'You do not own this listing' });
  }

  // Remove image files from disk
  const images = db
    .prepare('SELECT filename FROM property_images WHERE property_id = ?')
    .all(id) as { filename: string }[];

  deleteProperty(id);

  for (const img of images) {
    const filePath = path.resolve(__dirname, '../../uploads', img.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  return res.status(204).send();
});

// ─── POST /api/properties/:id/images ─────────────────────────────────────────
router.post(
  '/:id/images',
  authenticate,
  authorize('agent', 'admin'),
  upload.array('images', MAX_IMAGES),
  (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }

    const existing = getPropertyById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (req.user!.role === 'agent' && existing.agent_id !== req.user!.id) {
      return res.status(403).json({ error: 'You do not own this listing' });
    }

    const currentCount = (
      db.prepare('SELECT COUNT(*) as cnt FROM property_images WHERE property_id = ?').get(id) as { cnt: number }
    ).cnt;

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    if (currentCount + files.length > MAX_IMAGES) {
      // Clean up newly uploaded files
      for (const f of files) {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      }
      return res.status(400).json({
        error: `Cannot exceed ${MAX_IMAGES} images per property. Currently has ${currentCount}.`,
      });
    }

    const nextSortOrder = (
      db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM property_images WHERE property_id = ?').get(id) as { next: number }
    ).next;

    const insertedImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = db
        .prepare('INSERT INTO property_images (property_id, filename, sort_order) VALUES (?, ?, ?)')
        .run(id, file.filename, nextSortOrder + i);

      insertedImages.push({
        id: Number(result.lastInsertRowid),
        property_id: id,
        filename: file.filename,
        sort_order: nextSortOrder + i,
        url: `/uploads/${file.filename}`,
      });
    }

    return res.status(201).json(insertedImages);
  }
);

// ─── DELETE /api/properties/:id/images/:imageId ───────────────────────────────
router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize('agent', 'admin'),
  (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const imageId = Number(req.params.imageId);

    if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(imageId) || imageId <= 0) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const existing = getPropertyById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (req.user!.role === 'agent' && existing.agent_id !== req.user!.id) {
      return res.status(403).json({ error: 'You do not own this listing' });
    }

    const image = db
      .prepare('SELECT * FROM property_images WHERE id = ? AND property_id = ?')
      .get(imageId, id) as { id: number; filename: string } | undefined;

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    db.prepare('DELETE FROM property_images WHERE id = ?').run(imageId);

    const filePath = path.resolve(__dirname, '../../uploads', image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(204).send();
  }
);

export default router;
