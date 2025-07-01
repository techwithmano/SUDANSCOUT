
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Languages, ShoppingCart, LogOut, ShieldCheck, Users, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image";

const ADMIN_EMAIL = 'sudanscoutadmin@scout.com';

export function Header() {
  const { t, toggleLocale, locale } = useTranslation();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const navItems = [
    { href: "/", label: t('header.home') },
    { href: "/about", label: t('header.about') },
    { href: "/store", label: t('header.store') },
    { href: "/members", label: t('header.members') },
    { href: "/contact", label: t('header.contact') },
  ];
  
  const handleLogout = async () => {
    await auth.signOut();
  }

  const NavLink = ({ href, label, className }: { href: string; label: string; className?: string }) => (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        pathname === href ? "text-primary font-bold" : "text-muted-foreground",
        className
      )}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold font-headline text-primary">
          <Image src="/logo.png" alt={t('header.scoutCentral')} width={32} height={32} />
          <span className="hidden lg:inline-block text-base lg:text-lg whitespace-nowrap">{t('header.scoutCentral')}</span>
          <span className="lg:hidden text-sm">{locale === 'ar' ? 'الكشافة' : 'Scouts'}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Cart Icon */}
          <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {cartCount}
                      </Badge>
                  )}
                  <span className="sr-only">{t('header.viewCart')}</span>
              </Link>
          </Button>
            
          {/* Admin Menu / Login */}
          {isAdmin ? (
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t('admin.adminMenu')}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><Link href="/members"><Users className="mr-2 h-4 w-4" />{t('admin.allMembersTitle')}</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/admin/products"><Package className="mr-2 h-4 w-4" />{t('admin.manageProducts')}</Link></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>{t('admin.logout')}</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          ) : (
              <Button asChild variant="ghost" size="icon">
                  <Link href="/admin">
                      <ShieldCheck className="h-5 w-5" />
                      <span className="sr-only">{t('admin.loginTitle')}</span>
                  </Link>
              </Button>
          )}

          {/* Desktop Language Switcher */}
          <div className="hidden lg:block">
            <Button variant="ghost" size="sm" onClick={toggleLocale} className="flex items-center gap-2">
              <Languages className="h-5 w-5"/>
              <span>{t('header.switchLanguage')}</span>
            </Button>
          </div>
          
          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] flex flex-col p-0">
               <SheetHeader className="p-6 pb-4 border-b">
                 <SheetTitle>
                   <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                      <Image src="/logo.png" alt={t('header.scoutCentral')} width={32} height={32} />
                      <span>{t('header.scoutCentral')}</span>
                   </Link>
                 </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 p-4">
                {navItems.map((item) => (
                   <NavLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      className="text-lg font-medium p-3 rounded-md hover:bg-muted"
                    />
                ))}
              </nav>
              <div className="mt-auto p-6 border-t">
                 <Button variant="outline" onClick={() => { toggleLocale(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2">
                    <Languages className="h-5 w-5"/>
                    {t('header.switchLanguage')}
                  </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
