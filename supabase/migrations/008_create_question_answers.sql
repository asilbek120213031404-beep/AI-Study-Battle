-- 008_create_question_answers.sql
-- Question Answers Table

CREATE TABLE IF NOT EXISTS public.question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.battle_questions(id) ON DELETE CASCADE,
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_answer INTEGER,
  is_correct BOOLEAN,
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_question_answers_question_user UNIQUE (question_id, user_id),
  CONSTRAINT chk_question_answers_selected CHECK (selected_answer IS NULL OR (selected_answer >= 0 AND selected_answer <= 3)),
  CONSTRAINT chk_question_answers_response_time CHECK (response_time_ms >= 0)
);

CREATE INDEX IF NOT EXISTS idx_question_answers_battle_id ON public.question_answers(battle_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON public.question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_user_id ON public.question_answers(user_id);
