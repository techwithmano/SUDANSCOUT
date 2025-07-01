import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/data';
import HomeView from '@/components/views/HomeView';

async function getFeaturedProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const q = query(productsCol, limit(3));
  const productsSnapshot = await getDocs(q);
  const productsList = productsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
  return productsList;
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  return <HomeView featuredProducts={featuredProducts} />;
}
