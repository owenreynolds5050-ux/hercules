import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as Linking from 'expo-linking';
import { Session, User } from '@supabase/supabase-js';

import { supabaseClient } from '@/lib/supabaseClient';

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextValue {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  signInWithOtp: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider
 * Wraps the application with Supabase authentication state management.
 * Fetches the persisted session on mount and exposes helpers for OTP sign-in and sign-out.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const { data, error } = await supabaseClient.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Supabase getSession error', error);
      }

      setSession(data.session ?? null);
      setIsLoading(false);
    };

    void initializeAuth();

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, nextSession) => {
        console.log('Supabase auth state changed', nextSession);
        setSession(nextSession);
      },
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = useCallback(async (email: string) => {
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: Linking.createURL('/auth/callback'),
      },
    });

    if (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabaseClient.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      session,
      user: session?.user ?? null,
      signInWithOtp,
      signOut,
    }),
    [isLoading, session, signInWithOtp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
