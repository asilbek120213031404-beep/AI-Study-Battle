import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Swords, Trophy, PlusCircle, LogIn, Menu, X, Key } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../ui/ThemeToggle';
import { sound } from '../../lib/sound';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, hasApiKey } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <Link 
          to={isAuthenticated ? "/home" : "/"} 
          onClick={() => sound.click()}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 text-white shadow-md group-hover:scale-105 transition-transform duration-300">
            <Swords className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <div className="font-outfit font-extrabold text-xl tracking-wide text-slate-900 dark:text-white flex items-center gap-1">
              AI STUDY <span className="gradient-text-blue">BATTLE</span>
            </div>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold tracking-widest uppercase">
              Sun'iy Intellekt Ta'lim Boshqaruvi
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <Link
                to="/home"
                onClick={() => sound.click()}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === '/home'
                    ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                Boshqaruv Paneli
              </Link>
              <Link
                to="/create-battle"
                onClick={() => sound.click()}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === '/create-battle'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Bellashuv Yaratish
              </Link>
              <Link
                to="/join-battle"
                onClick={() => sound.click()}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                Kodni Kiritish
              </Link>
              <Link
                to="/leaderboard"
                onClick={() => sound.click()}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === '/leaderboard'
                    ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                Reyting
              </Link>
            </>
          ) : (
            <>
              <a href="#how-it-works" className="px-3.5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                Qanday Ishlaydi?
              </a>
              <a href="#features" className="px-3.5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                Imkoniyatlar
              </a>
              <a href="#preview" className="px-3.5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                Ko'rinish
              </a>
            </>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/onboarding"
                onClick={() => sound.click()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  hasApiKey
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
                }`}
                title="API Kalit Sozlamalari"
              >
                <Key className="w-3.5 h-3.5" />
                {hasApiKey ? 'API Kaliti Ulangan' : 'API Kaliti Qo\'shish'}
              </Link>

              <Link
                to="/profile"
                onClick={() => sound.click()}
                className="group flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-transparent border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:border-blue-500/50 transition-all"
              >
                <img
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={user?.displayName || "Foydalanuvchi"}
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {user?.displayName || "Profil"}
                </span>
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => sound.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-outfit font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              Tizimga Kirish
            </Link>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            aria-label="Menyu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Boshqaruv Paneli
              </Link>
              <Link
                to="/create-battle"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white"
              >
                Bellashuv Yaratish
              </Link>
              <Link
                to="/join-battle"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Kodni Kiritish
              </Link>
              <Link
                to="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Reyting
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Profil & API Kalitlari
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white text-center"
              >
                Google Orqali Kirish
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
