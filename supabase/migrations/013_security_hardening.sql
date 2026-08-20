-- 013_security_hardening.sql
-- Migration to harden RLS policies, RPC functions, and data privacy

-- ====================================================
-- 1. PUBLIC PROFILES VIEW (EXCLUDES PRIVATE EMAIL)
-- ====================================================
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  display_name,
  avatar_url,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- ====================================================
-- 2. HARDEN PROFILES RLS
-- ====================================================
-- Revoke global broad SELECT policy that exposed email to all clients
DROP POLICY IF EXISTS "Profiles are publicly readable for leaderboards & battles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;

CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- ====================================================
-- 3. HARDEN QUESTION ANSWERS RLS
-- ====================================================
-- Revoke direct client INSERT policy (All answers MUST use submit_answer RPC)
DROP POLICY IF EXISTS "Users can submit their own answer" ON public.question_answers;
DROP POLICY IF EXISTS "Participants can view battle answers" ON public.question_answers;
DROP POLICY IF EXISTS "Users can view their own answers or finished battle answers" ON public.question_answers;

CREATE POLICY "Users can view their own answers or finished battle answers"
  ON public.question_answers FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.battles b
      JOIN public.room_players rp ON b.room_id = rp.room_id
      WHERE b.id = question_answers.battle_id
        AND rp.user_id = auth.uid()
        AND b.status = 'finished'
    )
  );

-- ====================================================
-- 4. HARDEN ROOM PLAYERS RLS
-- ====================================================
-- Revoke direct INSERT (Must use join_room RPC to enforce 2 player limit)
DROP POLICY IF EXISTS "Users can join as themselves" ON public.room_players;
-- Revoke general UPDATE (Must use set_player_ready or leave_room RPCs)
DROP POLICY IF EXISTS "Users can update their own player state" ON public.room_players;

-- ====================================================
-- 5. SECURE RPC FUNCTIONS FOR ROOM STATE & PLAYERS
-- ====================================================

-- RPC: set_player_ready
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

-- RPC: leave_room
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

-- RPC: start_room
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

-- RPC: cancel_room
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

-- ====================================================
-- 6. HARDENED submit_answer RPC FUNCTION
-- ====================================================
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
  -- 1. Verify authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Verify selected_answer bounds (0-3)
  IF p_selected_answer < 0 OR p_selected_answer > 3 THEN
    RAISE EXCEPTION 'Invalid answer index. Must be between 0 and 3.';
  END IF;

  -- 3. Verify response_time_ms
  IF p_response_time_ms < 0 THEN
    RAISE EXCEPTION 'Invalid response time. Must be non-negative.';
  END IF;

  -- 4. Verify question exists
  SELECT * INTO v_question FROM public.battle_questions WHERE id = p_question_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  -- 5. Verify battle exists and is in_progress
  SELECT * INTO v_battle FROM public.battles WHERE id = v_question.battle_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Battle not found';
  END IF;

  IF v_battle.status != 'in_progress' THEN
    RAISE EXCEPTION 'Battle is not in progress';
  END IF;

  -- 6. Verify user is active player in the room linked to battle
  SELECT EXISTS (
    SELECT 1 FROM public.room_players rp
    WHERE rp.room_id = v_battle.room_id
      AND rp.user_id = v_user_id
      AND rp.left_at IS NULL
  ) INTO v_is_player;

  IF NOT v_is_player THEN
    RAISE EXCEPTION 'User is not an active participant in this battle';
  END IF;

  -- 7. Check if user already submitted an answer for this question
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

  -- 8. Read correct answer strictly from secrets table
  SELECT correct_answer INTO v_correct_answer
  FROM public.battle_question_secrets
  WHERE question_id = p_question_id;

  IF v_correct_answer IS NULL THEN
    RAISE EXCEPTION 'Secret answer not configured';
  END IF;

  v_is_correct := (p_selected_answer = v_correct_answer);

  -- 9. Insert answer using server-derived user_id, battle_id, is_correct
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

-- ====================================================
-- 7. EXPLICIT EXECUTE PRIVILEGES ON SECURITY DEFINER FUNCTIONS
-- ====================================================
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
-- 8. IDEMPOTENT REALTIME PUBLICATION SETUP
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
