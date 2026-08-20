import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile } from '../types';
import { getSecureApiKey, maskApiKey } from '../lib/security';

export interface ProfileSetupStatus {
  isSetupComplete: boolean;
  hasApiKey: boolean;
}

/**
 * Initiates Google OAuth authentication flow via Supabase.
 */
export const signInWithGoogle = async (): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error(
      'Supabase platform is not configured properly. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.'
    );
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google OAuth error:', error.message);
    throw error;
  }
};

/**
 * Signs out the current user session from Supabase.
 */
export const signOut = async (): Promise<void> => {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error.message);
      throw error;
    }
  }
};

/**
 * Retrieves the current session from Supabase.
 */
export const getSession = async (): Promise<Session | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Get session error:', error.message);
    return null;
  }
  return data.session;
};

/**
 * Retrieves the authenticated user from Supabase.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user;
};

/**
 * Checks whether the user's profile setup is complete using Supabase profiles & credentials.
 */
export const getProfileSetupStatus = async (userId: string): Promise<ProfileSetupStatus> => {
  const localKey = getSecureApiKey();
  if (!supabase) {
    return {
      isSetupComplete: true,
      hasApiKey: Boolean(localKey),
    };
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', userId)
      .maybeSingle();

    const { data: credential } = await supabase
      .from('user_ai_credentials')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    return {
      isSetupComplete: Boolean(profile?.id),
      hasApiKey: Boolean(credential?.id || localKey),
    };
  } catch (e) {
    console.warn('Profile setup check fallback:', e);
    return {
      isSetupComplete: true,
      hasApiKey: Boolean(localKey),
    };
  }
};

/**
 * Maps Supabase User object into UserProfile model.
 */
export const mapSupabaseUserToProfile = (user: User): UserProfile => {
  const meta = user.user_metadata || {};
  const apiKey = getSecureApiKey();

  return {
    id: user.id,
    email: user.email || '',
    displayName: meta.full_name || meta.name || user.email?.split('@')[0] || 'O\'yinchi',
    avatarUrl: meta.avatar_url || meta.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    hasApiKey: Boolean(apiKey),
    apiKeyMasked: apiKey ? maskApiKey(apiKey) : undefined,
    createdAt: user.created_at || new Date().toISOString(),
    stats: {
      battlesPlayed: 24,
      wins: 16,
      losses: 7,
      draws: 1,
      winRate: 67,
      totalPoints: 14850,
      averageScore: 840,
      averageResponseTime: 4.2,
    },
  };
};
