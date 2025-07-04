
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Loader2, Newspaper, Pencil, Megaphone, Image as ImageIcon, Video, Images } from "lucide-react";
import { useEffect, useState } from "react";
import { addDoc, collection, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/dialog";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "@/components/ui/label";

// A more flexible schema for the form itself
const postFormSchema = z.object({
  type: z.enum(['announcement', 'photo', 'video', 'album']),
  title: z.string().min(3, "Title is required"),
  content: z.string().min(10, "Content is required"),
  imageUrl: z.string().optional(),
  aiHint: z.string().optional(),
  videoUrl: z.string().optional(),
  imageUrls: z.string().optional(), // Textarea for album URLs
}).superRefine((data, ctx) => {
  if (data.type === 'photo' && !z.string().url().safeParse(data.imageUrl).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A valid image URL is required", path: ['imageUrl'] });
  }
  if (data.type === 'video' && !z.string().url().safeParse(data.videoUrl).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A valid YouTube embed URL is required", path: ['videoUrl'] });
  }
  if (data.type === 'album' && (!data.imageUrls || data.imageUrls.trim().length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please paste at least one image URL.", path: ['imageUrls'] });
  }
});

type PostFormValues = z.infer<typeof postFormSchema>;

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
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      type: 'announcement',
      title: '',
      content: '',
      imageUrl: '',
      aiHint: '',
      videoUrl: '',
      imageUrls: '',
    },
  });

  const postType = form.watch("type");

  useEffect(() => {
    if (isOpen) {
      if (post) { // Editing existing post
        if (post.type === 'album') {
          form.reset({
            type: 'album',
            title: post.title,
            content: post.content,
            imageUrls: (post.images || []).map(img => img.url).join('\n'),
          });
        } else {
          form.reset(post as any);
        }
      } else { // Creating new post
        form.reset({
          type: 'announcement',
          title: '',
          content: '',
          imageUrl: '',
          aiHint: '',
          videoUrl: '',
          imageUrls: '',
        });
      }
    }
  }, [isOpen, post, form]);


  const onSubmit = async (data: PostFormValues) => {
    setIsSubmitting(true);
    if (!canManage) {
        toast({ variant: "destructive", title: t('admin.permissionDenied'), description: t('admin.permissionDeniedDesc') });
        setIsSubmitting(false);
        return;
    }
    
    try {
      let dataToSave: any = { type: data.type, title: data.title, content: data.content };
            
      if(data.type === 'photo') {
        dataToSave.imageUrl = data.imageUrl;
        dataToSave.aiHint = data.aiHint;
      } else if (data.type === 'video') {
        dataToSave.videoUrl = data.videoUrl;
      } else if (data.type === 'album') {
        const urls = data.imageUrls!.split('\n').map(url => url.trim()).filter(Boolean);
        if (urls.length === 0 || !urls.every(u => u.startsWith('http'))) {
            toast({ variant: 'destructive', title: 'Invalid URLs', description: 'Please provide valid, full URLs for the album images, one per line.' });
            setIsSubmitting(false);
            return;
        }
        dataToSave.images = urls.map(url => ({ url, aiHint: 'scout photo' }));
      }
      
      const dbSchemaCheck = postSchema.safeParse(dataToSave);
      if (!dbSchemaCheck.success) {
          console.error("Data validation failed before saving:", dbSchemaCheck.error);
          toast({ variant: 'destructive', title: 'Validation Error', description: 'The data to be saved is invalid.' });
          setIsSubmitting(false);
          return;
      }
      
      const finalData = dbSchemaCheck.data;

      if (isEditMode && post) {
        const postRef = doc(db, 'posts', post.id);
        await updateDoc(postRef, { ...finalData, createdAt: post.createdAt || serverTimestamp() });
        toast({ title: t('admin.updateSuccess'), description: t('admin.postUpdatedSuccess') });
      } else {
        await addDoc(collection(db, 'posts'), { ...finalData, createdAt: serverTimestamp() });
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
                      value={field.value}
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
              <FormField control={form.control} name="imageUrls" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.albumImages')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={"Paste one image link per line..."}
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload your images to a site like Postimages.org and paste all the direct links here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
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
