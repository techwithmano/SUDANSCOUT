
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/data";
import { productSchema } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, PackagePlus, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../ui/dialog";
import { useTranslation } from "@/context/LanguageContext";

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: (wasSaved: boolean) => void;
  product: Product | null;
}

const ADMIN_EMAIL = 'sudanscoutadmin@scout.com';

export function ProductFormDialog({ isOpen, onClose, product }: ProductFormDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      price: '' as any,
      category: undefined,
      imageUrl: 'https://placehold.co/400x300.png',
      aiHint: 'product',
    },
  });

  useEffect(() => {
    if (product) {
      form.reset(product);
    } else {
      form.reset({
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        price: '' as any,
        category: undefined,
        imageUrl: 'https://placehold.co/400x300.png',
        aiHint: 'product',
      });
    }
  }, [product, form, isOpen]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);

    if (auth.currentUser?.email !== ADMIN_EMAIL) {
        toast({ variant: "destructive", title: t('admin.permissionDenied'), description: "You are not authorized to save product data." });
        setIsSubmitting(false);
        return;
    }
    
    try {
      if (isEditMode && product) {
        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, data);
        toast({ title: t('admin.updateSuccess'), description: t('admin.productUpdatedSuccess') });
      } else {
        await addDoc(collection(db, 'products'), data);
        toast({ title: t('admin.updateSuccess'), description: t('admin.productAddedSuccess') });
      }
      onClose(true); // Signal that a save happened
    } catch (error) {
      console.error("Failed to save product:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: t('admin.saveError'), description: t('admin.saveErrorDesc', { error: errorMessage }) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            {isEditMode ? <><Pencil className="h-6 w-6 text-primary" /> {t('admin.editProductTitle')}</> : <><PackagePlus className="h-6 w-6 text-primary" /> {t('admin.addProductTitle')}</>}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? t('admin.editProductDesc', { name: product?.name_en || ''}) : t('admin.addProductDesc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name_en" render={({ field }) => (<FormItem><FormLabel>{t('admin.nameEn')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="name_ar" render={({ field }) => (<FormItem><FormLabel>{t('admin.nameAr')}</FormLabel><FormControl><Input dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="description_en" render={({ field }) => (<FormItem><FormLabel>{t('admin.descEn')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description_ar" render={({ field }) => (<FormItem><FormLabel>{t('admin.descAr')}</FormLabel><FormControl><Textarea dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>{t('admin.price')}</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('admin.category')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={t('admin.selectCategory')} /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="clothing">{t('admin.categoryClothing')}</SelectItem>
                        <SelectItem value="gear">{t('admin.categoryGear')}</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>{t('admin.imageUrl')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="aiHint" render={({ field }) => (<FormItem><FormLabel>{t('admin.aiHint')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">{t('admin.cancel')}</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? t('admin.saveChanges') : t('admin.createMember')}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
