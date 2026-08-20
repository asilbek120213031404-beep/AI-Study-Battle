-- AI STUDY BATTLE — COMPLETE SUPABASE DATABASE SCHEMA & MIGRATION SCRIPT
-- Execute this script in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)

-- ====================================================
-- 1. PROFILES TABLE & AUTH REGISTRATION TRIGGER
-- ====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'O''yinchi',
  avatar_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  display_name,
  avatar_url,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ====================================================
-- 2. USER AI CREDENTIALS TABLE
-- ====================================================
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

-- ====================================================
-- 3. USER STATS TABLE
-- ====================================================
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

-- Trigger to create profile + user_stats automatically on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1),
      'O''yinchi'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    ),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();

  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================
-- 4. ROOMS TABLE
-- ====================================================
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

CREATE INDEX IF NOT EXISTS idx_rooms_room_code ON public.rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_creator_id ON public.rooms(creator_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);

-- ====================================================
-- 5. ROOM PLAYERS TABLE
-- ====================================================
CREATE TABLE IF NOT EXISTS public.room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_creator BOOLEAN NOT NULL DEFAULT false,
  ready BOOLEAN NOT NULL DEFAULT false,
  score INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  CONSTRAINT uq_room_players_room_user UNIQUE (room_id, user_id),
  CONSTRAINT chk_room_players_score CHECK (score >= 0)
);

CREATE INDEX IF NOT EXISTS idx_room_players_room_id ON public.room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_user_id ON public.room_players(user_id);

-- ====================================================
-- 6. BATTLES TABLE
-- ====================================================
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

-- ====================================================
-- 7. BATTLE QUESTIONS TABLE (CLIENT VISIBLE)
-- ====================================================
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

-- ====================================================
-- 8. BATTLE QUESTION SECRETS TABLE (ISOLATED FROM CLIENT RLS)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.battle_question_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL UNIQUE REFERENCES public.battle_questions(id) ON DELETE CASCADE,
  correct_answer INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_question_secrets_correct_answer CHECK (correct_answer >= 0 AND correct_answer <= 3)
);

CREATE INDEX IF NOT EXISTS idx_question_secrets_question_id ON public.battle_question_secrets(question_id);

-- ====================================================
-- 9. QUESTION ANSWERS TABLE
-- ====================================================
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

