import { z } from 'zod';

export const CreatePropertySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  /** Myanmar Kyat — integer, no decimals */
  price_mmk: z.number().int('Price must be a whole number').positive('Price must be positive'),
  listing_type: z.enum(['buy', 'sell', 'rent']),
  status: z.enum(['active', 'inactive', 'sold', 'rented']).default('active'),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  location_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
});

export const UpdatePropertySchema = CreatePropertySchema.partial();

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;
