import React from 'react';
import { Swords, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel border-t border-slate-200 dark:border-slate-800/80 py-10 px-4 lg:px-8 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 dark:text-slate-400 text-xs">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <div className="font-outfit font-bold text-sm text-slate-900 dark:text-white">
              AI STUDY BATTLE
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Sun'iy Intellektga Asoslangan Ta'lim Platformasi
            </p>
          </div>
        </div>

        {/* Security & Architecture Statement */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-center">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Xavfsiz Kalitlar Siyosati — OpenAI & Gemini Maxfiy Kalitlari Himoyalangan</span>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1 text-slate-400">
          <span>&copy; {new Date().getFullYear()} AI Study Battle. Barcha huquqlar himoyalangan.</span>
        </div>

      </div>
    </footer>
  );
};
