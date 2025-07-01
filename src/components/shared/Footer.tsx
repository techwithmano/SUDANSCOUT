
"use client";

import { Instagram, Facebook } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import Image from "next/image";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Image src="/logo.png" alt={t('footer.scoutCentral')} width={24} height={24} />
            <span className="font-bold font-headline text-lg">{t('footer.scoutCentral')}</span>
          </div>
          <div className="text-center md:text-left text-sm">
            <p>&copy; {currentYear} {t('footer.scoutCentral')}. {t('footer.rights')}</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="https://www.facebook.com/share/g/1AC4aV26H4/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
            </Link>
            <Link href="https://www.instagram.com/scoutsudankw/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
            </Link>
            <Link href="https://www.tiktok.com/@scoutsudankw" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="TikTok">
               <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
              >
                <title>TikTok</title>
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.65-6.48-2.31-1.64-1.66-2.34-4.04-2.34-6.42 0-2.54 1.14-4.88 2.89-6.41 1.81-1.56 4.14-2.32 6.51-2.32.01 2.21-.01 4.41.01 6.62-.92.13-1.84.34-2.7.67-1.13.43-2.18.99-3.07 1.71-.92.73-1.56 1.7-1.89 2.86-.25.86-.33 1.77-.21 2.68.17 1.39.77 2.73 1.74 3.71.97.98 2.24 1.56 3.59 1.63 1.41.08 2.83-.28 3.98-1.04.99-.64 1.77-1.57 2.25-2.69.41-.95.59-2.01.59-3.07v-11.4c.02-.3-.02-.6-.05-.89-.04-.33-.1-.65-.19-.97-.08-.27-.2-.54-.33-.79-.13-.26-.28-.51-.45-.75-.17-.24-.36-.47-.56-.68-.2-.21-.42-.41-.65-.59-.23-.18-.47-.35-.72-.51-.25-.16-.52-.3-.79-.43s-.55-.24-.83-.34c-.28-.1-.57-.18-.86-.25-.29-.07-.58-.12-.88-.17zm-1.84 6.57c.92-.02 1.84-.02 2.76 0 .02 2.05.01 4.11.01 6.16-.91.09-1.82.28-2.68.61-1.09.4-2.07.95-2.88 1.65-.54.46-1.01.99-1.39 1.58-.52.83-.8 1.76-.85 2.73-.04.81.08 1.61.32 2.38.41 1.28 1.16 2.45 2.18 3.33 1.05.9 2.33 1.42 3.68 1.47 1.34.05 2.67-.3 3.75-1.07.89-.64 1.59-1.51 2.05-2.52.34-.73.53-1.53.53-2.35 0-2.07-.01-4.13.01-6.2 1.01-.23 2.02-.42 3.02-.63v-2.12c-1.33.22-2.63.56-3.87 1.04-.69.27-1.35.59-1.98.98-2.18 1.33-4.91 1.18-6.99-.37-1.03-.77-1.88-1.74-2.52-2.82-.41-.71-.65-1.5-.7-2.33-.03-.51-.01-1.02.04-1.53.07-.63.21-1.26.42-1.86.29-.83.74-1.59 1.32-2.25.7-.79 1.57-1.42 2.53-1.87.41-.19.83-.35 1.26-.49.43-.14.86-.26 1.3-.35.43-.09.87-.15 1.3-.2.43-.05.86-.08 1.29-.1z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