-- ====================================================
-- 10. RPC FUNCTIONS (ROOM CREATION, JOINING, STATE & ANSWERING)
-- ====================================================
CREATE OR REPLACE FUNCTION public.generate_unique_room_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN := true;
BEGIN
  WHILE code_exists LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS (SELECT 1 FROM public.rooms WHERE room_code = result) INTO code_exists;
  END LOOP;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_room(
  p_subject TEXT,
  p_difficulty TEXT,
  p_question_count INTEGER DEFAULT 10,
  p_time_per_question INTEGER DEFAULT 15,
  p_battle_mode TEXT DEFAULT '1v1'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_room_code TEXT;
  v_room public.rooms%ROWTYPE;
  v_player public.room_players%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_room_code := public.generate_unique_room_code();

  INSERT INTO public.rooms (
    room_code,
    creator_id,
    status,
    subject,
    difficulty,
    question_count,
    time_per_question,
    battle_mode
  ) VALUES (
    v_room_code,
    v_user_id,
    'waiting',
    p_subject,
    p_difficulty,
    p_question_count,
    p_time_per_question,
    p_battle_mode
  ) RETURNING * INTO v_room;

  INSERT INTO public.room_players (
    room_id,
    user_id,
    is_creator,
    ready
  ) VALUES (
    v_room.id,
    v_user_id,
    true,
    true
  ) RETURNING * INTO v_player;

  RETURN jsonb_build_object(
    'room', to_jsonb(v_room),
    'player', to_jsonb(v_player)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.join_room(p_room_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_room public.rooms%ROWTYPE;
  v_player_count INTEGER;
  v_existing_player public.room_players%ROWTYPE;
  v_new_player public.room_players%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_room
  FROM public.rooms
  WHERE room_code = upper(trim(p_room_code));

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room code % not found', p_room_code;
  END IF;

  IF v_room.status != 'waiting' THEN
    RAISE EXCEPTION 'Room is not in waiting state';
  END IF;

  SELECT * INTO v_existing_player
  FROM public.room_players
  WHERE room_id = v_room.id AND user_id = v_user_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'room', to_jsonb(v_room),
      'player', to_jsonb(v_existing_player),
      'alreadyJoined', true
    );
  END IF;

  SELECT COUNT(*) INTO v_player_count
  FROM public.room_players
  WHERE room_id = v_room.id AND left_at IS NULL;

  IF v_player_count >= 2 THEN
    RAISE EXCEPTION 'Room is already full (2/2 players)';
  END IF;

  INSERT INTO public.room_players (
    room_id,
    user_id,
    is_creator,
    ready
  ) VALUES (
    v_room.id,
    v_user_id,
    false,
    true
  ) RETURNING * INTO v_new_player;

  RETURN jsonb_build_object(
    'room', to_jsonb(v_room),
    'player', to_jsonb(v_new_player),
    'alreadyJoined', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.set_player_ready(p_room_id UUID, p_ready BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_player public.room_players%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.room_players
  SET ready = p_ready
  WHERE room_id = p_room_id AND user_id = v_user_id AND left_at IS NULL
  RETURNING * INTO v_player;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player not found in room';
  END IF;

  RETURN jsonb_build_object('success', true, 'ready', p_ready);
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_room(p_room_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.room_players
  SET left_at = now()
  WHERE room_id = p_room_id AND user_id = v_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.start_room(p_room_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_room public.rooms%ROWTYPE;
  v_player_count INTEGER;
  v_unready_count INTEGER;
  v_battle public.battles%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_room FROM public.rooms WHERE id = p_room_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found';
  END IF;

  IF v_room.creator_id != v_user_id THEN
    RAISE EXCEPTION 'Only room creator can start the room';
  END IF;

  IF v_room.status != 'waiting' THEN
    RAISE EXCEPTION 'Room is not in waiting state';
  END IF;

  SELECT COUNT(*) INTO v_player_count FROM public.room_players WHERE room_id = p_room_id AND left_at IS NULL;
  IF v_player_count < 2 THEN
    RAISE EXCEPTION 'At least 2 players required to start battle';
  END IF;

  SELECT COUNT(*) INTO v_unready_count FROM public.room_players WHERE room_id = p_room_id AND left_at IS NULL AND ready = false;
  IF v_unready_count > 0 THEN
    RAISE EXCEPTION 'All players must be ready to start';
  END IF;

  UPDATE public.rooms SET status = 'in_progress', started_at = now() WHERE id = p_room_id RETURNING * INTO v_room;

  INSERT INTO public.battles (room_id, status, started_at)
  VALUES (p_room_id, 'in_progress', now())
  ON CONFLICT (room_id) DO UPDATE SET status = 'in_progress', started_at = now()
  RETURNING * INTO v_battle;

  RETURN jsonb_build_object('success', true, 'room', to_jsonb(v_room), 'battle', to_jsonb(v_battle));
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_room(p_room_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_room public.rooms%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_room FROM public.rooms WHERE id = p_room_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found';
  END IF;

  IF v_room.creator_id != v_user_id THEN
    RAISE EXCEPTION 'Only room creator can cancel the room';
  END IF;

  UPDATE public.rooms SET status = 'cancelled', finished_at = now() WHERE id = p_room_id RETURNING * INTO v_room;

  RETURN jsonb_build_object('success', true, 'room', to_jsonb(v_room));
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_answer(
  p_question_id UUID,
  p_selected_answer INTEGER,
  p_response_time_ms INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_question public.battle_questions%ROWTYPE;
  v_battle public.battles%ROWTYPE;
  v_is_player BOOLEAN;
  v_correct_answer INTEGER;
  v_is_correct BOOLEAN;
  v_existing_answer public.question_answers%ROWTYPE;
  v_new_answer public.question_answers%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_selected_answer < 0 OR p_selected_answer > 3 THEN
    RAISE EXCEPTION 'Invalid answer index. Must be between 0 and 3.';
  END IF;

  IF p_response_time_ms < 0 THEN
    RAISE EXCEPTION 'Invalid response time. Must be non-negative.';
  END IF;

  SELECT * INTO v_question FROM public.battle_questions WHERE id = p_question_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  SELECT * INTO v_battle FROM public.battles WHERE id = v_question.battle_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Battle not found';
  END IF;

  IF v_battle.status != 'in_progress' THEN
    RAISE EXCEPTION 'Battle is not in progress';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.room_players rp
    WHERE rp.room_id = v_battle.room_id
      AND rp.user_id = v_user_id
      AND rp.left_at IS NULL
  ) INTO v_is_player;

  IF NOT v_is_player THEN
    RAISE EXCEPTION 'User is not an active participant in this battle';
  END IF;

  SELECT * INTO v_existing_answer
  FROM public.question_answers
  WHERE question_id = p_question_id AND user_id = v_user_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'submitted', false,
      'alreadySubmitted', true,
      'questionId', p_question_id,
      'isCorrect', v_existing_answer.is_correct
    );
  END IF;

  SELECT correct_answer INTO v_correct_answer
  FROM public.battle_question_secrets
  WHERE question_id = p_question_id;

  IF v_correct_answer IS NULL THEN
    RAISE EXCEPTION 'Secret answer not configured';
  END IF;

  v_is_correct := (p_selected_answer = v_correct_answer);

  INSERT INTO public.question_answers (
    question_id,
    battle_id,
    user_id,
    selected_answer,
    is_correct,
    response_time_ms
  ) VALUES (
    p_question_id,
    v_question.battle_id,
    v_user_id,
    p_selected_answer,
    v_is_correct,
    p_response_time_ms
  ) RETURNING * INTO v_new_answer;

  RETURN jsonb_build_object(
    'submitted', true,
    'alreadySubmitted', false,
    'isCorrect', v_is_correct,
    'questionId', p_question_id
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_room FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.join_room FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_player_ready FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.leave_room FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.start_room FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cancel_room FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_answer FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_room TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_room TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_player_ready TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_room TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_room TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_room TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_answer TO authenticated;

-- ====================================================
-- 11. ROW LEVEL SECURITY (RLS) & RESTRICTIVE POLICIES
-- ====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_question_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Profiles (Email hidden from public queries; use public_profiles view)
DROP POLICY IF EXISTS "Profiles are publicly readable for leaderboards & battles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- AI Credentials
DROP POLICY IF EXISTS "Users can view their own AI credential metadata" ON public.user_ai_credentials;
CREATE POLICY "Users can view their own AI credential metadata" ON public.user_ai_credentials FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own AI credential metadata" ON public.user_ai_credentials;
CREATE POLICY "Users can insert their own AI credential metadata" ON public.user_ai_credentials FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own AI credential metadata" ON public.user_ai_credentials;
CREATE POLICY "Users can update their own AI credential metadata" ON public.user_ai_credentials FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own AI credential metadata" ON public.user_ai_credentials;
CREATE POLICY "Users can delete their own AI credential metadata" ON public.user_ai_credentials FOR DELETE USING (auth.uid() = user_id);

-- Rooms
DROP POLICY IF EXISTS "Authenticated users can view rooms" ON public.rooms;
CREATE POLICY "Authenticated users can view rooms" ON public.rooms FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create rooms" ON public.rooms;
CREATE POLICY "Users can create rooms" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Room creators can update their rooms" ON public.rooms;
CREATE POLICY "Room creators can update their rooms" ON public.rooms FOR UPDATE USING (auth.uid() = creator_id AND status = 'waiting');

-- Room Players (Direct INSERT & UPDATE revoked; must use join_room, set_player_ready, leave_room RPCs)
DROP POLICY IF EXISTS "Authenticated users can view room players" ON public.room_players;
CREATE POLICY "Authenticated users can view room players" ON public.room_players FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can join as themselves" ON public.room_players;
DROP POLICY IF EXISTS "Users can update their own player state" ON public.room_players;

-- Battles
DROP POLICY IF EXISTS "Battle participants can view battle details" ON public.battles;
CREATE POLICY "Battle participants can view battle details" ON public.battles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.room_players rp WHERE rp.room_id = battles.room_id AND rp.user_id = auth.uid())
);

-- Battle Questions
DROP POLICY IF EXISTS "Battle participants can view questions" ON public.battle_questions;
CREATE POLICY "Battle participants can view questions" ON public.battle_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.battles b
    JOIN public.room_players rp ON b.room_id = rp.room_id
    WHERE b.id = battle_questions.battle_id AND rp.user_id = auth.uid()
  )
);

-- Question Secrets: NO CLIENT RLS POLICIES CREATED!

-- Question Answers (Direct client INSERT revoked; must use submit_answer RPC)
DROP POLICY IF EXISTS "Users can submit their own answer" ON public.question_answers;
DROP POLICY IF EXISTS "Participants can view battle answers" ON public.question_answers;
DROP POLICY IF EXISTS "Users can view their own answers or finished battle answers" ON public.question_answers;

CREATE POLICY "Users can view their own answers or finished battle answers" ON public.question_answers FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.battles b
    JOIN public.room_players rp ON b.room_id = rp.room_id
    WHERE b.id = question_answers.battle_id
      AND rp.user_id = auth.uid()
      AND b.status = 'finished'
  )
);

-- User Stats (Direct client UPDATE revoked)
DROP POLICY IF EXISTS "User stats are publicly readable for leaderboards" ON public.user_stats;
CREATE POLICY "User stats are publicly readable for leaderboards" ON public.user_stats FOR SELECT USING (true);

-- ====================================================
-- 12. IDEMPOTENT REALTIME CONFIGURATION
-- ====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'rooms') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'room_players') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'battles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.battles;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'question_answers') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.question_answers;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_stats') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stats;
  END IF;
END $$;
