
"use client";

import { type Product } from "@/lib/data";
import { ProductCard } from "@/components/store/ProductCard";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function StoreView({ products }: { products: Product[] }) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const canManageStore = role === 'general' || role === 'finance' || role === 'custodian';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{t('store.mainTitle')}</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          {t('store.mainSubtitle')}
        </p>

        {canManageStore && (
          <div className="mt-8">
            <Button asChild>
              <Link href="/admin/products">
                <ShieldCheck className="mr-2 h-5 w-5" />
                {t('admin.manageProducts')}
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
