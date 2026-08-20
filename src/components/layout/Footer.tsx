import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, ShieldCheck } from 'lucide-react';
import { sound } from '../../lib/sound';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-panel border-t border-slate-200 dark:border-slate-800/80 py-8 px-4 lg:px-8 mt-auto transition-colors">
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
          <span>Xavfsiz Kalitlar Siyosati — Maxfiy Kalitlar Himoyalangan</span>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-slate-400">
          <div className="flex items-center gap-3 font-medium text-slate-600 dark:text-slate-300">
            <Link
              to="/terms"
              onClick={() => sound.click()}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Foydalanish Shartlari
            </Link>
            <span>&bull;</span>
            <Link
              to="/privacy-policy"
              onClick={() => sound.click()}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Maxfiylik Siyosati
            </Link>
          </div>
          <span>&copy; {new Date().getFullYear()} AI Study Battle</span>
        </div>

      </div>
    </footer>
  );
};
