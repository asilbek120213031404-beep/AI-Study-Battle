import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type BattleRow = Database['public']['Tables']['battles']['Row'];
export type BattleQuestionRow = Database['public']['Tables']['battle_questions']['Row'];
export type QuestionAnswerRow = Database['public']['Tables']['question_answers']['Row'];

export interface SubmitAnswerResult {
  submitted: boolean;
  isCorrect: boolean;
  questionId: string;
}

/**
 * Fetches battle details by room ID.
 */
export const getBattleByRoomId = async (roomId: string): Promise<BattleRow | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('battles')
    .select('*')
    .eq('room_id', roomId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching battle:', error.message);
    return null;
  }
  return data as BattleRow | null;
};

/**
 * Fetches client-visible questions for a battle (does NOT include correct_answer secrets).
 */
export const getBattleQuestions = async (battleId: string): Promise<BattleQuestionRow[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('battle_questions')
    .select('*')
    .eq('battle_id', battleId)
    .order('question_order', { ascending: true });

  if (error) {
    console.error('Error fetching battle questions:', error.message);
    return [];
  }
  return (data || []) as BattleQuestionRow[];
};

/**
 * Submits an answer for a question securely via the atomic submit_answer RPC function.
 */
export const submitAnswer = async (
  questionId: string,
  selectedAnswer: number,
  responseTimeMs: number
): Promise<SubmitAnswerResult> => {
  if (!supabase) {
    throw new Error('Supabase client is not initialized.');
  }

  const { data, error } = await (supabase.rpc as any)('submit_answer', {
    p_question_id: questionId,
    p_selected_answer: selectedAnswer,
    p_response_time_ms: responseTimeMs,
  });

  if (error) {
    console.error('RPC submit_answer error:', error.message);
    throw new Error(error.message);
  }

  return data as unknown as SubmitAnswerResult;
};

/**
 * Fetches all submitted answers for a battle by player.
 */
export const getBattleAnswers = async (battleId: string): Promise<QuestionAnswerRow[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('question_answers')
    .select('*')
    .eq('battle_id', battleId);

  if (error) {
    console.error('Error fetching question answers:', error.message);
    return [];
  }
  return (data || []) as QuestionAnswerRow[];
};
