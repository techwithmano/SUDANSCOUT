
'use server';

import { z } from 'zod';
import type { CartItem } from '@/lib/data';

const checkoutSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  address: z.string().min(10),
  phone: z.string().min(10),
  email: z.string().email(),
  scoutId: z.string().optional(),
});

interface OrderPayload {
  customerDetails: z.infer<typeof checkoutSchema>;
  cartItems: CartItem[];
  totalPrice: number;
}

export async function placeOrder(payload: OrderPayload) {
  const parsedData = checkoutSchema.safeParse(payload.customerDetails);

  if (!parsedData.success) {
    return { success: false, message: 'Invalid customer data provided.' };
  }

  // In a real application, you would save this complete order to a database
  // and likely trigger other processes like sending a confirmation email.
  console.log('New order placed:', {
    customer: parsedData.data,
    items: payload.cartItems,
    total: payload.totalPrice,
  });
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { success: true, message: 'Order placed successfully!' };
}
