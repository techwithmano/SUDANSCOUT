import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/data';
import StoreView from '@/components/views/StoreView';

async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const q = query(productsCol);
  const productsSnapshot = await getDocs(q);
  const productsList = productsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
  return productsList;
}

export default async function StorePage() {
  const products = await getProducts();
  return <StoreView products={products} />;
}
