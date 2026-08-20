import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, LogOut } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { getSecureApiKey, removeSecureApiKey, maskApiKey } from '../lib/security';
import { sound } from '../lib/sound';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUserProfile } = useAuth();
  const apiKey = getSecureApiKey();

  const handleRemoveKey = () => {
    sound.click();
    removeSecureApiKey();
    updateUserProfile({ hasApiKey: false, apiKeyMasked: undefined });
  };

  const handleLogout = async () => {
    sound.click();
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto px-4 py-8 w-full">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 text-center sm:text-left">
            <img
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={user?.displayName || "User"}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-500 shadow-lg"
            />
            <div className="flex-grow">
              <h1 className="font-outfit font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                {user?.displayName || "Asilbek R."}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {user?.email || "user@example.com"}
              </p>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-500/20">
                12-Darajali Bilimdon
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/20 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Tizimdan Chiqish
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-outfit font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-500" />
                API Kalit Sozlamalari
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${apiKey
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                }`}>
                {apiKey ? 'Ulangan' : 'Sozlanmagan'}
              </span>
            </div>

            {apiKey ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono-code text-sm font-bold text-slate-700 dark:text-slate-300">
                    {maskApiKey(apiKey)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/onboarding')}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                    >
                      Kalitni Yangilash
                    </button>
                    <button
                      onClick={handleRemoveKey}
                      className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Maxsus AI testlarini yaratish uchun kalitni kiriting</span>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  API Kalitni Ulash
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">Bellashuvlar</span>
              <strong className="font-outfit font-black text-xl text-slate-900 dark:text-white">24</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">G'alabalar</span>
              <strong className="font-outfit font-black text-xl text-emerald-600 dark:text-emerald-400">16</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">Mag'lubiyatlar</span>
              <strong className="font-outfit font-black text-xl text-rose-600 dark:text-rose-400">7</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">G'alaba Foizi</span>
              <strong className="font-outfit font-black text-xl text-blue-600 dark:text-blue-400">67%</strong>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
