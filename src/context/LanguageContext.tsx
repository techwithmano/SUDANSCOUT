
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import translations from '@/locales';

type Locale = 'en' | 'ar';

interface LanguageContextType {
  locale: Locale;
  toggleLocale: () => void;
  t: (key: string, params?: {[key: string]: string}) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Always render with 'ar' on the server and on the initial client render to avoid hydration mismatch.
  const [locale, setLocale] = useState<Locale>('ar');

  // After the component mounts on the client, check localStorage for the user's preference.
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale === 'en' || savedLocale === 'ar') {
      setLocale(savedLocale);
    }
  }, []); // Empty dependency array ensures this runs once on mount, client-side only.

  // This effect handles side-effects when the locale changes (updating HTML tag and localStorage).
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('locale', locale);
  }, [locale]);

  const toggleLocale = () => {
    setLocale(prevLocale => prevLocale === 'en' ? 'ar' : 'en');
  };

  const t = (key: string, params?: {[key: string]: string}) => {
    const keys = key.split('.');
    let result: any = translations[locale];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        result = fallbackResult || key;
        break;
      }
    }
    
    let strResult = String(result);

    if (params) {
      Object.keys(params).forEach(pKey => {
        strResult = strResult.replace(`{${pKey}}`, params[pKey]);
      });
    }
    
    return strResult;
  };

  return (
    <LanguageContext.Provider value={{ locale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
