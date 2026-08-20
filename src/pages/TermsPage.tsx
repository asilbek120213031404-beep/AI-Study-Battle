import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Shield, Scale, Users, AlertTriangle, Key } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { sound } from '../lib/sound';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Navigation back */}
        <Link
          to="/"
          onClick={() => sound.click()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Bosh Sahifaga Qaytish
        </Link>

        {/* Main Terms Container */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800/80 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-outfit font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                  Foydalanish Shartlari
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Oxirgi yangilanish: {new Date().toLocaleDateString('uz-UZ', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Umumiy Qoidalar */}
          <section className="space-y-3">
            <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-500" />
              1. Umumiy Qoidalar
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              **AI Study Battle** platformasidan foydalanish orqali siz ushbu Foydalanish Shartlariga to'liq rozilik bildirasiz. Platformamiz Sun'iy Intellekt texnologiyalari yordamida real vaqt rejimida ta'limiy bellashuvlar, savol-javoblar va intellektual musobaqalarni tashkillashtirish uchun mo'ljallangan.
            </p>
          </section>

          {/* Section 2: Hisob va Identifikatsiya */}
          <section className="space-y-3">
            <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              2. Akkaunt va Identifikatsiya
            </h2>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <li>Tizimga kirish Google OAuth autentifikatsiyasi orqali xavfsiz amalga oshiriladi.</li>
              <li>Foydalanuvchilar o'z profil ma'lumotlarining aniqligi va akkaunt xavfsizligi uchun mas'uldirlar.</li>
              <li>Boshqa foydalanuvchilar nomidan soxta akkaunt yaratish yoki firibgarlik qilish qat'iyan man etiladi.</li>
            </ul>
          </section>

          {/* Section 3: AI Kalitlari va Texnik Shartlar */}
          <section className="space-y-3">
            <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-500" />
              3. AI API Kalitlari va Foydalanish
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Foydalanuvchilar shaxsiy OpenAI yoki Gemini API kalitlarini taqdim etganlarida, kalitlar mijoz qurilmasida (Client-side) maxfiy shifrlanadi. Tizim maxfiy kalitlarni ochiq holda ma'lumotlar bazasida saqlamaydi va ulardan faqat bellashuv savollarini generatsiya qilish uchun foydalaniladi.
            </p>
          </section>

          {/* Section 4: Halol O'yin (Fair Play) */}
          <section className="space-y-3">
            <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              4. Halol O'yin va Anti-Cheat Qoidalari
            </h2>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                Taqiqlangan Harakatlar:
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Javoblarni avtomatlashtiruvchi botlar, skriptlar yoki brauzer kengaytmalaridan foydalanish.</li>
                <li>Database va RLS xavfsizlik siyosatlarini chetlab o'tishga urinish.</li>
                <li>Natijalar yoki ochkolarni soxtalashtirish. Qoidabuzar foydalanuvchilar tizimdan bloklanadi.</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Mas'uliyatni Cheklash */}
          <section className="space-y-3">
            <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-white">
              5. Mas'uliyatni Cheklash
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              AI Study Battle platformasi ta'limiy maqsadlarda taqdim etiladi. Sun'iy Intellekt modelidan generatsiya qilingan savollar va javoblarning 100% aniqligiga texnik kafolat berilmaydi, ammo doimiy ravishda aniqlik oshirib boriladi.
            </p>
          </section>

          {/* Footer Contact */}
          <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6 text-xs text-slate-500 dark:text-slate-400">
            Savol va takliflar uchun biz bilan bog'laning: <span className="font-semibold text-blue-600 dark:text-blue-400">support@aistudybattle.com</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
