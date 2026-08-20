-- 010_create_functions.sql
-- PostgreSQL Atomic RPC Functions for Room Creation, Joining, and Answer Submission

-- 1. Helper function to generate uppercase alphanumeric room codes (6 chars)
CREATE OR REPLACE FUNCTION public.generate_unique_room_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Omitted confusing chars (0, O, 1, I)
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

-- 2. Atomic create_room RPC function
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

-- 3. Atomic join_room RPC function (Prevents race condition player limit bypass)
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

  -- Check existing membership
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

  -- Count current active players
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

-- 4. Architecture stub for submit_answer RPC function
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
  v_user_id UUID;
  v_question public.battle_questions%ROWTYPE;
  v_correct_answer INTEGER;
  v_is_correct BOOLEAN;
  v_existing_answer public.question_answers%ROWTYPE;
  v_new_answer public.question_answers%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_question
  FROM public.battle_questions
  WHERE id = p_question_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  -- Read correct answer securely from secrets table (never exposed to client)
  SELECT correct_answer INTO v_correct_answer
  FROM public.battle_question_secrets
  WHERE question_id = p_question_id;

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
  )
  ON CONFLICT (question_id, user_id) DO NOTHING
  RETURNING * INTO v_new_answer;

  RETURN jsonb_build_object(
    'submitted', true,
    'isCorrect', v_is_correct,
    'questionId', p_question_id
  );
END;
$$;
