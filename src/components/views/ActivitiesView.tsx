
"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useTranslation } from '@/context/LanguageContext';
import type { Post } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Film, Images, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formatDate = (dateValue: any, locale: string, t: (key: string, params?: any) => string) => {
  if (!dateValue) return t('activities.dateUnavailable');
  
  let date;
  // Handle ISO strings from server components & client-side fetches
  if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else if (dateValue.toDate) { // Handle Firestore Timestamps from older components if any
    date = dateValue.toDate();
  } else {
    return t('activities.dateUnavailable');
  }

  // Check if the date is valid after creation
  if (isNaN(date.getTime())) {
    return t('activities.dateUnavailable');
  }
  
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


const PostHeader = ({ post, t, locale }: { post: any; t: any; locale: string }) => (
  <div className="flex items-center gap-3 p-4">
    <Avatar>
      <AvatarImage src="/logo.png" alt="Scout Logo" />
      <AvatarFallback>SSG</AvatarFallback>
    </Avatar>
    <div>
      <p className="font-semibold font-headline text-primary">Sudan Scouts and Guides in Kuwait</p>
      <p className="text-xs text-muted-foreground">
        {t('activities.postedOn', { date: formatDate(post.createdAt, locale, t) })}
      </p>
    </div>
  </div>
);

const getGoogleDriveEmbedUrl = (url: string): string | null => {
    if (!url || !url.includes('drive.google.com')) return null;
    const match = url.match(/file\/d\/([^/]+)/);
    const fileId = match ? match[1] : null;
    if (!fileId) return null;
    return `https://drive.google.com/file/d/${fileId}/preview`;
};

const AlbumGrid = ({ images, onOpen }: { images: { url: string; aiHint?: string }[]; onOpen: () => void }) => {
    const photoCount = images.length;

    if (photoCount === 0) return null;

    const renderImage = (img: { url: string; aiHint?: string }, index: number, className = "") => (
        <div key={index} className={cn("relative cursor-pointer group overflow-hidden bg-secondary", className)} onClick={onOpen}>
            <Image
                src={img.url}
                alt={img.aiHint || `Album photo ${index + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
        </div>
    );
    
    const renderOverlay = (count: number) => (
       <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold cursor-pointer" onClick={onOpen}>
           +{count}
       </div>
    );

    if (photoCount === 1) {
        return <div className="aspect-[4/3]">{renderImage(images[0], 0)}</div>;
    }

    if (photoCount === 2) {
        return (
            <div className="grid grid-cols-2 gap-1 aspect-[4/3]">
                {images.map((img, i) => renderImage(img, i))}
            </div>
        );
    }
    
    if (photoCount === 3) {
        return (
            <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-[4/3]">
                {renderImage(images[0], 0, "col-span-2 row-span-1")}
                {renderImage(images[1], 1, "col-span-1 row-span-1")}
                {renderImage(images[2], 2, "col-span-1 row-span-1")}
            </div>
        );
    }
    
    if (photoCount === 4) {
        return (
            <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-[4/3]">
                {images.map((img, i) => renderImage(img, i))}
            </div>
        );
    }
    
    // 5 or more photos
    return (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 aspect-[4/3]">
            {images.slice(0, 3).map((img, i) => renderImage(img, i))}
            <div className="relative">
                {renderImage(images[3], 3)}
                {renderOverlay(photoCount - 4)}
            </div>
        </div>
    );
};


const PostCard = ({ post, t, locale, onAlbumOpen }: { post: Post; t: any; locale: string; onAlbumOpen: (post: Post) => void }) => {
  const embedUrl = post.type === 'video' ? getGoogleDriveEmbedUrl(post.videoUrl) : null;
  const isAnnouncement = post.type === 'announcement';

  return (
    <Card className="shadow-md overflow-hidden">
      <PostHeader post={post} t={t} locale={locale} />
      
      <div className={cn("px-4 pb-4", isAnnouncement && "bg-secondary/50")}>
        <h2 className={cn("text-xl font-semibold mb-2", isAnnouncement && "text-primary")}>{post.title}</h2>
        <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.type === 'photo' && (
        <div className="w-full bg-secondary">
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={700}
            height={500}
            className="w-full h-auto object-contain max-h-[70vh]"
            data-ai-hint={post.aiHint}
          />
        </div>
      )}

      {post.type === 'video' && (
        <div className="aspect-video bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={post.title}
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white bg-gray-800">
              <Film className="h-12 w-12" />
            </div>
          )}
        </div>
      )}

      {post.type === 'album' && (
        <div className="pt-0">
          <AlbumGrid images={post.images} onOpen={() => onAlbumOpen(post)} />
        </div>
      )}
    </Card>
  );
};

export default function ActivitiesView({ posts }: { posts: Post[] }) {
    const { t, locale } = useTranslation();
    const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

    const filteredAndSortedPosts = useMemo(() => {
        return posts
            .filter(post => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                const titleMatch = post.title.toLowerCase().includes(query);
                const contentMatch = post.content.toLowerCase().includes(query);
                return titleMatch || contentMatch;
            })
            .sort((a, b) => {
                const dateA = new Date(a.createdAt as string).getTime();
                const dateB = new Date(b.createdAt as string).getTime();

                if (sortOrder === 'newest') {
                    return dateB - dateA;
                } else {
                    return dateA - dateB;
                }
            });
    }, [posts, searchQuery, sortOrder]);

    return (
        <>
            <Dialog open={!!selectedAlbum} onOpenChange={(isOpen) => !isOpen && setSelectedAlbum(null)}>
                <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
                    {selectedAlbum && (
                        <div className="flex flex-col h-full">
                           <DialogHeader className="p-4 border-b">
                                <DialogTitle className="font-headline">{selectedAlbum.title}</DialogTitle>
                           </DialogHeader>
                           <div className="flex-grow p-4 md:p-8 flex items-center justify-center">
                                <Carousel className="w-full max-w-2xl">
                                    <CarouselContent>
                                        {selectedAlbum.images.map((image: any, index: number) => (
                                            <CarouselItem key={index}>
                                                <div className="relative h-[75vh]">
                                                    <Image src={image.url} alt={image.aiHint || 'Album image'} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain" />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                                </Carousel>
                           </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{t('activities.title')}</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        {t('activities.subtitle')}
                    </p>
                </div>

                <div className="mt-8 mb-12 max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className={cn("absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground", locale === 'ar' ? 'right-3' : 'left-3')} />
                        <Input
                            type="text"
                            placeholder={t('activities.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(locale === 'ar' ? 'pr-10' : 'pl-10', "w-full")}
                        />
                    </div>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder={t('activities.sortBy')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">{t('activities.sortNewest')}</SelectItem>
                            <SelectItem value="oldest">{t('activities.sortOldest')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {filteredAndSortedPosts.length > 0 ? (
                    <div className="max-w-2xl mx-auto space-y-8">
                        {filteredAndSortedPosts.map(post => (
                           <PostCard 
                                key={post.id}
                                post={post}
                                t={t}
                                locale={locale}
                                onAlbumOpen={setSelectedAlbum}
                           />
                        ))}
                    </div>
                ) : (
                    <div className="mt-16 text-center text-muted-foreground">
                        <p>{searchQuery ? t('activities.noResults') : t('activities.noPosts')}</p>
                    </div>
                )}
            </div>
        </>
    )
}
