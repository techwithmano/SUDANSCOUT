
"use client";

import { Button } from '@/components/ui/button';
import { Home, Compass } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto flex h-[calc(100vh-8rem)] items-center justify-center text-center px-4">
      <div>
        <Compass className="mx-auto h-24 w-24 text-primary/30" />
        <h1 className="mt-8 text-4xl font-bold tracking-tight text-primary font-headline sm:text-6xl">
          {t('notFound.title')}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {t('notFound.subtitle')}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              {t('notFound.goHome')}
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/contact">{t('notFound.contactSupport')}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
