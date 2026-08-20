import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useRealtimeRoom } from '../hooks/useRealtimeRoom';
import { useAuth } from '../hooks/useAuth';
import { sound } from '../lib/sound';

export const JoinBattlePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinRoom, loading, error } = useRealtimeRoom();
  const [code, setCode] = useState<string>('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.click();

    if (!code.trim()) return;

    const success = await joinRoom(code, {
      id: user?.id || 'usr_guest',
      displayName: user?.displayName || 'Bekzod K.',
      avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    if (success) {
      navigate(`/waiting-room/${code.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-md mx-auto px-4 py-12 w-full">
        
        <button
          onClick={() => {
            sound.click();
            navigate('/home');
          }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Boshqaruv Paneliga Qaytish
        </button>

        <div className="glass-panel rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
          
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-7 h-7" />
          </div>

          <h1 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white mb-2">
            Bellashuv Xonasiga Ulanish
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Raqibingiz bergan 6 xonali xona kodini kiriting.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="masalan: X7K29P"
                className="w-full py-4 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-outfit font-black text-2xl uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.trim().length < 4}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-outfit font-extrabold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Swords className="w-4 h-4" />
                  Xonaga Ulanish
                </>
              )}
            </button>
          </form>

        </div>

      </main>

      <Footer />
    </div>
  );
};
