import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type AiCredentialRow = Database['public']['Tables']['user_ai_credentials']['Row'];

/**
 * Retrieves a user's public profile from Supabase.
 */
export const getProfile = async (userId: string): Promise<ProfileRow | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
  return data as ProfileRow;
};

/**
 * Updates a user's public profile metadata in Supabase.
 */
export const updateProfile = async (userId: string, updates: ProfileUpdate): Promise<ProfileRow | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error.message);
    throw error;
  }
  return data as ProfileRow;
};

/**
 * Retrieves AI Credential metadata for a user (Provider, last 4 digits, label).
 */
export const getUserAiCredentialMetadata = async (userId: string, provider = 'openai'): Promise<AiCredentialRow | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_ai_credentials')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .maybeSingle();

  if (error) {
    console.error('Error fetching AI credential metadata:', error.message);
    return null;
  }
  return data as AiCredentialRow | null;
};

/**
 * Saves AI Credential non-sensitive metadata for a user.
 */
export const saveUserAiCredentialMetadata = async (
  userId: string,
  keyLast4: string,
  provider = 'openai',
  keyLabel = 'Personal API Key'
): Promise<AiCredentialRow | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_ai_credentials')
    .upsert({
      user_id: userId,
      provider,
      key_last4: keyLast4,
      key_label: keyLabel,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving AI credential metadata:', error.message);
    throw error;
  }
  return data as AiCredentialRow;
};

/**
 * Removes AI Credential metadata for a user.
 */
export const deleteUserAiCredentialMetadata = async (userId: string, provider = 'openai'): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('user_ai_credentials')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);

  if (error) {
    console.error('Error deleting AI credential metadata:', error.message);
    throw error;
  }
  return true;
};
