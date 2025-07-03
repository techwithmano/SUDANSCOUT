
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@/lib/data";
import { postSchema } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Newspaper, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { addDoc, collection, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../ui/dialog";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormDialogProps {
  isOpen: boolean;
  onClose: (wasSaved: boolean) => void;
  post: Post | null;
}

export function PostFormDialog({ isOpen, onClose, post }: PostFormDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { role } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!post;
  const canManage = role === 'general' || role === 'media';

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      imageUrl: 'https://placehold.co/600x400.png',
      aiHint: 'scouts event',
      createdAt: null,
    },
  });

  useEffect(() => {
    if (post) {
      form.reset(post);
    } else {
      form.reset({
        title: '',
        content: '',
        imageUrl: 'https://placehold.co/600x400.png',
        aiHint: 'scouts event',
        createdAt: null,
      });
    }
  }, [post, form, isOpen]);

  const onSubmit = async (data: PostFormValues) => {
    setIsSubmitting(true);

    if (!canManage) {
        toast({ variant: "destructive", title: t('admin.permissionDenied'), description: t('admin.permissionDeniedDesc') });
        setIsSubmitting(false);
        return;
    }
    
    try {
      if (isEditMode && post) {
        const postRef = doc(db, 'posts', post.id);
        await updateDoc(postRef, { ...data, createdAt: post.createdAt }); // Keep original timestamp on edit
        toast({ title: t('admin.updateSuccess'), description: t('admin.postUpdatedSuccess') });
      } else {
        await addDoc(collection(db, 'posts'), { ...data, createdAt: serverTimestamp() });
        toast({ title: t('admin.updateSuccess'), description: t('admin.postAddedSuccess') });
      }
      onClose(true);
    } catch (error) {
      console.error("Failed to save post:", error);
      const errorMessage = error instanceof Error ? error.message : t('admin.unknownError');
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
            {isEditMode ? <><Pencil className="h-6 w-6 text-primary" /> {t('admin.editPostTitle')}</> : <><Newspaper className="h-6 w-6 text-primary" /> {t('admin.addPostTitle')}</>}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>{t('admin.postTitle')}</FormLabel><FormControl><Input placeholder={t('admin.postTitlePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="content" render={({ field }) => (<FormItem><FormLabel>{t('admin.postContent')}</FormLabel><FormControl><Textarea placeholder={t('admin.postContentPlaceholder')} rows={10} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>{t('admin.imageUrl')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="aiHint" render={({ field }) => (<FormItem><FormLabel>{t('admin.aiHint')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">{t('admin.cancel')}</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? t('admin.saveChanges') : t('admin.createPost')}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
