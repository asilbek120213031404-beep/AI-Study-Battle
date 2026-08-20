import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { LeaderboardEntry } from '../types';

export type UserStatsRow = Database['public']['Tables']['user_stats']['Row'];

/**
 * Retrieves user battle statistics from Supabase.
 */
export const getUserStats = async (userId: string): Promise<UserStatsRow | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user stats:', error.message);
    return null;
  }
  return data as UserStatsRow | null;
};

/**
 * Retrieves global leaderboard entries ranked by total points and wins.
 */
export const getLeaderboard = async (limit = 20): Promise<LeaderboardEntry[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('user_stats')
    .select(`
      user_id,
      battles_played,
      wins,
      total_score,
      profiles (
        display_name,
        avatar_url
      )
    `)
    .order('total_score', { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error('Error fetching leaderboard stats:', error.message);
    return [];
  }

  const typedData = data as unknown as Array<{
    user_id: string;
    battles_played: number;
    wins: number;
    total_score: number;
    profiles: { display_name?: string; avatar_url?: string } | null;
  }>;

  return typedData.map((item, idx) => {
    const winRate = item.battles_played > 0 ? Math.round((item.wins / item.battles_played) * 100) : 0;
    return {
      rank: idx + 1,
      userId: item.user_id,
      displayName: item.profiles?.display_name || 'O\'yinchi',
      avatarUrl: item.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      wins: item.wins || 0,
      battles: item.battles_played || 0,
      winRate,
      totalPoints: item.total_score || 0,
      score: item.total_score || 0,
    };
  });
};
