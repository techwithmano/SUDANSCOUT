
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useTranslation } from '@/context/LanguageContext';
import type { Post } from '@/lib/data';
import { Megaphone, Film, Images } from 'lucide-react';

const formatDate = (isoString: any, locale: string, t: (key: string, params?: any) => string) => {
  if (!isoString?.toDate) return 'Date not available';
  const date = isoString.toDate();
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const AnnouncementCard = ({ post, t, locale }: { post: any, t: any, locale: string }) => (
  <Card className="flex flex-col shadow-lg bg-secondary">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-full">
          <Megaphone className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="font-headline text-xl">{post.title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-muted-foreground">{post.content}</p>
    </CardContent>
    <CardFooter>
      <p className="text-sm text-muted-foreground">
        {t('activities.postedOn', { date: formatDate(post.createdAt, locale, t) })}
      </p>
    </CardFooter>
  </Card>
);

const PhotoCard = ({ post, t, locale }: { post: any, t: any, locale: string }) => (
  <Card className="flex flex-col overflow-hidden shadow-lg group">
    <CardHeader className="p-0 relative">
      <div className="aspect-w-4 aspect-h-3">
        <Image
          src={post.imageUrl}
          alt={post.title}
          width={600}
          height={400}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          data-ai-hint={post.aiHint}
        />
      </div>
    </CardHeader>
    <CardContent className="p-6 flex-grow">
      <CardTitle className="font-headline text-2xl">{post.title}</CardTitle>
      <CardDescription className="mt-2 text-muted-foreground line-clamp-3">{post.content}</CardDescription>
    </CardContent>
    <CardFooter className="p-6 pt-0">
      <p className="text-sm text-muted-foreground">
        {t('activities.postedOn', { date: formatDate(post.createdAt, locale, t) })}
      </p>
    </CardFooter>
  </Card>
);

const VideoCard = ({ post, t, locale }: { post: any, t: any, locale: string }) => {
  const getGoogleDriveEmbedUrl = (url: string): string | null => {
    if (!url || !url.includes('drive.google.com')) return null;
    const match = url.match(/file\/d\/([^/]+)/);
    const fileId = match ? match[1] : null;
    if (!fileId) return null;
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  const embedUrl = getGoogleDriveEmbedUrl(post.videoUrl);

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg group">
      <CardHeader className="p-0 relative">
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
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="font-headline text-2xl">{post.title}</CardTitle>
        <CardDescription className="mt-2 text-muted-foreground line-clamp-3">{post.content}</CardDescription>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <p className="text-sm text-muted-foreground">
          {t('activities.postedOn', { date: formatDate(post.createdAt, locale, t) })}
        </p>
      </CardFooter>
    </Card>
  );
};

const AlbumCard = ({ post, onOpen, t, locale }: { post: any, onOpen: (post: any) => void, t: any, locale: string }) => (
  <Card className="flex flex-col overflow-hidden shadow-lg group cursor-pointer" onClick={() => onOpen(post)}>
    <CardHeader className="p-0 relative">
      <div className="aspect-w-4 aspect-h-3">
        <Image
          src={post.images[0].url}
          alt={post.title}
          width={600}
          height={400}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          data-ai-hint={post.images[0].aiHint}
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-center text-white p-4 rounded-lg">
            <Images className="h-12 w-12 mx-auto" />
            <p className="font-semibold mt-2">{t('activities.viewAlbum')}</p>
            <p className="text-sm">{t('activities.photoCount', { count: post.images.length })}</p>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-6 flex-grow">
      <CardTitle className="font-headline text-2xl">{post.title}</CardTitle>
      <CardDescription className="mt-2 text-muted-foreground line-clamp-3">{post.content}</CardDescription>
    </CardContent>
    <CardFooter className="p-6 pt-0">
      <p className="text-sm text-muted-foreground">
        {t('activities.postedOn', { date: formatDate(post.createdAt, locale, t) })}
      </p>
    </CardFooter>
  </Card>
);

export default function ActivitiesView({ posts }: { posts: Post[] }) {
    const { t, locale } = useTranslation();
    const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);

    const renderPostCard = (post: Post) => {
      switch (post.type) {
        case 'announcement':
          return <AnnouncementCard key={post.id} post={post} t={t} locale={locale} />;
        case 'photo':
          return <PhotoCard key={post.id} post={post} t={t} locale={locale} />;
        case 'video':
          return <VideoCard key={post.id} post={post} t={t} locale={locale} />;
        case 'album':
          return <AlbumCard key={post.id} post={post} onOpen={setSelectedAlbum} t={t} locale={locale} />;
        default:
          return null;
      }
    };

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
                                                    <Image src={image.url} alt={image.aiHint || 'Album image'} layout="fill" objectFit="contain" />
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

                {posts.length > 0 ? (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                        {posts.map(renderPostCard)}
                    </div>
                ) : (
                    <div className="mt-16 text-center text-muted-foreground">
                        <p>{t('activities.noPosts')}</p>
                    </div>
                )}
            </div>
        </>
    )
}
