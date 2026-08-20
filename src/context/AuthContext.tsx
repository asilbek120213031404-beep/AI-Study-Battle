import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile } from '../types';
import {
  signInWithGoogle as googleSignIn,
  signOut as googleSignOut,
  mapSupabaseUserToProfile,
} from '../services/authService';
import { getSecureApiKey, maskApiKey } from '../lib/security';

export interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasApiKey: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updated: Partial<UserProfile>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Check initial active session from Supabase
    const initAuth = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session: activeSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session retrieval error:', sessionError.message);
        }

        if (mounted) {
          if (activeSession?.user) {
            setSession(activeSession);
            setSupabaseUser(activeSession.user);
            setUser(mapSupabaseUserToProfile(activeSession.user));
          } else {
            setSession(null);
            setSupabaseUser(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;

        if (newSession?.user) {
          setSession(newSession);
          setSupabaseUser(newSession.user);
          setUser(mapSupabaseUserToProfile(newSession.user));
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setSupabaseUser(null);
          setUser(null);
        }

        setLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  const handleSignInWithGoogle = async (): Promise<void> => {
    setError(null);
    setLoading(true);
    try {
      await googleSignIn();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google authentication failed.';
      setError(message);
      setLoading(false);
      throw err;
    }
  };

  const handleLogout = async (): Promise<void> => {
    setError(null);
    try {
      await googleSignOut();
      setSession(null);
      setSupabaseUser(null);
      setUser(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign out failed.';
      setError(message);
      throw err;
    }
  };

  const updateUserProfile = (updated: Partial<UserProfile>): void => {
    if (!user) return;
    const currentKey = getSecureApiKey();
    const newProfile: UserProfile = {
      ...user,
      ...updated,
      hasApiKey: Boolean(currentKey),
      apiKeyMasked: currentKey ? maskApiKey(currentKey) : undefined,
    };
    setUser(newProfile);
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    loading,
    isAuthenticated: Boolean(session && user),
    hasApiKey: Boolean(user?.hasApiKey),
    error,
    signInWithGoogle: handleSignInWithGoogle,
    logout: handleLogout,
    updateUserProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
