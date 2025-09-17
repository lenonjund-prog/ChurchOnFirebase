"use client";

import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  user: Session['user'] | null;
  loading: boolean;
};

export function useSupabaseAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        session,
        user: session?.user || null,
        loading: false,
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        session,
        user: session?.user || null,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return authState;
}