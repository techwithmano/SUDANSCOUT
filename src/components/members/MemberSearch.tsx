
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export function MemberSearch() {
  const [scoutId, setScoutId] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scoutId.trim()) {
      router.push(`/members/${scoutId.trim()}`);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{t('members.searchTitle')}</CardTitle>
        <CardDescription>{t('members.searchSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={scoutId}
            onChange={(e) => setScoutId(e.target.value)}
            placeholder={t('members.scoutId')}
            aria-label={t('members.scoutId')}
            className="flex-grow"
          />
          <Button type="submit" size="icon" aria-label={t('members.search')} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Search className="h-5 w-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
