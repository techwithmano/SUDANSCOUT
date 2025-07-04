
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@/lib/data";
import { postSchema } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Newspaper, Pencil, PlusCircle, Trash2, Megaphone, Image as ImageIcon, Video, Images } from "lucide-react";
import { useEffect, useState } from "react";
import { addDoc, collection, doc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../ui/dialog";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "@/components/ui/label";

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormDialogProps {
  isOpen: boolean;
  onClose: (wasSaved: boolean) => void;
  post: Post | null;
}

const getDefaultValues = (post: Post | null): PostFormValues => {
  if (post) {
    // Ensure the structure matches the discriminated union
    switch (post.type) {
      case 'announcement':
        return { type: 'announcement', title: post.title, content: post.content, createdAt: post.createdAt };
      case 'photo':
        return { type: 'photo', title: post.title, content: post.content, imageUrl: post.imageUrl, aiHint: post.aiHint, createdAt: post.createdAt };
      case 'video':
        return { type: 'video', title: post.title, content: post.content, videoUrl: post.videoUrl, createdAt: post.createdAt };
      case 'album':
        return { type: 'album', title: post.title, content: post.content, images: post.images, createdAt: post.createdAt };
      default:
        // Fallback for safety, though it shouldn't be reached with proper data
        return { type: 'announcement', title: '', content: '' };
    }
  }
  // Default for creating a new post
  return { type: 'announcement', title: '', content: '' };
};

export function PostFormDialog({ isOpen, onClose, post }: PostFormDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { role } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!post;
  const canManage = role === 'general' || role === 'media';

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: getDefaultValues(post),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images" as any, // Cast to any to handle discriminated union
  });

  const postType = form.watch("type");

  useEffect(() => {
    form.reset(getDefaultValues(post));
  }, [post, form, isOpen]);

  const onSubmit = async (data: PostFormValues) => {
    setIsSubmitting(true);
    if (!canManage) {
        toast({ variant: "destructive", title: t('admin.permissionDenied'), description: t('admin.permissionDeniedDesc') });
        setIsSubmitting(false);
        return;
    }
    
    try {
      const dataToSave = { ...data };

      if (isEditMode && post) {
        const postRef = doc(db, 'posts', post.id);
        // Ensure original timestamp is preserved on edit
        await updateDoc(postRef, { ...dataToSave, createdAt: post.createdAt || serverTimestamp() });
        toast({ title: t('admin.updateSuccess'), description: t('admin.postUpdatedSuccess') });
      } else {
        await addDoc(collection(db, 'posts'), { ...dataToSave, createdAt: serverTimestamp() });
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            {isEditMode ? <><Pencil className="h-6 w-6 text-primary" /> {t('admin.editPostTitle')}</> : <><Newspaper className="h-6 w-6 text-primary" /> {t('admin.addPostTitle')}</>}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1 pr-4">
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('admin.postType')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      <FormItem>
                        <RadioGroupItem value="announcement" id="r1" className="sr-only peer" />
                        <Label htmlFor="r1" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                          <Megaphone className="mb-3 h-6 w-6" /> {t('admin.typeAnnouncement')}
                        </Label>
                      </FormItem>
                      <FormItem>
                        <RadioGroupItem value="photo" id="r2" className="sr-only peer" />
                         <Label htmlFor="r2" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                          <ImageIcon className="mb-3 h-6 w-6" /> {t('admin.typePhoto')}
                        </Label>
                      </FormItem>
                      <FormItem>
                        <RadioGroupItem value="video" id="r3" className="sr-only peer" />
                         <Label htmlFor="r3" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                          <Video className="mb-3 h-6 w-6" /> {t('admin.typeVideo')}
                        </Label>
                      </FormItem>
                      <FormItem>
                        <RadioGroupItem value="album" id="r4" className="sr-only peer" />
                         <Label htmlFor="r4" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                          <Images className="mb-3 h-6 w-6" /> {t('admin.typeAlbum')}
                        </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>{t('admin.postTitle')}</FormLabel><FormControl><Input placeholder={t('admin.postTitlePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="content" render={({ field }) => (<FormItem><FormLabel>{t('admin.postContent')}</FormLabel><FormControl><Textarea placeholder={t('admin.postContentPlaceholder')} rows={5} {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            {postType === 'photo' && (
              <>
                <FormField control={form.control} name="imageUrl" render={({ field }) => (<FormItem><FormLabel>{t('admin.imageUrl')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="aiHint" render={({ field }) => (<FormItem><FormLabel>{t('admin.aiHint')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </>
            )}

            {postType === 'video' && (
              <FormField control={form.control} name="videoUrl" render={({ field }) => (<FormItem><FormLabel>{t('admin.videoUrl')}</FormLabel><FormControl><Input placeholder={t('admin.videoUrlPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
            )}

            {postType === 'album' && (
              <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-medium">{t('admin.albumImages')}</h3>
                 {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end border bg-muted/50 p-3 rounded-lg">
                      <FormField control={form.control} name={`images.${index}.url`} render={({ field }) => (<FormItem><FormLabel>{t('admin.imageUrl')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`images.${index}.aiHint`} render={({ field }) => (<FormItem><FormLabel>{t('admin.aiHint')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ url: '', aiHint: '' })}><PlusCircle className="mr-2 h-4 w-4" /> {t('admin.addAlbumImage')}</Button>
              </div>
            )}

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
