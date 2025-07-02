import { z } from 'zod';

export type Product = {
  id: string;
  name_en?: string;
  name_ar?: string;
  price: number;
  description_en?: string;
  description_ar?: string;
  imageUrl: string;
  aiHint: string;
  category?: 'clothing' | 'gear';
  // For backward compatibility with old data structure
  name?: string;
  description?: string;
};

export const productSchema = z.object({
  name_en: z.string().min(1, 'English name is required'),
  name_ar: z.string().min(1, 'Arabic name is required'),
  description_en: z.string().min(1, 'English description is required'),
  description_ar: z.string().min(1, 'Arabic description is required'),
  price: z.coerce.number().min(0.01, 'Price is required'),
  category: z.enum(['clothing', 'gear'], { required_error: 'Category is required' }),
  imageUrl: z.string().url('A valid image URL is required').default('https://placehold.co/400x300.png'),
  aiHint: z.string().optional().default('product'),
});

export const paymentSchema = z.object({
  month: z.string().min(1, "Month is required"),
  amount: z.coerce.number().min(0, "Amount must be a positive number"),
  status: z.enum(["paid", "due"]),
});

export const scoutSchema = z.object({
  id: z.string().min(1, "Scout ID is required"),
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Address is required"),
  group: z.string().min(1, "Group is required"),
  imageUrl: z.string().optional().transform(val => val && val.startsWith('http') ? val : 'https://placehold.co/400x400.png'),
  payments: z.array(paymentSchema).optional().default([]),
});


export type Payment = z.infer<typeof paymentSchema>;

export type Scout = z.infer<typeof scoutSchema>;

export interface CartItem extends Product {
  quantity: number;
  size?: string;
}
