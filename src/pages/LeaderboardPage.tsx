import React, { useState, useEffect } from 'react';
import { Trophy, Search } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { fetchLeaderboardData } from '../lib/supabase';
import type { LeaderboardEntry } from '../types';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchLeaderboardData().then(setLeaderboard);
  }, []);

  const filtered = leaderboard.filter(p => p.displayName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-500" />
              Umumiy Reyting
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              G'alabalar va ballar bo'yicha eng kuchli ishtirokchilar.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O'yinchini izlash..."
              className="w-full py-2.5 pl-9 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-transparent text-slate-500 dark:text-slate-400 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-4 px-6">O'rin</th>
                  <th className="py-4 px-6">O'yinchi</th>
                  <th className="py-4 px-6 text-center">G'alabalar</th>
                  <th className="py-4 px-6 text-center">Bellashuvlar</th>
                  <th className="py-4 px-6 text-center">G'alaba Foizi</th>
                  <th className="py-4 px-6 text-right">Jami Ball</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filtered.map((player) => (
                  <tr key={player.userId} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 px-6 font-outfit font-extrabold">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs ${
                        player.rank === 1 
                          ? 'bg-amber-500 text-white shadow-md' 
                          : player.rank === 2
                          ? 'bg-slate-400 text-white'
                          : player.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        #{player.rank}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={player.avatarUrl}
                          alt={player.displayName}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                        <span className="font-outfit font-bold text-slate-900 dark:text-white">
                          {player.displayName}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {player.wins}
                    </td>

                    <td className="py-4 px-6 text-center font-semibold text-slate-600 dark:text-slate-300">
                      {player.battles}
                    </td>

                    <td className="py-4 px-6 text-center font-bold text-blue-600 dark:text-blue-400">
                      {player.winRate}%
                    </td>

                    <td className="py-4 px-6 text-right font-mono-code font-bold text-purple-600 dark:text-purple-400">
                      {player.totalPoints.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
