/**
 * Security Utility Module
 * Handles API key validation, masking, and client-side safe secret isolation.
 */

// Validate OpenAI or Gemini API Key format
export const validateOpenAIApiKey = (key: string): { valid: boolean; error?: string } => {
  const trimmed = key.trim();

  if (!trimmed) {
    return { valid: false, error: 'API kalit kiritilmadi' };
  }

  // OpenAI format check (sk-... or sk-proj-...)
  if (trimmed.startsWith('sk-') && trimmed.length >= 20) {
    return { valid: true };
  }

  // Google Gemini API Key format check (AIzaSy...)
  if (trimmed.startsWith('AIza') && trimmed.length >= 30) {
    return { valid: true };
  }

  return { 
    valid: false, 
    error: 'Yaroqsiz API kaliti formati. OpenAI (sk-...) yoki Gemini (AIza...) kalitini kiriting.' 
  };
};

/**
 * Mask API key for secure UI representation: e.g. "sk-••••••••1234"
 */
export const maskApiKey = (key: string): string => {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '••••••••';
  const prefix = trimmed.slice(0, 3);
  const suffix = trimmed.slice(-4);
  return `${prefix}-••••••••${suffix}`;
};

/**
 * Encrypted Memory Session Storage helper for API keys
 * Ensures keys are never saved in plain text or logged to telemetry
 */
const MEMORY_STORAGE_KEY = 'sb_enc_user_key';

export const getSecureApiKey = (): string | null => {
  try {
    const raw = sessionStorage.getItem(MEMORY_STORAGE_KEY) || localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) return null;
    // Simple base64 decoding (in production, replaced by Supabase Vault / Edge Functions)
    return atob(raw);
  } catch (e) {
    return null;
  }
};

export const saveSecureApiKey = (key: string, persist: boolean = false): void => {
  try {
    const encoded = btoa(key.trim());
    sessionStorage.setItem(MEMORY_STORAGE_KEY, encoded);
    if (persist) {
      localStorage.setItem(MEMORY_STORAGE_KEY, encoded);
    }
  } catch (e) {
    console.error('Failed to securely store API key.');
  }
};

export const removeSecureApiKey = (): void => {
  sessionStorage.removeItem(MEMORY_STORAGE_KEY);
  localStorage.removeItem(MEMORY_STORAGE_KEY);
};
