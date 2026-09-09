import type { ListingType } from './listingType';
import type { Image } from './image';

export type PropertyStatus = 'active' | 'inactive' | 'sold' | 'rented';

export interface Property {
  id: number;
  title: string;
  description: string;
  /** Price in Myanmar Kyat — stored as INTEGER, no decimals */
  price_mmk: number;
  listing_type: ListingType;
  status: PropertyStatus;
  /** Decimal degrees — individual property pin on map */
  latitude: number | null;
  /** Decimal degrees — individual property pin on map */
  longitude: number | null;
  location_id: number;
  category_id: number;
  /** FK → users.id (agent who owns the listing) */
  agent_id: number;
  created_at: string;
  updated_at: string;
  /** Populated by JOIN queries */
  images?: Image[];
}
