
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/lib/data';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';

export const dynamic = 'force-dynamic';

async function getPosts(): Promise<Post[]> {
  const postsCol = collection(db, 'posts');
  const q = query(postsCol, orderBy('createdAt', 'desc'));
  const postsSnapshot = await getDocs(q);
  const postsList = postsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamp to a serializable format (ISO string)
      createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Post;
  });
  return postsList;
}

// Client component to handle translation and date formatting
function PostCard({ post }: { post: Post }) {
  const { t, locale } = useTranslation();

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg">
      <CardHeader className="p-0">
        <div className="aspect-w-16 aspect-h-9">
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={600}
            height={400}
            className="object-cover w-full h-full"
            data-ai-hint={post.aiHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="font-headline text-2xl">{post.title}</CardTitle>
        <CardDescription className="mt-2 text-muted-foreground line-clamp-3">{post.content}</CardDescription>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {t('activities.postedOn', { date: formatDate(post.createdAt) })}
        </p>
      </CardFooter>
    </Card>
  );
}

// This wrapper component is needed because we can't use hooks directly in a server component.
function ActivitiesView({ posts }: { posts: Post[] }) {
    const { t } = useTranslation();

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{t('activities.title')}</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('activities.subtitle')}
                </p>
            </div>

            {posts.length > 0 ? (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
                </div>
            ) : (
                <div className="mt-16 text-center text-muted-foreground">
                    <p>{t('activities.noPosts')}</p>
                </div>
            )}
        </div>
    )
}

// The Page component remains a Server Component to fetch data
export default async function ActivitiesPage() {
  const posts = await getPosts();
  return <ActivitiesView posts={posts} />;
}
