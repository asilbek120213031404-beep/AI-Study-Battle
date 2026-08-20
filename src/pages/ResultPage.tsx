import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import type { Question } from '../types';
import { sound } from '../lib/sound';

export const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as {
    playerScore?: number;
    opponentScore?: number;
    totalQuestions?: number;
    questions?: Question[];
  } || {};

  const playerScore = state.playerScore ?? 2850;
  const opponentScore = state.opponentScore ?? 2100;
  const isWinner = playerScore >= opponentScore;

  useEffect(() => {
    if (isWinner) {
      sound.victory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      sound.defeat();
    }
  }, [isWinner]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800 shadow-2xl mb-8 relative overflow-hidden">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <span className="px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-500/20 inline-block mb-3">
            BELLASHUV YAKUNLANDI
          </span>

          <h1 className="font-outfit font-black text-4xl sm:text-6xl text-slate-900 dark:text-white mb-2">
            {isWinner ? '🏆 SIZ G\'OLIB BO\'LDINGIZ!' : 'MAG\'LUBIYAT'}
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            {isWinner ? 'Ajoyib natija! Siz intellektual maydonda g\'alaba qozondingiz.' : 'Yomon emas! Reytingni egallash uchun yana tayyorlaning.'}
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto p-6 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 mb-8">
            <div className="text-center border-r border-slate-300 dark:border-slate-800 pr-4">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Sizning Yakuniy Ballingiz</div>
              <div className="font-outfit font-black text-3xl sm:text-4xl text-emerald-600 dark:text-emerald-400">
                {playerScore}
              </div>
            </div>

            <div className="text-center pl-4">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Raqib Balli</div>
              <div className="font-outfit font-black text-3xl sm:text-4xl text-blue-600 dark:text-blue-400">
                {opponentScore}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-8 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Aniqlik</span>
              <strong className="text-slate-900 dark:text-white font-bold text-base">90%</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">To'g'ri Javoblar</span>
              <strong className="text-emerald-500 font-bold text-base">4 / 5</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">O'rtacha Vaqt</span>
              <strong className="text-purple-400 font-bold text-base">3.4s</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                sound.click();
                navigate('/create-battle');
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-outfit font-extrabold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Yana O'ynash
            </button>

            <button
              onClick={() => {
                sound.click();
                navigate('/home');
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-outfit font-bold text-sm border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              Bosh Sahifaga Qaytish
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
