import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Database, Eye, KeyRound, Server } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { sound } from '../lib/sound';

export const PrivacyPolicyPage: React.FC = () => {
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

        {/* Main Privacy Policy Container */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800/80 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-outfit font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                  Maxfiylik Siyosati
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Oxirgi yangilanish: {new Date().toLocaleDateString('uz-UZ', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Qanday Ma'lumotlarni Yig'amiz */}
          <section className="space-y-3">
            <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              1. Yig'iladigan Ma'lumotlar
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              **AI Study Battle** foydalanuvchilarning maxfiyligini yuqori qadrlaydi. Biz faqat xizmat ko'rsatish uchun zarur bo'lgan quyidagi minimal ma'lumotlarni to'playmiz:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1 leading-relaxed">
              <li>**Profil Ma'lumotlari:** Google OAuth orqali taqdim etiladigan ism-sharif, profil rasmi va elektron pochta manzili.</li>
              <li>**Bellashuv Statistikasi:** G'alabalar soni, jami toplangan ballar va o'yin statistikasi.</li>
              <li>**API Kaliti Metama'lumotlari:** Ulangan kalit provayderi (OpenAI/Gemini) va oxirgi 4 ta belgisi.</li>
            </ul>
          </section>

          {/* Section 2: Email va Profil Maxfiyligi */}
          <section className="space-y-3">
            <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-500" />
              2. Elektron Pochta va Profil Maxfiyligi
            </h2>
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300 text-xs space-y-2">
              <p className="font-semibold text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                Email Manzillari Ochiq Emas!
              </p>
              <p>
                Sizning elektron pochta manzilingiz jamoat reytingida yoki boshqa foydalanuvchilarga ko'rinmaydi. Supabase Row Level Security (RLS) siyosatlariga ko'ra, elektron pochta manzilini faqat o'z egasi ko'ra oladi.
              </p>
            </div>
          </section>

          {/* Section 3: API Kalitlari Himoyasi */}
          <section className="space-y-3">
            <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-500" />
              3. API Kalitlari Havfsizligi
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Siz kiritgan shaxsiy OpenAI yoki Gemini API kalitlaringiz **hech qachon shifrlanmagan holda ma'lumotlar bazasida saqlanmaydi**. Kalitlar local saqlash joyida xavfsiz Shifrlash algoritmlari orqali himoyalanadi va uchinchi shaxslarga berilmaydi.
            </p>
          </section>

          {/* Section 4: Supabase & Ma'lumotlar Bazasi Xavfsizligi */}
          <section className="space-y-3">
            <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-amber-500" />
              4. PostgreSQL RLS va Xavfsizlik Architecturasi
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Bizning ma'lumotlar bazamiz **Supabase PostgreSQL** asosida qurilgan bo'lib, har bir jadval **Row Level Security (RLS)** siyosati va maxfiy **SECURITY DEFINER** funksiyalari bilan tamomila mustahkamlangan. Bellashuv savollarining to'g'ri javoblari va maxfiylik jadvallari mijoz uchun yopiq saqlanadi.
            </p>
          </section>

          {/* Section 5: Foydalanuvchi Huquqlari */}
          <section className="space-y-3">
            <h2 className="font-outfit font-bold text-lg text-slate-900 dark:text-white">
              5. Foydalanuvchi Huquqlari
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Foydalanuvchilar o'z profil ma'lumotlarini istalgan vaqtda yangilashlari, ulangan API kalitlarini o'chirishlari yoki akkauntlarini tizimdan chiqarib tashlashlari mumkin.
            </p>
          </section>

          {/* Footer Contact */}
          <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6 text-xs text-slate-500 dark:text-slate-400">
            Maxfiylik bo'yicha murojaatlar uchun: <span className="font-semibold text-emerald-600 dark:text-emerald-400">privacy@aistudybattle.com</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
