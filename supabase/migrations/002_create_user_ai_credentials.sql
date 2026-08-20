-- 002_create_user_ai_credentials.sql
-- User AI Credentials Metadata table (Stores non-sensitive credential flags & last4 only)

CREATE TABLE IF NOT EXISTS public.user_ai_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'openai',
  key_last4 TEXT,
  key_label TEXT DEFAULT 'Personal API Key',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_ai_credentials_user_provider UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_user_ai_credentials_user_id ON public.user_ai_credentials(user_id);

DROP TRIGGER IF EXISTS trg_user_ai_credentials_updated_at ON public.user_ai_credentials;
CREATE TRIGGER trg_user_ai_credentials_updated_at
  BEFORE UPDATE ON public.user_ai_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
