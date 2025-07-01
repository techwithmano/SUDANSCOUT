
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

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: (wasSaved: boolean) => void;
  product: Product | null;
}

const ADMIN_EMAIL = 'sudanscoutadmin@scout.com';

export function ProductFormDialog({ isOpen, onClose, product }: ProductFormDialogProps) {
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
        toast({ variant: "destructive", title: "Permission Denied", description: "You are not authorized to save product data." });
        setIsSubmitting(false);
        return;
    }
    
    try {
      if (isEditMode && product) {
        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, data);
        toast({ title: "Success!", description: "Product has been updated." });
      } else {
        await addDoc(collection(db, 'products'), data);
        toast({ title: "Success!", description: "New product has been created." });
      }
      onClose(true); // Signal that a save happened
    } catch (error) {
      console.error("Failed to save product:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Error", description: 'Failed to save product: ' + errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            {isEditMode ? <><Pencil className="h-6 w-6 text-primary" /> Edit Product</> : <><PackagePlus className="h-6 w-6 text-primary" /> Add New Product</>}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? `Editing details for ${product?.name_en}.` : 'Fill in the details for the new product.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name_en" render={({ field }) => (<FormItem><FormLabel>Name (English)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="name_ar" render={({ field }) => (<FormItem><FormLabel>Name (Arabic)</FormLabel><FormControl><Input dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="description_en" render={({ field }) => (<FormItem><FormLabel>Description (English)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description_ar" render={({ field }) => (<FormItem><FormLabel>Description (Arabic)</FormLabel><FormControl><Textarea dir="rtl" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="gear">Gear</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="aiHint" render={({ field }) => (<FormItem><FormLabel>AI Hint (for image search)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? 'Save Changes' : 'Create Product'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
