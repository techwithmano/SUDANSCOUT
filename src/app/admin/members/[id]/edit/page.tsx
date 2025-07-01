
"use client";

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Scout } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import MemberForm from '@/components/admin/MemberForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// This function can remain a server-side utility, but the component needs to be a client component
async function getScout(id: string): Promise<Scout | null> {
  const scoutRef = doc(db, 'scouts', id);
  const scoutSnap = await getDoc(scoutRef);

  if (!scoutSnap.exists()) {
    return null;
  }
  
  return { id: scoutSnap.id, ...scoutSnap.data() } as Scout;
}


export default function EditMemberPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [scout, setScout] = useState<Scout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScout(params.id).then(scoutData => {
      if (!scoutData) {
        notFound();
      } else {
        setScout(scoutData);
      }
      setLoading(false);
    });
  }, [params.id]);

  const handleSaveSuccess = () => {
    router.push('/members');
  };
  
  if (loading) {
      return (
          <div className="container mx-auto px-4 py-16">
             <Card className="max-w-4xl mx-auto shadow-lg">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
             </Card>
          </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-16">
       <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <UserCog className="h-6 w-6 text-primary" />
            Edit Member Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
            <MemberForm scout={scout} onSaveSuccess={handleSaveSuccess} />
        </CardContent>
       </Card>
    </div>
  );
}
