import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Scout } from '@/lib/data';
import { notFound } from 'next/navigation';
import MemberProfileView from '@/components/views/MemberProfileView';

async function getScout(id: string): Promise<Scout | null> {
  const scoutRef = doc(db, 'scouts', id);
  const scoutSnap = await getDoc(scoutRef);

  if (!scoutSnap.exists()) {
    return null;
  }
  
  return { id: scoutSnap.id, ...scoutSnap.data() } as Scout;
}

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const scout = await getScout(params.id);

  if (!scout) {
    notFound();
  }

  return <MemberProfileView scout={scout} />;
}
