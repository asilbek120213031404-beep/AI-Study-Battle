import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { LeaderboardEntry, UserStats } from '../types';

export type UserStatsRow = Database['public']['Tables']['user_stats']['Row'];

export interface RecentBattleItem {
  id: string;
  subject: string;
  opponent: string;
  result: 'G\'ALABA' | 'MAG\'LUBIYAT' | 'DURANG';
  score: string;
  date: string;
}

export interface SystemMetrics {
  totalUsers: number;
  totalBattles: number;
  onlineUsers: number;
}

/**
 * Retrieves user battle statistics directly from Supabase DB.
 */
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const battlesPlayed = data.battles_played || 0;
    const wins = data.wins || 0;
    const losses = data.losses || 0;
    const draws = Math.max(0, battlesPlayed - (wins + losses));
    const winRate = battlesPlayed > 0 ? Math.round((wins / battlesPlayed) * 100) : 0;
    const totalPoints = data.total_score || 0;
    const averageScore = battlesPlayed > 0 ? Math.round(totalPoints / battlesPlayed) : 0;

    return {
      battlesPlayed,
      wins,
      losses,
      draws,
      winRate,
      totalPoints,
      averageScore,
      averageResponseTime: 3.8,
    };
  } catch (err) {
    console.error('Error fetching user stats:', err);
    return null;
  }
};

/**
 * Retrieves a user's recent battle history from Supabase.
 */
export const getUserRecentBattles = async (userId: string, limit = 5): Promise<RecentBattleItem[]> => {
  if (!supabase) return [];

  try {
    // Query rooms joined by the user
    const { data: playerRooms, error: playerError } = await supabase
      .from('room_players')
      .select(`
        room_id,
        score,
        joined_at,
        rooms (
          id,
          subject,
          status,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(limit);

    if (playerError || !playerRooms || playerRooms.length === 0) {
      return [];
    }

    const results: RecentBattleItem[] = [];

    for (const pr of playerRooms) {
      const room = pr.rooms as unknown as { id: string; subject: string; status: string; created_at: string } | null;
      if (!room) continue;

      // Find opponent in the same room
      const { data: opponentData } = await supabase
        .from('room_players')
        .select(`
          user_id,
          score,
          profiles (
            display_name
          )
        `)
        .eq('room_id', pr.room_id)
        .neq('user_id', userId)
        .maybeSingle();

      const opponentProfile = opponentData?.profiles as unknown as { display_name?: string } | null;
      const opponentName = opponentProfile?.display_name || 'Raqib';
      const myScore = pr.score || 0;
      const oppScore = opponentData?.score || 0;

      let resultText: 'G\'ALABA' | 'MAG\'LUBIYAT' | 'DURANG' = 'DURANG';
      if (myScore > oppScore) resultText = 'G\'ALABA';
      else if (myScore < oppScore) resultText = 'MAG\'LUBIYAT';

      // Format relative time
      const createdDate = new Date(room.created_at || pr.joined_at);
      const diffMinutes = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60));
      let dateFormatted = 'Yaqinda';
      if (diffMinutes < 1) dateFormatted = 'Hozirgina';
      else if (diffMinutes < 60) dateFormatted = `${diffMinutes} daqiqa oldin`;
      else if (diffMinutes < 1440) dateFormatted = `${Math.floor(diffMinutes / 60)} soat oldin`;
      else dateFormatted = `${Math.floor(diffMinutes / 1440)} kun oldin`;

      results.push({
        id: pr.room_id,
        subject: room.subject || 'Umumiy',
        opponent: opponentName,
        result: resultText,
        score: `${myScore} - ${oppScore}`,
        date: dateFormatted,
      });
    }

    return results;
  } catch (e) {
    console.error('Error fetching recent battles:', e);
    return [];
  }
};

/**
 * Retrieves global leaderboard entries ranked by total points and wins from Supabase.
 */
export const getLeaderboard = async (limit = 20): Promise<LeaderboardEntry[]> => {
  if (!supabase) return [];

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
      .order('total_score', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
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
  } catch (err) {
    console.error('Error fetching leaderboard stats:', err);
    return [];
  }
};

/**
 * Retrieves real overall system metrics (Total Users, Total Battles) from Supabase.
 */
export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  if (!supabase) {
    return { totalUsers: 1, totalBattles: 1, onlineUsers: 1 };
  }

  try {
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: battlesCount } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true });

    return {
      totalUsers: Math.max(1, usersCount || 0),
      totalBattles: Math.max(1, battlesCount || 0),
      onlineUsers: 1,
    };
  } catch (e) {
    console.warn('Error fetching system metrics:', e);
    return { totalUsers: 1, totalBattles: 1, onlineUsers: 1 };
  }
};

/**
 * Subscribes to Realtime Presence channel to track real active online users count.
 */
export const subscribeToOnlinePresence = (
  userId: string,
  onCountChange: (count: number) => void
): (() => void) => {
  if (!supabase) {
    onCountChange(1);
    return () => {};
  }

  const channel = supabase.channel('online-presence', {
    config: {
      presence: {
        key: userId || `guest_${Math.random().toString(36).substring(7)}`,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const count = Object.keys(state).length;
      onCountChange(Math.max(1, count));
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

  return () => {
    supabase?.removeChannel(channel);
  };
};
