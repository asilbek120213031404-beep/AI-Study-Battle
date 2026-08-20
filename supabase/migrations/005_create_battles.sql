-- 005_create_battles.sql
-- Battles Table

CREATE TABLE IF NOT EXISTS public.battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL UNIQUE REFERENCES public.rooms(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_battles_status CHECK (status IN ('pending', 'in_progress', 'finished', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_battles_room_id ON public.battles(room_id);
CREATE INDEX IF NOT EXISTS idx_battles_winner_id ON public.battles(winner_id);
