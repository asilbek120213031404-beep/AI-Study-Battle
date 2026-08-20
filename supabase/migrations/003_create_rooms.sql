-- 003_create_rooms.sql
-- Multiplayer Battle Rooms Table

CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL UNIQUE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'waiting',
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 10,
  time_per_question INTEGER NOT NULL DEFAULT 15,
  battle_mode TEXT NOT NULL DEFAULT '1v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  CONSTRAINT chk_rooms_status CHECK (status IN ('waiting', 'starting', 'in_progress', 'finished', 'cancelled', 'expired')),
  CONSTRAINT chk_rooms_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard')),
  CONSTRAINT chk_rooms_battle_mode CHECK (battle_mode IN ('1v1')),
  CONSTRAINT chk_rooms_question_count CHECK (question_count IN (5, 10, 15, 20)),
  CONSTRAINT chk_rooms_time_per_question CHECK (time_per_question IN (10, 15, 20, 30))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_room_code ON public.rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_creator_id ON public.rooms(creator_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);
