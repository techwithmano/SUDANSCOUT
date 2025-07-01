
"use client";

import { notFound } from "next/navigation";
import Image from 'next/image';
import Link from "next/link";
import { Cake, Home, Users, Edit } from 'lucide-react';
import { PaymentSection } from '@/components/members/PaymentSection';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import type { Scout } from "@/lib/data";

const ADMIN_EMAIL = 'sudanscoutadmin@scout.com';

export default function MemberProfileView({ scout }: { scout: Scout }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  if (!scout) {
    notFound();
  }
  
  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="overflow-hidden shadow-lg">
        <div className="bg-primary/10 p-8 md:flex md:items-center md:gap-8 relative">
            <Avatar className="h-32 w-32 border-4 border-card shadow-md mx-auto md:mx-0">
                <AvatarImage src={scout.imageUrl} alt={scout.fullName} data-ai-hint="portrait" />
                <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                    {getInitials(scout.fullName)}
                </AvatarFallback>
            </Avatar>
            <div className="mt-4 md:mt-0 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">{scout.fullName}</h1>
                <p className="text-lg text-muted-foreground">{t('memberProfile.scoutId')}: {scout.id}</p>
            </div>
            {isAdmin && (
              <Button asChild size="sm" className="absolute top-4 right-4">
                <Link href={`/admin/members/${scout.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('admin.editProfile')}
                </Link>
              </Button>
            )}
        </div>

        <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                    <Cake className="h-6 w-6 text-primary" />
                    <div>
                        <p className="font-semibold">{t('memberProfile.birthDate')}</p>
                        <p className="text-muted-foreground">{new Date(scout.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                    <div>
                        <p className="font-semibold">{t('memberProfile.group')}</p>
                        <p className="text-muted-foreground">{scout.group}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                    <Home className="h-6 w-6 text-primary" />
                    <div>
                        <p className="font-semibold">{t('memberProfile.address')}</p>
                        <p className="text-muted-foreground">{scout.address}</p>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold font-headline text-primary">{t('memberProfile.paymentStatus')}</h2>
                <PaymentSection scoutId={scout.id} initialPayments={scout.payments} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
