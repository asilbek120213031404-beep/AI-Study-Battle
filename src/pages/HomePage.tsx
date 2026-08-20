import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Swords, Trophy, Key, Activity, Brain, Globe } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import {
  getUserStats,
  getUserRecentBattles,
  getLeaderboard,
  getSystemMetrics,
  subscribeToOnlinePresence,
  type RecentBattleItem,
  type SystemMetrics,
} from '../services/statsService';
import type { LeaderboardEntry, UserStats } from '../types';
import { sound } from '../lib/sound';

export const HomePage: React.FC = () => {
  const { user, hasApiKey } = useAuth();

  const [dbStats, setDbStats] = useState<UserStats | null>(null);
  const [recentBattles, setRecentBattles] = useState<RecentBattleItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({ totalUsers: 1, totalBattles: 1, onlineUsers: 1 });
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadDynamicData = async () => {
      setLoading(true);

      try {
        // 1. Fetch Leaderboard from Supabase
        const lbData = await getLeaderboard(5);
        if (isMounted) setLeaderboard(lbData);

        // 2. Fetch System Metrics (Total registered users, total battles)
        const sysData = await getSystemMetrics();
        if (isMounted) setMetrics(sysData);

        // 3. If authenticated user, fetch real DB user stats & recent battles
        if (user?.id) {
          const uStats = await getUserStats(user.id);
          if (isMounted && uStats) setDbStats(uStats);

          const rBattles = await getUserRecentBattles(user.id, 5);
          if (isMounted) setRecentBattles(rBattles);
        }
      } catch (err) {
        console.warn('Error loading dynamic dashboard data from Supabase:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDynamicData();

    // 4. Subscribe to Realtime Online Presence
    const unsubscribePresence = subscribeToOnlinePresence(
      user?.id || 'guest',
      (count) => {
        if (isMounted) setOnlineCount(count);
      }
    );

    return () => {
      isMounted = false;
      unsubscribePresence();
    };
  }, [user?.id]);

  // Combine authenticated stats from Supabase DB or fallback to user context
  const stats: UserStats = dbStats || user?.stats || {
    battlesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    totalPoints: 0,
    averageScore: 0,
    averageResponseTime: 0,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
        
        {/* Banner Card */}
        <div className="glass-panel rounded-3xl p-6 lg:p-8 mb-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            
            <div className="flex items-center gap-4">
              <img
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={user?.displayName || "O'yinchi"}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-outfit font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                    Xush kelibsiz, {user?.displayName || "O'yinchi"}!
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Jami {stats.wins} ta G'alaba
                  </span>
                  &bull;
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    {onlineCount} kishi Onlayn
                  </span>
                  &bull;
                  <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    Jami {metrics.totalUsers} foydalanuvchi
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <Link
                to="/create-battle"
                onClick={() => sound.click()}
                className="flex-1 sm:flex-initial py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-outfit font-extrabold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                Bellashuv Yaratish
              </Link>

              <Link
                to="/join-battle"
                onClick={() => sound.click()}
                className="flex-1 sm:flex-initial py-3.5 px-6 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-outfit font-bold text-sm border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Swords className="w-5 h-5 text-indigo-500" />
                Kodni Kiritish
              </Link>
            </div>
          </div>

          {!hasApiKey && (
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                <Key className="w-4 h-4 animate-bounce" />
                <span>OpenAI / Gemini API kaliti ulanmagan. Yangi AI testlarini yaratish uchun kalitni ulang.</span>
              </div>
              <Link
                to="/onboarding"
                onClick={() => sound.click()}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold hover:underline shrink-0"
              >
                Kalitni Ulash
              </Link>
            </div>
          )}
        </div>

        {/* Live User Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Jami Bellashuvlar
            </div>
            <div className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
              {stats.battlesPlayed}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              G'alabalar
            </div>
            <div className="font-outfit font-black text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400">
              {stats.wins}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              G'alaba Foizi
            </div>
            <div className="font-outfit font-black text-2xl sm:text-3xl text-blue-600 dark:text-blue-400">
              {stats.winRate}%
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              O'rtacha Ball
            </div>
            <div className="font-outfit font-black text-2xl sm:text-3xl text-purple-600 dark:text-purple-400">
              {stats.averageScore}
            </div>
          </div>
        </div>

        {/* Recent Battles & Top Players */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Battles */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-outfit font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                So'nggi Bellashuvlar
              </h2>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                Ma'lumotlar yuklanmoqda...
              </div>
            ) : recentBattles.length > 0 ? (
              <div className="space-y-3">
                {recentBattles.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-transparent border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100/30 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-outfit font-bold text-sm text-slate-900 dark:text-white">
                          {b.subject}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          vs {b.opponent} &bull; {b.date}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        b.result === 'G\'ALABA'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : b.result === 'DURANG'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                      }`}>
                        {b.result}
                      </span>
                      <div className="text-xs font-mono-code font-bold text-slate-600 dark:text-slate-300 mt-1">
                        {b.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Hali bellashuvlarda qatnashmadingiz.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  Ilk AI bellashuvingizni boshlang va bilimingizni sinovdan o'tkazing!
                </p>
                <Link
                  to="/create-battle"
                  onClick={() => sound.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  Yangi Bellashuv
                </Link>
              </div>
            )}
          </div>

          {/* Top Players */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-outfit font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Eng Kuchli O'yinchilar
              </h2>
              <Link to="/leaderboard" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Barchasini Ko'rish
              </Link>
            </div>

            <div className="space-y-3">
              {leaderboard.map((player) => (
                <div
                  key={player.userId}
                  className="flex items-center justify-between p-3 rounded-xl bg-transparent border border-slate-200/80 dark:border-slate-800/60 hover:bg-slate-100/30 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-outfit font-black text-xs ${
                      player.rank === 1 ? 'text-amber-500' : player.rank === 2 ? 'text-slate-400' : 'text-amber-700'
                    }`}>
                      #{player.rank}
                    </span>
                    <img
                      src={player.avatarUrl}
                      alt={player.displayName}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <span className="font-outfit font-bold text-xs text-slate-800 dark:text-slate-200">
                      {player.displayName}
                    </span>
                  </div>

                  <span className="text-xs font-mono-code font-bold text-blue-600 dark:text-blue-400">
                    {player.wins} G'alaba
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
