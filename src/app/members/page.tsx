
"use client";

import { useAuth } from "@/context/AuthContext";
import { MemberSearch } from "@/components/members/MemberSearch";
import { useTranslation } from "@/context/LanguageContext";
import AllMembersView from "@/components/views/AllMembersView";

const ADMIN_EMAIL = 'sudanscoutadmin@scout.com';

export default function MembersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const isAdmin = user?.email === ADMIN_EMAIL;

  if (isAdmin) {
    return <AllMembersView />;
  }

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{t('members.portalTitle')}</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('members.portalSubtitle')}
        </p>
      </div>
      <div className="mt-12 w-full max-w-md">
        <MemberSearch />
      </div>
    </div>
  );
}
