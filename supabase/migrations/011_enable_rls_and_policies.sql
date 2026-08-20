-- 011_enable_rls_and_policies.sql
-- Mandatory Row Level Security (RLS) Enablement & Restrictive Policies

-- 1. Enable RLS on ALL 9 application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_question_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- 2. RLS POLICIES FOR PROFILES
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Profiles are publicly readable for leaderboards & battles" ON public.profiles;
CREATE POLICY "Profiles are publicly readable for leaderboards & battles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------
-- 3. RLS POLICIES FOR USER AI CREDENTIALS
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own AI credential metadata" ON public.user_ai_credentials;
CREATE POLICY "Users can view their own AI credential metadata"
  ON public.user_ai_credentials FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own AI credential metadata" ON public.user_ai_credentials;
CREATE POLICY "Users can insert their own AI credential metadata"
  ON public.user_ai_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own AI credential metadata" ON public.user_ai_credentials;
CREATE POLICY "Users can update their own AI credential metadata"
  ON public.user_ai_credentials FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own AI credential metadata" ON public.user_ai_credentials;
CREATE POLICY "Users can delete their own AI credential metadata"
  ON public.user_ai_credentials FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------
-- 4. RLS POLICIES FOR ROOMS
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view rooms" ON public.rooms;
CREATE POLICY "Authenticated users can view rooms"
  ON public.rooms FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create rooms" ON public.rooms;
CREATE POLICY "Users can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Room creators can update their rooms" ON public.rooms;
CREATE POLICY "Room creators can update their rooms"
  ON public.rooms FOR UPDATE
  USING (auth.uid() = creator_id);

-- ----------------------------------------------------
-- 5. RLS POLICIES FOR ROOM PLAYERS
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view room players" ON public.room_players;
CREATE POLICY "Authenticated users can view room players"
  ON public.room_players FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can join as themselves" ON public.room_players;
CREATE POLICY "Users can join as themselves"
  ON public.room_players FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own player state" ON public.room_players;
CREATE POLICY "Users can update their own player state"
  ON public.room_players FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave room" ON public.room_players;
CREATE POLICY "Users can leave room"
  ON public.room_players FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------
-- 6. RLS POLICIES FOR BATTLES
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Battle participants can view battle details" ON public.battles;
CREATE POLICY "Battle participants can view battle details"
  ON public.battles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.room_players rp
      WHERE rp.room_id = battles.room_id AND rp.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------
-- 7. RLS POLICIES FOR BATTLE QUESTIONS
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Battle participants can view questions" ON public.battle_questions;
CREATE POLICY "Battle participants can view questions"
  ON public.battle_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.battles b
      JOIN public.room_players rp ON b.room_id = rp.room_id
      WHERE b.id = battle_questions.battle_id AND rp.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------
-- 8. BATTLE QUESTION SECRETS (NO CLIENT POLICIES!)
-- ----------------------------------------------------
-- NO SELECT/INSERT/UPDATE POLICIES CREATED FOR CLIENTS.
-- Only SECURITY DEFINER functions (like submit_answer) or service role can access correct_answer.

-- ----------------------------------------------------
-- 9. RLS POLICIES FOR QUESTION ANSWERS
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Participants can view battle answers" ON public.question_answers;
CREATE POLICY "Participants can view battle answers"
  ON public.question_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.battles b
      JOIN public.room_players rp ON b.room_id = rp.room_id
      WHERE b.id = question_answers.battle_id AND rp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can submit their own answer" ON public.question_answers;
CREATE POLICY "Users can submit their own answer"
  ON public.question_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------
-- 10. RLS POLICIES FOR USER STATS
-- ----------------------------------------------------
DROP POLICY IF EXISTS "User stats are publicly readable for leaderboards" ON public.user_stats;
CREATE POLICY "User stats are publicly readable for leaderboards"
  ON public.user_stats FOR SELECT
  USING (true);

-- NO CLIENT UPDATE POLICY FOR USER STATS.
-- Stats are incremented strictly through trusted RPCs or server functions.
