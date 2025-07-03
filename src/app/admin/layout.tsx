
'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (loading) return;

    const isLoginPage = pathname === '/admin' || pathname === '/admin/login';
    const isAdmin = !!role;

    // Redirect logged-in admins away from the login page
    if (isLoginPage && isAdmin) {
      if (role === 'media') return router.push('/admin/activities');
      // Default for 'general', 'finance', and 'custodian'
      return router.push('/members');
    }

    // Redirect non-admins trying to access admin pages
    if (!isLoginPage && !isAdmin) {
      return router.push('/admin');
    }

    // Page-specific access control for logged-in admins
    if (!isLoginPage && isAdmin) {
      const isFinancePage = pathname.startsWith('/members') || pathname.startsWith('/admin/members') || pathname.startsWith('/admin/products');
      const isMediaPage = pathname.startsWith('/admin/activities');
      
      const canAccessFinance = role === 'general' || role === 'finance' || role === 'custodian';
      const canAccessMedia = role === 'general' || role === 'media';

      if (isFinancePage && !canAccessFinance) {
        return router.push('/admin');
      }
      if (isMediaPage && !canAccessMedia) {
        return router.push('/admin');
      }
    }
  }, [user, role, loading, router, pathname]);

  // Don't protect the login page itself
  if (pathname === '/admin' || pathname === '/admin/login') {
    return (
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
    )
  }

  // Show a loader while checking auth state or if user is not an admin yet
  if (loading || !role) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If everything is okay, render the protected admin content
  return <>{children}</>;
}
