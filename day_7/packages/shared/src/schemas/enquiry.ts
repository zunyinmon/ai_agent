import { z } from 'zod';

export const EnquirySchema = z.object({
  sender_name: z.string().min(1, 'Name is required').max(255),
  sender_email: z.string().email('Invalid email address'),
  sender_phone: z.string().min(1, 'Phone number is required').max(50),
  message: z.string().min(1, 'Message is required').max(2000),
});

export type EnquiryInput = z.infer<typeof EnquirySchema>;
