import { createClient } from '@supabase/supabase-js';
import type { LeaderboardEntry } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabasePublishableKey &&
    supabaseUrl.startsWith('https://')
  );
};

if (!isSupabaseConfigured()) {
  console.warn(
    '[AI Study Battle Auth Config Warning]: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables are missing or invalid.\n' +
    'Please copy .env.example to .env and configure your Supabase URL and Publishable/Anon key.'
  );
}

// Centralized Supabase client instance
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Helper to fetch leaderboard data
export const fetchLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
  if (supabase) {
    try {
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
        .order('wins', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        return (data as unknown as Array<{
          user_id: string;
          battles_played: number;
          wins: number;
          total_score: number;
          profiles: { display_name?: string; avatar_url?: string } | null;
        }>).map((item, idx) => {
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
      }
    } catch (err) {
      console.warn('Supabase leaderboard query failed, using fallback data:', err);
    }
  }

  return [
    { rank: 1, userId: 'u1', displayName: 'Asilbek R.', avatarUrl: '/luffy.png', wins: 42, battles: 50, winRate: 84, totalPoints: 34200, score: 34200 },
    { rank: 2, userId: 'u2', displayName: 'Elena Rostova', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', wins: 38, battles: 48, winRate: 79, totalPoints: 29800, score: 29800 },
    { rank: 3, userId: 'u3', displayName: 'David Kim', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', wins: 34, battles: 45, winRate: 75, totalPoints: 26400, score: 26400 },
    { rank: 4, userId: 'u4', displayName: 'Sara Chen', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', wins: 29, battles: 40, winRate: 72, totalPoints: 21500, score: 21500 },
    { rank: 5, userId: 'u5', displayName: 'Bekzod K.', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', wins: 25, battles: 38, winRate: 65, totalPoints: 18900, score: 18900 },
  ];
};
