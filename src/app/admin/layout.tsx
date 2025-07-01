
'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';

const ADMIN_EMAIL = 'sudanscoutadmin@scout.com';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin' || pathname === '/admin/login';
  
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    // If we're not on the login page, and the user is not an admin, redirect them to login.
    if (!isLoginPage && !loading && !isAdmin) {
      router.push('/admin');
    }
    // If the user is an admin and they are on the login page, redirect them to the members list.
    if (isLoginPage && !loading && isAdmin) {
      router.push('/members');
    }
  }, [user, loading, isAdmin, router, pathname, isLoginPage]);

  // Don't protect the login page itself
  if (isLoginPage) {
    return (
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
    )
  }

  // Show a loader while checking auth state or if user is not an admin yet
  if (loading || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If everything is okay, render the protected admin content
  return <>{children}</>;
}
