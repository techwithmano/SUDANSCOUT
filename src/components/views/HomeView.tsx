
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type Product } from '@/lib/data';
import { ArrowRight, Tent, Map, Compass } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';

export default function HomeView({ featuredProducts }: { featuredProducts: Product[]}) {
  const { t, locale } = useTranslation();

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white bg-primary/20">
        <Image
          src="/Home_pic1.jpg"
          alt="Scouts in nature"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0 opacity-40"
          data-ai-hint="scouts nature"
        />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary-foreground drop-shadow-lg">
            {t('home.heroTitle')}
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-primary-foreground/90 drop-shadow-md">
            {t('home.heroSubtitle')}
          </p>
          <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/about">{t('home.learnMore')} <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      <section id="about" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">{t('home.aboutTitle')}</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('home.aboutText')}
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center p-4 rounded-lg bg-card">
                <Tent className="h-10 w-10 text-primary" />
                <h3 className="mt-2 font-headline font-semibold">{t('home.featureOutdoor')}</h3>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-card">
                <Map className="h-10 w-10 text-primary" />
                <h3 className="mt-2 font-headline font-semibold">{t('home.featureCommunity')}</h3>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-card">
                <Compass className="h-10 w-10 text-primary" />
                <h3 className="mt-2 font-headline font-semibold">{t('home.featureLeadership')}</h3>
              </div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-2xl">
            <Image
              src="/Home_pic2.png"
              alt="Scouts around a campfire"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      <section id="store" className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">{t('home.storeTitle')}</h2>
            <p className="mt-2 text-lg text-muted-foreground">{t('home.storeSubtitle')}</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => {
               const productName = (locale === 'ar' ? product.name_ar : product.name_en) || product.name_en || product.name_ar || product.name;
               return (
                <Card key={product.id} className="flex flex-col overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <CardHeader className="p-0">
                    <Image src={product.imageUrl} alt={productName || product.aiHint} width={400} height={300} className="w-full h-48 object-cover" data-ai-hint={product.aiHint}/>
                  </CardHeader>
                  <CardContent className="flex-grow pt-6">
                    <CardTitle className="font-headline text-xl">{productName}</CardTitle>
                    <CardDescription className="mt-2 text-primary font-bold text-lg">{product.price.toFixed(3)} KWD</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link href="/store">{t('home.viewInStore')}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            )}
          </div>
        </div>
      </section>
      
      <section id="members" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-headline font-bold">{t('home.membersTitle')}</h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.membersSubtitle')}
          </p>
          <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/members">{t('home.goToPortal')} <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
