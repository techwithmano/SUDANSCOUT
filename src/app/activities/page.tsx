
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/lib/data';
import ActivitiesView from '@/components/views/ActivitiesView';

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

// The Page component remains a Server Component to fetch data
export default async function ActivitiesPage() {
  const posts = await getPosts();
  return <ActivitiesView posts={posts} />;
}
