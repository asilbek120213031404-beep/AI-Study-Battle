-- 007_create_question_secrets.sql
-- Private Battle Question Secrets Table (Stores secret correct_answer, isolated from client RLS)

CREATE TABLE IF NOT EXISTS public.battle_question_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL UNIQUE REFERENCES public.battle_questions(id) ON DELETE CASCADE,
  correct_answer INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_question_secrets_correct_answer CHECK (correct_answer >= 0 AND correct_answer <= 3)
);

CREATE INDEX IF NOT EXISTS idx_question_secrets_question_id ON public.battle_question_secrets(question_id);
