import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import type { User, AuthError } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthError | null> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error;
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthError | null> => {
      const { error } = await supabase.auth.signUp({ email, password });
      return error;
    },
    []
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthError | null> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut };
}
