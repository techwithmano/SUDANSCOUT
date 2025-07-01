
"use client";

import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ruler, ShoppingCart } from 'lucide-react';

const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function ProductDetailView({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { t, locale } = useTranslation();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.category === 'clothing' ? SIZES[0] : undefined
  );

  const productName = (locale === 'ar' ? product.name_ar : product.name_en) || product.name_en || product.name_ar || product.name;
  const productDescription = (locale === 'ar' ? product.description_ar : product.description_en) || product.description_en || product.description_ar || product.description;

  const handleAddToCart = () => {
    if (product.category === 'clothing' && !selectedSize) {
      alert(t('product.selectSize'));
      return;
    }
    addToCart(product, selectedSize);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="rounded-lg overflow-hidden shadow-lg">
          <Image
            src={product.imageUrl}
            alt={productName || product.aiHint}
            width={600}
            height={600}
            className="w-full h-auto object-cover"
            data-ai-hint={product.aiHint}
          />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">{productName}</h1>
          <p className="mt-4 text-3xl font-bold text-foreground">{product.price.toFixed(3)} KWD</p>
          <p className="mt-6 text-muted-foreground">{productDescription}</p>

          {product.category === 'clothing' && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold">{t('product.size')}</h3>
              <RadioGroup
                defaultValue={selectedSize}
                onValueChange={setSelectedSize}
                className="flex gap-2 mt-2"
              >
                {SIZES.map(size => (
                  <div key={size} className="flex items-center">
                    <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                    <Label
                      htmlFor={`size-${size}`}
                      className="flex items-center justify-center rounded-md border-2 border-muted bg-background hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer p-2 h-10 w-10 text-center"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <Button
            size="lg"
            className="mt-8 w-full bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {t('product.addToCart')}
          </Button>

          {product.category === 'clothing' && (
            <div className="mt-12">
              <h3 className="text-xl font-bold font-headline flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" /> {t('product.sizingGuide')}
              </h3>
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('product.size')}</TableHead>
                    <TableHead>{t('product.chest')}</TableHead>
                    <TableHead>{t('product.length')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>S</TableCell><TableCell>34-36"</TableCell><TableCell>28"</TableCell></TableRow>
                  <TableRow><TableCell>M</TableCell><TableCell>38-40"</TableCell><TableCell>29"</TableCell></TableRow>
                  <TableRow><TableCell>L</TableCell><TableCell>42-44"</TableCell><TableCell>30"</TableCell></TableRow>
                  <TableRow><TableCell>XL</TableCell><TableCell>46-48"</TableCell><TableCell>31"</TableCell></TableRow>
                  <TableRow><TableCell>XXL</TableCell><TableCell>50-52"</TableCell><TableCell>32"</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
