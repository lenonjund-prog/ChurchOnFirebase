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

export function SessionContextProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Session['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Initial session check:", initialSession); // Log inicial
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state change event:", event, "Current Session:", currentSession); // Log de eventos de autenticação
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Se o usuário estiver logado e na página de login, redirecionar para o dashboard.
        // Removido o redirecionamento da homepage ('/') para permitir acesso a usuários logados.
        if (currentSession && pathname === '/login') {
          router.push('/dashboard');
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to /login."); // Log específico para logout
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

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