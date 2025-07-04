
"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, getDocs, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/data';
import { PlusCircle, Trash2, Loader2, ShieldCheck, Edit, Newspaper } from 'lucide-react';
import Image from 'next/image';
import { ProductFormDialog } from '@/components/admin/ProductFormDialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { ConfirmationDialog } from '@/components/admin/ConfirmationDialog';

export default function AdminProductsPage() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const { role } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const canManage = role === 'general' || role === 'finance' || role === 'custodian';

  async function fetchProducts() {
    setIsLoading(true);
    try {
        const productsCol = collection(db, 'products');
        const q = query(productsCol);
        const productsSnapshot = await getDocs(q);
        const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        } as Product));
        setProducts(productsList);
    } catch (error) {
        console.error("Error fetching products:", error);
        toast({ variant: 'destructive', title: t('admin.fetchProductsError'), description: t('admin.fetchProductsErrorDesc') });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (wasSaved: boolean) => {
    setIsDialogOpen(false);
    if (wasSaved) {
      fetchProducts(); // Refresh the list if a change was made
    }
  };
  
  const handleDelete = (productId: string) => {
    setProductToDelete(productId);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    if (!canManage) {
        toast({ variant: "destructive", title: t('admin.deletePermissionError'), description: t('admin.deletePermissionErrorDesc') });
        return;
    }
    try {
        await deleteDoc(doc(db, 'products', productToDelete));
        toast({ title: t('admin.productDeletedSuccess') });
        await fetchProducts(); // Refetch products
    } catch (error) {
        console.error("Failed to delete product:", error);
        const errorMessage = error instanceof Error ? error.message : t('admin.unknownError');
        toast({ variant: 'destructive', title: t('admin.productDeletedError'), description: errorMessage });
    }
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title={t('admin.confirmDeleteProductTitle')}
        description={t('admin.confirmDeleteProductDesc')}
      />
      <ProductFormDialog 
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        product={editingProduct}
      />
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary flex items-center justify-center sm:justify-start gap-3">
                  <ShieldCheck className="h-10 w-10" /> {t('admin.productsTitle')}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">{t('admin.productsSubtitle')}</p>
            </div>
            {canManage && (
              <Button onClick={handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('admin.addProductTitle')}
              </Button>
            )}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="font-headline text-xl">{t('admin.existingProducts')}</CardTitle>
          </CardHeader>
          <CardContent>
              {isLoading ? (
                  <div className="flex justify-center items-center h-48">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
              ) : (
              <div className="border rounded-md overflow-x-auto">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className={cn(locale === 'ar' ? 'text-right' : 'text-left')}>{t('admin.product')}</TableHead>
                          <TableHead className={cn(locale === 'ar' ? 'text-right' : 'text-left')}>{t('admin.category')}</TableHead>
                          <TableHead className={cn(locale === 'ar' ? 'text-right' : 'text-left')}>{t('admin.price')}</TableHead>
                          {canManage && <TableHead className={cn(locale === 'ar' ? 'text-left' : 'text-right')}>{t('memberProfile.action')}</TableHead>}
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {products.map((product) => (
                          <TableRow key={product.id}>
                              <TableCell className={cn("font-medium flex items-center gap-3", locale === 'ar' ? 'text-right' : 'text-left')}>
                                  <Image src={product.imageUrl} alt={product.name_en || product.aiHint} width={40} height={40} className="rounded-sm object-cover" />
                                  <span>{product.name_en} / {product.name_ar}</span>
                              </TableCell>
                              <TableCell className={cn(locale === 'ar' ? 'text-right' : 'text-left')}>{t(`admin.category${product.category.charAt(0).toUpperCase() + product.category.slice(1)}`)}</TableCell>
                              <TableCell className={cn(locale === 'ar' ? 'text-right' : 'text-left')}>{product.price.toFixed(3)} KWD</TableCell>
                              {canManage && (
                                <TableCell className={cn(locale === 'ar' ? 'text-left' : 'text-right')}>
                                  <div className="flex gap-2 justify-end">
                                      <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                                          <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                  </div>
                                </TableCell>
                              )}
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
              </div>
              )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
