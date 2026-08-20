import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Sparkles, Swords, ArrowLeft, Loader2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import type { Subject, Difficulty } from '../types';
import { useRealtimeRoom } from '../hooks/useRealtimeRoom';
import { useAuth } from '../hooks/useAuth';
import { sound } from '../lib/sound';

export const CreateBattlePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createRoom, loading, error } = useRealtimeRoom();

  const [subject, setSubject] = useState<Subject>('JavaScript');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(15);

  const subjectsList: Subject[] = [
    'JavaScript',
    'React',
    'TypeScript',
    'Python',
    'Matematika',
    'Fizika',
    'Tarix',
    'Ingliz tili',
    'Umumiy Bilimlar'
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.click();

    try {
      const roomCode = await createRoom(
        { subject, difficulty, questionCount, timePerQuestion },
        {
          id: user?.id || 'usr_host',
          displayName: user?.displayName || 'Asilbek R.',
          avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        }
      );
      navigate(`/waiting-room/${roomCode}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
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
          Boshqaruv Paneliga Qaytish
        </button>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-outfit font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                Bellashuv Xonasini Yaratish
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bellashuv sozlamalarini tanlang. AI siz uchun maxsus test tuzadi.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Fanni Tanlang
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {subjectsList.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      sound.click();
                      setSubject(s);
                    }}
                    className={`py-3 px-3.5 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between border ${
                      subject === s
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500/50'
                    }`}
                  >
                    <span>{s}</span>
                    {subject === s && <Sparkles className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Qiyinchilik Darajasi
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      sound.click();
                      setDifficulty(d);
                    }}
                    className={`py-3 px-4 rounded-xl text-xs font-bold capitalize transition-all border ${
                      difficulty === d
                        ? d === 'easy' 
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : d === 'medium'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-purple-600 text-white border-purple-500'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {d === 'easy' ? 'Oson' : d === 'medium' ? 'O\'rta' : 'Qiyin'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Savollar Soni
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        sound.click();
                        setQuestionCount(c);
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border ${
                        questionCount === c
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Har Bir Savol Uchun Vaqt
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 30].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        sound.click();
                        setTimePerQuestion(t);
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border ${
                        timePerQuestion === t
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-outfit font-extrabold text-base shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI Savollarni Yaratmoqda...
                </>
              ) : (
                <>
                  <Swords className="w-5 h-5" />
                  Xona Yaratish va AI Testini Boshlash
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
