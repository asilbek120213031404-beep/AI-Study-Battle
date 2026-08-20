-- 006_create_battle_questions.sql
-- Battle Questions Table (Client-visible question payload without secret answers)

CREATE TABLE IF NOT EXISTS public.battle_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_battle_questions_order UNIQUE (battle_id, question_order),
  CONSTRAINT chk_battle_questions_order CHECK (question_order > 0),
  CONSTRAINT chk_battle_questions_options_array CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) = 4)
);

CREATE INDEX IF NOT EXISTS idx_battle_questions_battle_id ON public.battle_questions(battle_id);
