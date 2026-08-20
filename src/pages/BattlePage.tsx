import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Brain, CheckCircle2, XCircle } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import type { Question } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeRoom } from '../hooks/useRealtimeRoom';
import { sound } from '../lib/sound';
import { getAIOpponentChoice } from '../lib/ai';
import { submitAnswer as submitAnswerRPC } from '../services/battleService';

export const BattlePage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { room, players } = useRealtimeRoom(roomCode);

  // Dynamic questions from active room or fallback questions
  const questions: Question[] = room?.questions && room.questions.length > 0
    ? room.questions
    : [
        {
          id: 'q1',
          question: 'React da useState Hook nima qaytaradi?',
          options: [
            'State va setState metodlariga ega ob\'ekt',
            'Joriy qiymat va yangilovchi funksiyadan iborat massiv',
            'Komponent kalitini anglatuvchi bitta satr qiymat',
            'Nishon elementga to\'g\'ridan-to\'g\'ri DOM havolasi'
          ],
          correctAnswer: 1,
          explanation: 'useState [joriyHolat, yangilashFunksiyasi] juftligini qaytaradi.'
        },
        {
          id: 'q2',
          question: 'TypeScript da o\'zgaruvchilar turini avtomatik aniqlaydigan xususiyat nima deyiladi?',
          options: ['Type Casting', 'Type Inference (Turlarni chiqarish)', 'Type Injection', 'Type Assertion'],
          correctAnswer: 1,
          explanation: 'Type Inference biriktirilgan qiymatga qarab turini avtomatik aniqlaydi.'
        },
        {
          id: 'q3',
          question: 'PostgreSQL Supabase dagi Row Level Security (RLS) ning asosiy vazifasi nima?',
          options: ['Ustunlarni shifrlash', 'Har bir qator uchun ruxsat qoidalarini belgilash', 'Ma\'lumotlar bazasi indekslarini optimallashtirish', 'Avtomatik zaxira nusxalash'],
          correctAnswer: 1,
          explanation: 'RLS siyosati foydalanuvchilar qaysi qatorlarni ko\'rishi va o\'zgartirishi mumkinligini cheklaydi.'
        }
      ];

  const opponentPlayer = players.find(p => p.userId !== user?.id) || {
    displayName: 'Nexus_AI (Raqib)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  };

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [, setOpponentSelectedOption] = useState<number | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(room?.timePerQuestion || 15);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const currentQ = questions[currentIndex] || questions[0];

  useEffect(() => {
    if (isAnswered) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 4) sound.tick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered]);

  useEffect(() => {
    if (isAnswered || !currentQ) return;

    const botChoice = getAIOpponentChoice(currentQ.correctAnswer, currentQ.options.length, room?.difficulty || 'medium');

    const botTimer = setTimeout(() => {
      setOpponentSelectedOption(botChoice.chosenAnswer);
      if (botChoice.chosenAnswer === currentQ.correctAnswer) {
        setOpponentScore(prev => prev + 500 + Math.floor((timeLeft / (room?.timePerQuestion || 15)) * 200));
      }
    }, botChoice.delayMs);

    return () => clearTimeout(botTimer);
  }, [currentIndex, isAnswered, currentQ, room?.difficulty, room?.timePerQuestion]);

  const handleTimeout = () => {
    setIsAnswered(true);
    sound.wrong();
    setTimeout(nextQuestion, 2000);
  };

  const handleSelectOption = async (idx: number) => {
    if (isAnswered) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctAnswer;
    const responseTimeMs = ((room?.timePerQuestion || 15) - timeLeft) * 1000;

    // Submit answer securely to Supabase question_answers table via RPC if valid UUID
    if (currentQ.id && !currentQ.id.startsWith('q') && !currentQ.id.startsWith('ai_gen') && !currentQ.id.startsWith('dyn')) {
      try {
        await submitAnswerRPC(currentQ.id, idx, Math.max(0, responseTimeMs));
      } catch (err) {
        console.warn('Supabase submit_answer RPC notice:', err);
      }
    }

    if (isCorrect) {
      sound.correct();
      const speedBonus = Math.floor((timeLeft / (room?.timePerQuestion || 15)) * 350);
      setPlayerScore(prev => prev + 500 + speedBonus);
    } else {
      sound.wrong();
    }

    setTimeout(nextQuestion, 2200);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setOpponentSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(room?.timePerQuestion || 15);
    } else {
      sound.victory();
      navigate(`/result/${roomCode}`, {
        state: {
          playerScore: playerScore + (selectedOption === currentQ.correctAnswer ? 500 : 0),
          opponentScore,
          totalQuestions: questions.length,
          questions,
          subject: room?.subject || 'Umumiy'
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Battle Header Bar */}
        <div className="glass-panel rounded-3xl p-6 mb-8 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
          
          {/* Player Info */}
          <div className="flex items-center gap-3">
            <img
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt="Siz"
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500"
            />
            <div>
              <div className="font-outfit font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                {user?.displayName || "Asilbek R."} (Siz)
              </div>
              <div className="font-outfit font-black text-xl text-blue-600 dark:text-blue-400">
                {playerScore} <span className="text-xs font-normal text-slate-400">ball</span>
              </div>
            </div>
          </div>

          {/* Timer & Question Order */}
          <div className="flex flex-col items-center">
            <div className={`px-4 py-1.5 rounded-2xl font-mono-code font-black text-lg flex items-center gap-1.5 border shadow-sm ${timeLeft <= 4
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 animate-timer-warning'
                : 'bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700'
              }`}>
              <Clock className="w-4 h-4" />
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
              Savol {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Opponent Info */}
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="font-outfit font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                {opponentPlayer.displayName}
              </div>
              <div className="font-outfit font-black text-xl text-indigo-600 dark:text-indigo-400">
                {opponentScore} <span className="text-xs font-normal text-slate-400">ball</span>
              </div>
            </div>
            <img
              src={opponentPlayer.avatarUrl}
              alt="Raqib"
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500"
            />
          </div>
        </div>

        {/* Question Panel */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              Bellashuv Savoli ({room?.subject || 'Umumiy'})
            </span>
          </div>

          <h2 className="font-outfit font-extrabold text-xl sm:text-3xl text-slate-900 dark:text-white mb-8 leading-snug">
            {currentQ.question}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctAnswer;

              let btnStyle = "bg-transparent border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-blue-500/60 hover:bg-blue-500/10";

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-lg";
                } else if (isSelected && !isCorrect) {
                  btnStyle = "bg-rose-500/20 border-2 border-rose-500 text-rose-700 dark:text-rose-300 font-bold";
                } else {
                  btnStyle = "bg-transparent border-slate-200 dark:border-slate-800 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`p-5 rounded-2xl border text-left font-outfit text-sm sm:text-base flex items-center justify-between transition-all duration-200 shadow-sm ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono-code font-bold text-xs px-2.5 py-1 rounded-lg bg-transparent border border-slate-300 dark:border-slate-700/80 text-slate-600 dark:text-slate-300">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {isAnswered && currentQ.explanation && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 animate-fadeIn">
              <strong className="block mb-1 font-bold">Yechim Tushuntirishi:</strong>
              {currentQ.explanation}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
