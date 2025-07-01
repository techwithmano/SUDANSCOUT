
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/context/LanguageContext";
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { CheckoutForm } from '@/components/store/CheckoutForm';

export default function CartView() {
  const { cartItems, removeFromCart, updateQuantity, cartCount, totalPrice } = useCart();
  const { t, locale } = useTranslation();

  if (cartCount === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="mx-auto h-24 w-24 text-primary/30" />
        <h1 className="mt-8 text-4xl font-bold font-headline text-primary">{t('cart.emptyTitle')}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t('cart.emptySubtitle')}</p>
        <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/store">{t('cart.continueShopping')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{t('cart.title')}</h1>
        </div>
        <div className="mt-12 grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-6">
                {cartItems.map(item => {
                    const productName = (locale === 'ar' ? item.name_ar : item.name_en) || item.name_en || item.name_ar || item.name;
                    return (
                        <Card key={`${item.id}-${item.size}`} className="flex items-center p-4">
                            <Image src={item.imageUrl} alt={productName || item.aiHint} width={100} height={100} className="rounded-md object-cover" />
                            <div className="flex-grow mx-4">
                                <h3 className="font-bold">{productName}</h3>
                                {item.size && <p className="text-sm text-muted-foreground">{t('product.size')}: {item.size}</p>}
                                <p className="text-sm font-bold mt-1">{item.price.toFixed(3)} KWD</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}><Minus className="h-4 w-4" /></Button>
                                <Input type="number" value={item.quantity} readOnly className="w-14 text-center" />
                                <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <Button variant="ghost" size="icon" className="ml-4 text-destructive" onClick={() => removeFromCart(item.id, item.size)}>
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </Card>
                    )
                })}
            </div>
            <div className="lg:col-span-1">
                <Card className="shadow-lg sticky top-24">
                    <CardHeader>
                        <CardTitle className="font-headline">{t('cart.orderSummary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('cart.subtotal')} ({cartCount} {t('cart.items')})</span>
                            <span className="font-semibold">{totalPrice.toFixed(3)} KWD</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>{t('cart.total')}</span>
                            <span>{totalPrice.toFixed(3)} KWD</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
        
        <Separator className="my-16" />

        <div id="checkout" className="max-w-3xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">{t('store.checkoutTitle')}</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                    {t('store.checkoutSubtitle')}
                </p>
            </div>
            <div className="mt-8">
                <CheckoutForm />
            </div>
      </div>
    </div>
  )
}
