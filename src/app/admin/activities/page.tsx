
"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, getDocs, query, deleteDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/lib/data';
import { PlusCircle, Trash2, Loader2, Edit, Newspaper, Megaphone, Image as ImageIcon, Video, Images } from 'lucide-react';
import { PostFormDialog } from '@/components/admin/PostFormDialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/admin/ConfirmationDialog';

const PostTypeIcon = ({ type }: { type: Post['type']}) => {
  switch (type) {
    case 'announcement': return <Megaphone className="h-4 w-4" />;
    case 'photo': return <ImageIcon className="h-4 w-4" />;
    case 'video': return <Video className="h-4 w-4" />;
    case 'album': return <Images className="h-4 w-4" />;
    default: return null;
  }
}

export default function AdminActivitiesPage() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const { role } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const canManage = role === 'general' || role === 'media';

  async function fetchPosts() {
    setIsLoading(true);
    try {
        const postsCol = collection(db, 'posts');
        const q = query(postsCol, orderBy('createdAt', 'desc'));
        const postsSnapshot = await getDocs(q);
        const postsList = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Post));
        setPosts(postsList);
    } catch (error) {
        console.error("Error fetching posts:", error);
        toast({ variant: 'destructive', title: t('admin.fetchPostsError'), description: t('admin.fetchPostsErrorDesc') });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddNew = () => {
    setEditingPost(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (wasSaved: boolean) => {
    setIsDialogOpen(false);
    if (wasSaved) {
      fetchPosts();
    }
  };
  
  const handleDelete = (postId: string) => {
    if (!canManage) {
        toast({ variant: "destructive", title: t('admin.deletePermissionError'), description: t('admin.deletePermissionErrorDesc') });
        return;
    }
    setPostToDelete(postId);
    setIsConfirmOpen(true);
  };
  
  const executeDelete = async () => {
    if (!postToDelete) return;

    try {
        await deleteDoc(doc(db, 'posts', postToDelete));
        toast({ title: t('admin.postDeletedSuccess') });
        await fetchPosts();
    } catch (error) {
        console.error("Failed to delete post:", error);
        const errorMessage = error instanceof Error ? error.message : t('admin.unknownError');
        toast({ variant: 'destructive', title: t('admin.postDeletedError'), description: errorMessage });
    }
  };


  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US');
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title={t('admin.confirmDeletePostTitle')}
        description={t('admin.confirmDeletePostDesc')}
      />
      <PostFormDialog 
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        post={editingPost}
      />
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary flex items-center justify-center sm:justify-start gap-3">
                  <Newspaper className="h-10 w-10" /> {t('admin.activitiesTitle')}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">{t('admin.activitiesSubtitle')}</p>
            </div>
            {canManage && (
              <Button onClick={handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('admin.addPostTitle')}
              </Button>
            )}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="font-headline text-xl">{t('admin.existingPosts')}</CardTitle>
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
                          <TableHead className={cn(locale === 'ar' ? 'text-right' : 'text-left')}>{t('admin.postTitle')}</TableHead>
                          <TableHead>{t('admin.postType')}</TableHead>
                          <TableHead>Created At</TableHead>
                          {canManage && <TableHead className={cn(locale === 'ar' ? 'text-left' : 'text-right')}>{t('memberProfile.action')}</TableHead>}
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {posts.map((post) => (
                          <TableRow key={post.id}>
                              <TableCell className={cn("font-medium", locale === 'ar' ? 'text-right' : 'text-left')}>
                                {post.title}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="gap-1.5">
                                  <PostTypeIcon type={post.type} />
                                  {t(`admin.type${post.type.charAt(0).toUpperCase() + post.type.slice(1)}`)}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(post.createdAt as Timestamp)}</TableCell>
                              {canManage && (
                                <TableCell className={cn(locale === 'ar' ? 'text-left' : 'text-right')}>
                                  <div className="flex gap-2 justify-end">
                                      <Button variant="outline" size="icon" onClick={() => handleEdit(post)}>
                                          <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="destructive" size="icon" onClick={() => handleDelete(post.id)}>
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
