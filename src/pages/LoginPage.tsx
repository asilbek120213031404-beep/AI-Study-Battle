import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { sound } from '../lib/sound';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, isAuthenticated, loading, error, clearError } = useAuth();

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    sound.click();
    clearError();
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error('Google sign-in attempt failed:', e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 p-4 relative transition-colors">
      
      {/* Back button */}
      <button
        onClick={() => {
          sound.click();
          navigate('/');
        }}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Bosh Sahifaga Qaytish
      </button>

      {/* Main Login Card */}
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
        
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
          <Swords className="w-8 h-8" />
        </div>

        <h1 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2">
          AI Study Battle Ga Xush Kelibsiz
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Dunyo bo'ylab bilimdonlar bilan bellashish uchun tizimga kiring.
        </p>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium mb-6 text-left">
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-outfit font-bold text-sm border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {loading ? 'Kirilmoqda...' : 'Google Orqali Kirish'}
        </button>

        {/* Security Policy Notice */}
        <div className="flex items-start gap-2 text-left p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Biz faqat ochiq profil va email ma'lumotlarini so'raymiz. API kalitini keyingi bosqichda xavfsiz ulashingiz mumkin.
          </p>
        </div>

      </div>
    </div>
  );
};
