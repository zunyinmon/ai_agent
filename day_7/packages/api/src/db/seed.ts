import bcrypt from 'bcryptjs';
import db from './client';
import type { Role } from '@property-portal/shared';
import type { ListingType } from '@property-portal/shared';
import type { PropertyStatus } from '@property-portal/shared';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function insertLocation(name: string, latitude: number, longitude: number): number {
  const existing = db
    .prepare('SELECT id FROM locations WHERE name = ?')
    .get(name) as { id: number } | undefined;
  if (existing) return existing.id;
  const result = db
    .prepare('INSERT INTO locations (name, latitude, longitude) VALUES (?, ?, ?)')
    .run(name, latitude, longitude);
  return result.lastInsertRowid as number;
}

function insertCategory(name: string): number {
  const existing = db
    .prepare('SELECT id FROM categories WHERE name = ?')
    .get(name) as { id: number } | undefined;
  if (existing) return existing.id;
  const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
  return result.lastInsertRowid as number;
}

function insertUser(email: string, password: string, role: Role): number {
  const existing = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(email) as { id: number } | undefined;
  if (existing) return existing.id;
  const password_hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
    .run(email, password_hash, role);
  return result.lastInsertRowid as number;
}

function insertProperty(data: {
  title: string;
  description: string;
  price_mmk: number;
  listing_type: ListingType;
  status: PropertyStatus;
  latitude: number | null;
  longitude: number | null;
  location_id: number;
  category_id: number;
  agent_id: number;
}): void {
  const existing = db
    .prepare('SELECT id FROM properties WHERE title = ? AND agent_id = ?')
    .get(data.title, data.agent_id);
  if (existing) return;
  db.prepare(`
    INSERT INTO properties
      (title, description, price_mmk, listing_type, status, latitude, longitude,
       location_id, category_id, agent_id)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.title,
    data.description,
    data.price_mmk,
    data.listing_type,
    data.status,
    data.latitude,
    data.longitude,
    data.location_id,
    data.category_id,
    data.agent_id,
  );
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

console.log('Seeding database…');

// Locations
const yangonId = insertLocation('Yangon', 16.8661, 96.1951);
const mandalayId = insertLocation('Mandalay', 21.9588, 96.0891);
console.log(`  ✓ Locations: Yangon (id=${yangonId}), Mandalay (id=${mandalayId})`);

// Categories
const landId = insertCategory('Land');
const apartmentId = insertCategory('Apartment');
const houseId = insertCategory('House');
console.log(`  ✓ Categories: Land (id=${landId}), Apartment (id=${apartmentId}), House (id=${houseId})`);

// Admin user
const adminId = insertUser('admin@portal.com', 'admin123', 'admin');
console.log(`  ✓ Admin user: admin@portal.com (id=${adminId})`);

// Sample properties
insertProperty({
  title: 'Prime Land Plot in Bahan Township',
  description: 'Flat rectangular land plot in a quiet residential street. Suitable for building a house or small commercial unit.',
  price_mmk: 250000000,
  listing_type: 'sell',
  status: 'active',
  latitude: 16.8372,
  longitude: 96.1535,
  location_id: yangonId,
  category_id: landId,
  agent_id: adminId,
});

insertProperty({
  title: 'Modern 2-Bedroom Apartment in Hlaing',
  description: 'Brand new apartment with lift access, 24-hour security, car parking, and city views. Walking distance to international schools.',
  price_mmk: 85000000,
  listing_type: 'sell',
  status: 'active',
  latitude: 16.8705,
  longitude: 96.1197,
  location_id: yangonId,
  category_id: apartmentId,
  agent_id: adminId,
});

insertProperty({
  title: 'Cosy 3-Bedroom House for Rent in Sanchaung',
  description: 'Well-maintained family home with private garden, 3 bedrooms, 2 bathrooms, and covered parking. Available immediately.',
  price_mmk: 1500000,
  listing_type: 'rent',
  status: 'active',
  latitude: 16.8539,
  longitude: 96.1357,
  location_id: yangonId,
  category_id: houseId,
  agent_id: adminId,
});

insertProperty({
  title: 'Commercial Land Near Mandalay Palace',
  description: 'High-visibility corner plot on a main road close to Mandalay Palace. Ideal for retail or hospitality development.',
  price_mmk: 380000000,
  listing_type: 'sell',
  status: 'active',
  latitude: 21.9784,
  longitude: 96.0850,
  location_id: mandalayId,
  category_id: landId,
  agent_id: adminId,
});

insertProperty({
  title: 'Studio Apartment for Rent in Chanayethazan',
  description: 'Compact, fully furnished studio apartment on the 5th floor with mountain views. Utilities included in rent.',
  price_mmk: 600000,
  listing_type: 'rent',
  status: 'active',
  latitude: 21.9552,
  longitude: 96.0931,
  location_id: mandalayId,
  category_id: apartmentId,
  agent_id: adminId,
});

console.log('  ✓ 5 sample properties inserted');
console.log('\nSeed complete.');
