import db from '../client';
import type { Property, Image } from '@property-portal/shared';
import type { CreatePropertyInput, UpdatePropertyInput } from '@property-portal/shared';

export interface PropertyFilters {
  location_id?: number;
  category_id?: number;
  listing_type?: string;
  min_price_mmk?: number;
  max_price_mmk?: number;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface PropertyListResult {
  data: (Property & { first_image_filename?: string | null })[];
  total: number;
  page: number;
  limit: number;
}

function resolveImages(images: { id: number; filename: string; sort_order: number }[]): Image[] {
  return images.map(img => ({
    id: img.id,
    property_id: 0, // will be set externally if needed
    filename: img.filename,
    sort_order: img.sort_order,
    url: `/uploads/${img.filename}`,
  }));
}

export function listProperties(filters: PropertyFilters, pagination: Pagination): PropertyListResult {
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters.location_id !== undefined) {
    conditions.push('p.location_id = ?');
    params.push(filters.location_id);
  }
  if (filters.category_id !== undefined) {
    conditions.push('p.category_id = ?');
    params.push(filters.category_id);
  }
  if (filters.listing_type !== undefined) {
    conditions.push('p.listing_type = ?');
    params.push(filters.listing_type);
  }
  if (filters.min_price_mmk !== undefined) {
    conditions.push('p.price_mmk >= ?');
    params.push(filters.min_price_mmk);
  }
  if (filters.max_price_mmk !== undefined) {
    conditions.push('p.price_mmk <= ?');
    params.push(filters.max_price_mmk);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRow = db
    .prepare(`SELECT COUNT(*) as total FROM properties p ${whereClause}`)
    .get(...params) as { total: number };
  const total = countRow.total;

  const rows = db
    .prepare(
      `SELECT p.*,
              pi.filename AS first_image_filename
       FROM properties p
       LEFT JOIN property_images pi ON pi.property_id = p.id
         AND pi.sort_order = (
           SELECT MIN(sort_order) FROM property_images WHERE property_id = p.id
         )
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset) as (Property & { first_image_filename?: string | null })[];

  const data = rows.map(row => ({
    ...row,
    images: row.first_image_filename
      ? [{ id: 0, property_id: row.id, filename: row.first_image_filename, sort_order: 0, url: `/uploads/${row.first_image_filename}` }]
      : [],
  }));

  return { data, total, page, limit };
}

export function getPropertyById(id: number): (Property & { images: Image[] }) | undefined {
  const property = db
    .prepare('SELECT * FROM properties WHERE id = ?')
    .get(id) as Property | undefined;

  if (!property) return undefined;

  const rawImages = db
    .prepare(
      'SELECT id, filename, sort_order FROM property_images WHERE property_id = ? ORDER BY sort_order ASC'
    )
    .all(id) as { id: number; filename: string; sort_order: number }[];

  const images: Image[] = rawImages.map(img => ({
    id: img.id,
    property_id: id,
    filename: img.filename,
    sort_order: img.sort_order,
    url: `/uploads/${img.filename}`,
  }));

  return { ...property, images };
}

export function createProperty(data: CreatePropertyInput & { agent_id: number }): Property {
  const result = db
    .prepare(
      `INSERT INTO properties
         (title, description, price_mmk, listing_type, status, latitude, longitude, location_id, category_id, agent_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.title,
      data.description,
      data.price_mmk,
      data.listing_type,
      data.status ?? 'active',
      data.latitude ?? null,
      data.longitude ?? null,
      data.location_id,
      data.category_id,
      data.agent_id
    );

  return db
    .prepare('SELECT * FROM properties WHERE id = ?')
    .get(Number(result.lastInsertRowid)) as Property;
}

export function updateProperty(id: number, data: UpdatePropertyInput): Property | undefined {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  const updatable: (keyof UpdatePropertyInput)[] = [
    'title', 'description', 'price_mmk', 'listing_type', 'status',
    'latitude', 'longitude', 'location_id', 'category_id',
  ];

  for (const key of updatable) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key] as string | number | null);
    }
  }

  if (fields.length === 0) return getPropertyById(id);

  fields.push("updated_at = datetime('now')");
  params.push(id);

  db.prepare(`UPDATE properties SET ${fields.join(', ')} WHERE id = ?`).run(...params);

  return db.prepare('SELECT * FROM properties WHERE id = ?').get(id) as Property | undefined;
}

export function deleteProperty(id: number): void {
  db.prepare('DELETE FROM properties WHERE id = ?').run(id);
}
