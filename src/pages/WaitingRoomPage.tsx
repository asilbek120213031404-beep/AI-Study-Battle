import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Users, ArrowLeft, Play } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useRealtimeRoom } from '../hooks/useRealtimeRoom';
import { sound } from '../lib/sound';

export const WaitingRoomPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { room, players, startBattle } = useRealtimeRoom(roomCode);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      sound.click();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = () => {
    sound.victory();
    startBattle();
    navigate(`/battle/${roomCode}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto px-4 py-8 w-full">
        <button
          onClick={() => {
            sound.click();
            navigate('/home');
          }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Xonadan Chiqish
        </button>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="text-center mb-8">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-500/20 inline-block mb-3">
              BELLASHUV KUTISH XONASI
            </span>

            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="font-outfit font-black text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-widest bg-slate-100 dark:bg-slate-900 px-6 py-2 rounded-2xl border border-slate-300 dark:border-slate-700">
                {roomCode || 'X7K29P'}
              </div>
              <button
                onClick={handleCopy}
                className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md active:scale-95"
                title="Xona Kodini Nusxalash"
              >
                {copied ? <Check className="w-6 h-6 text-emerald-300" /> : <Copy className="w-6 h-6" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ushbu kodni raqibingizga ulashing.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mb-8 text-center text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Fan / Mavzu</span>
              <strong className="text-slate-900 dark:text-white font-bold">{room?.subject || 'JavaScript'}</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Qiyinchilik</span>
              <strong className="text-slate-900 dark:text-white font-bold capitalize">{room?.difficulty === 'easy' ? 'Oson' : room?.difficulty === 'hard' ? 'Qiyin' : 'O\'rta'}</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Savollar</span>
              <strong className="text-slate-900 dark:text-white font-bold">{room?.questionCount || 10} ta</strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">Vaqt</span>
              <strong className="text-slate-900 dark:text-white font-bold">{room?.timePerQuestion || 15}s / Savol</strong>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="font-outfit font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Xonadagi O'yinchilar ({players.length} / 2)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-blue-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <img
                    src={players[0]?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt="Tashkilotchi"
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <div className="font-outfit font-bold text-sm text-slate-900 dark:text-white">
                      {players[0]?.displayName || "Asilbek R."}
                    </div>
                    <div className="text-[11px] text-blue-500 font-semibold">Tashkilotchi (Tayyor)</div>
                  </div>
                </div>
              </div>

              {players.length >= 2 ? (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <img
                      src={players[1]?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                      alt="Raqib"
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <div className="font-outfit font-bold text-sm text-slate-900 dark:text-white">
                        {players[1]?.displayName || "Bekzod K."}
                      </div>
                      <div className="text-[11px] text-emerald-500 font-semibold">Raqib (Tayyor)</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-100/40 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                      ?
                    </div>
                    <div>
                      <div className="font-outfit font-bold text-sm text-slate-500 dark:text-slate-400">
                        Raqib kutilmoqda...
                      </div>
                      <div className="text-[11px] text-slate-400">Xona kodini yuboring</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-outfit font-extrabold text-base shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Play className="w-5 h-5 fill-white" />
            Bellashuvni Hozir Boshlash
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};
