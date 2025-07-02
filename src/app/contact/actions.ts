
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

export async function submitContactForm(data: z.infer<typeof contactSchema>) {
  const parsedData = contactSchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, message: 'Invalid data provided.' };
  }
  
  try {
    // Save the submission to the "contacts" collection in Firestore
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...parsedData.data,
      submittedAt: serverTimestamp(), // Add a server-side timestamp
    });
    console.log('Contact form submission saved with ID: ', docRef.id);
    return { success: true, message: 'Message sent successfully!' };
  } catch (error) {
    console.error('Error saving contact form submission:', error);
    return { success: false, message: 'Could not save your message. Please try again later.' };
  }
}
