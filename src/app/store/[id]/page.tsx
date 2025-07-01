import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/data';
import { notFound } from 'next/navigation';
import ProductDetailView from '@/components/views/ProductDetailView';

async function getProduct(id: string): Promise<Product | null> {
  const productRef = doc(db, 'products', id);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    return null;
  }
  
  return { id: productSnap.id, ...productSnap.data() } as Product;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
