"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface SessionContextType {
  session: Session | null;
  user: Session['user'] | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/update-password',
  '/privacy',
  '/terms',
];

export function SessionContextProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Session['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // If user is signed in and on a public page, redirect to dashboard
        if (currentSession && publicPaths.includes(pathname)) {
          router.push('/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        // If user signs out and is on a protected page, redirect to login
        if (!publicPaths.includes(pathname)) {
          router.push('/login');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  // Additional effect to handle cases where session might become null without a SIGNED_OUT event
  // This ensures redirection to login if user is not authenticated and tries to access a protected path.
  useEffect(() => {
    if (!loading && !user && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
  }, [loading, user, pathname, router]);


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className='ml-2'>Carregando...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, user, loading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
}