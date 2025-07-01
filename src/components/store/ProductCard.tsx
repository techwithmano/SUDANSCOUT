
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/data';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, locale } = useTranslation();

  const productName = (locale === 'ar' ? product.name_ar : product.name_en) || product.name_en || product.name_ar || product.name;
  const productDescription = (locale === 'ar' ? product.description_ar : product.description_en) || product.description_en || product.description_ar || product.description;

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
      <CardHeader className="p-0">
        <div className="aspect-w-4 aspect-h-3">
          <Image
            src={product.imageUrl}
            alt={productName || product.aiHint}
            width={400}
            height={300}
            className="object-cover w-full h-full"
            data-ai-hint={product.aiHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <h3 className="text-xl font-bold font-headline">{productName}</h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{productDescription}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <p className="text-2xl font-bold font-headline text-primary">{product.price.toFixed(3)} KWD</p>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={`/store/${product.id}`}>{t('store.viewProduct')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
