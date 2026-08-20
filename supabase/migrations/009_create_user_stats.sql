-- 009_create_user_stats.sql
-- User Stats Table

CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  battles_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_answers INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_user_stats_battles CHECK (battles_played >= 0),
  CONSTRAINT chk_user_stats_wins CHECK (wins >= 0),
  CONSTRAINT chk_user_stats_losses CHECK (losses >= 0),
  CONSTRAINT chk_user_stats_total_score CHECK (total_score >= 0),
  CONSTRAINT chk_user_stats_correct CHECK (correct_answers >= 0),
  CONSTRAINT chk_user_stats_total CHECK (total_answers >= 0)
);

CREATE INDEX IF NOT EXISTS idx_user_stats_total_score ON public.user_stats(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_wins ON public.user_stats(wins DESC);

DROP TRIGGER IF EXISTS trg_user_stats_updated_at ON public.user_stats;
CREATE TRIGGER trg_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
