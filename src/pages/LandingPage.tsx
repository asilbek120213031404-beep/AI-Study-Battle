import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Swords, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { sound } from '../lib/sound';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-grow">
        <section className="relative pt-12 lg:pt-20 pb-16 px-4 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl -z-10 pointer-events-none"></div>
          <div className="absolute top-1/3 right-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl -z-10 pointer-events-none"></div>

          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-semibold text-xs mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zamonaviy Ko'p Foydalanuvchili AI Ta'lim Platformasi</span>
            </div>

            <h1 className="font-outfit font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.1] mb-6">
              O'rgan. Bellash. <span className="gradient-text-hero">G'olib Bo'l.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
              Sun'iy intellekt yordamida do'stlaringiz bilan bilim bellashuvlarini o'tkazing. OpenAI va Google Gemini orqali bir necha soniyada testlar yarating.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                onClick={() => sound.click()}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-outfit font-extrabold text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Swords className="w-5 h-5" />
                Bellashuvni Boshlash
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-200 dark:bg-slate-800/90 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-outfit font-bold text-base border border-slate-300 dark:border-slate-700/60 flex items-center justify-center gap-2 transition-colors"
              >
                Qanday Ishlaydi?
              </a>
            </div>
          </div>

          <div id="preview" className="relative max-w-5xl mx-auto mt-6">
            <div className="glass-panel rounded-3xl p-4 sm:p-8 shadow-2xl border border-slate-300 dark:border-slate-800 relative">
              <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    alt="Asilbek"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500"
                  />
                  <div>
                    <div className="font-outfit font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                      Asilbek <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400">TASHKILOTCHI</span>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      850 Ball
                    </div>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-outfit font-black text-xs sm:text-sm border border-slate-300 dark:border-slate-700">
                  VS
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="font-outfit font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      Bekzod
                    </div>
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      720 Ball
                    </div>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                    alt="Bekzod"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Brain className="w-4 h-4" />
                  JavaScript &bull; Savol 4 / 10
                </span>
                <span className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono-code font-bold text-xs flex items-center gap-1 border border-rose-500/20 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  00:12
                </span>
              </div>

              <h3 className="font-outfit font-bold text-lg sm:text-2xl text-slate-900 dark:text-white mb-6">
                React da <code className="text-blue-600 dark:text-blue-400 font-mono-code px-2 py-0.5 rounded bg-blue-500/10">useState</code> Hook nima qaytaradi?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-semibold text-sm flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span>[ A ] State va setState metodlariga ega ob'ekt</span>
                </div>
                <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 font-bold text-sm flex items-center justify-between text-emerald-700 dark:text-emerald-300 shadow-md">
                  <span>[ B ] Joriy qiymat va yangilovchi funksiyadan iborat massiv</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-semibold text-sm text-slate-700 dark:text-slate-300">
                  <span>[ C ] Komponent kalitini anglatuvchi bitta satr qiymat</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent font-semibold text-sm text-slate-700 dark:text-slate-300">
                  <span>[ D ] Nishon elementga to'g'ridan-to'g'ri DOM havolasi</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Jonli Sinxronizatsiya Faol (Supabase Realtime)
                </span>
                <span>Tezlik Bonusi: +150 ball</span>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
              AI Study Battle Qanday Ishlaydi?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Atigi 4 ta oddiy qadamda bellashuvni boshlang.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-2xl p-6 relative">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-outfit font-extrabold text-xl flex items-center justify-center mb-4 border border-blue-500/20">
                1
              </div>
              <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white mb-2">
                Bellashuv Yaratish
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Mavzu, qiyinchilik darajasi, savollar soni va vaqtni tanlang.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-outfit font-extrabold text-xl flex items-center justify-center mb-4 border border-indigo-500/20">
                2
              </div>
              <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white mb-2">
                AI Test Yaratadi
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                OpenAI va Gemini API bir necha soniyada mantiqiy testlar tuzadi.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 relative">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-outfit font-extrabold text-xl flex items-center justify-center mb-4 border border-purple-500/20">
                3
              </div>
              <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white mb-2">
                Raqibni Taklif Qiling
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ulanish uchun 6 xonali xona kodini (masalan, <code className="font-mono-code font-bold text-blue-500">X7K29P</code>) ulashing.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-outfit font-extrabold text-xl flex items-center justify-center mb-4 border border-emerald-500/20">
                4
              </div>
              <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white mb-2">
                Bellash va G'olib Bo'l
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Savollarga javob bering, tezlik bonuslarini oling va reytingda birinchi bo'ling!
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800/80">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mb-4">
              Zamonaviy Ta'lim Uchun Yaratilgan
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Talabalar va dasturchilar uchun yuqori unumdorlikka ega intellektual platforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <Sparkles className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white mb-2">
                AI Savollar Genratotori
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Savollar takrorlanmaydi. Gemini va GPT har bir bellashuv uchun yangi va sifatli savollar tayyorlaydi.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <Zap className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white mb-2">
                Jonli Ko'p Foydalanuvchili Rejim
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Supabase Realtime yordamida o'yinchilar o'rtasida kechikishsiz real vaqt rejimida sinxronizatsiya.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <ShieldCheck className="w-8 h-8 text-indigo-500 mb-4" />
              <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white mb-2">
                Xavfsiz Kalitlar Siyosati
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Sizning API kalitingiz maxfiy saqlanadi va brauzerda yoki boshqa foydalanuvchilarga ko'rinmaydi.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-blue-600/5 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-outfit font-black text-3xl sm:text-4xl text-blue-600 dark:text-blue-400 mb-1">
                14,200+
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Yaratilgan Savollar
              </div>
            </div>

            <div>
              <div className="font-outfit font-black text-3xl sm:text-4xl text-emerald-600 dark:text-emerald-400 mb-1">
                3,850+
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                O'tkazilgan Bellashuvlar
              </div>
            </div>

            <div>
              <div className="font-outfit font-black text-3xl sm:text-4xl text-purple-600 dark:text-purple-400 mb-1">
                9+ Mavzular
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                Mavjud Fanlar
              </div>
            </div>

            <div>
              <div className="font-outfit font-black text-3xl sm:text-4xl text-pink-600 dark:text-pink-400 mb-1">
                4.2s
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                O'rtacha Javob Vaqti
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 max-w-4xl mx-auto text-center">
          <h2 className="font-outfit font-black text-3xl sm:text-5xl text-slate-900 dark:text-white mb-6">
            Navbatdagi bellashuvga tayyormisiz?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg mb-8">
            Google orqali kiring, API kalitingizni ulang va birinchi raqibingizga chorlov kiritib g'olib bo'ling.
          </p>
          <Link
            to="/login"
            onClick={() => sound.click()}
            className="inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-outfit font-extrabold text-lg shadow-xl shadow-blue-600/30 transition-all active:scale-95"
          >
            <Swords className="w-5 h-5" />
            Bellashuvni Boshlash
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
};
