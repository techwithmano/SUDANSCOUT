
'use server';

import { z } from 'zod';

const contactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
});

export async function submitContactForm(data: z.infer<typeof contactSchema>) {
  const parsedData = contactSchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, message: 'Invalid data provided.' };
  }
  
  // In a real application, you would send an email, save to a database, etc.
  // For this example, we'll just log it to the console.
  console.log('New contact form submission:', parsedData.data);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { success: true, message: 'Message sent successfully!' };
}
