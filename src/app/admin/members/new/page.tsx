
"use client";

import MemberForm from '@/components/admin/MemberForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewMemberPage() {
  const router = useRouter();

  const handleSaveSuccess = () => {
    router.push('/members');
  };

  return (
    <div className="container mx-auto px-4 py-16">
       <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Add New Member
          </CardTitle>
        </CardHeader>
        <CardContent>
            <MemberForm onSaveSuccess={handleSaveSuccess} />
        </CardContent>
       </Card>
    </div>
  );
}
