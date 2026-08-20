import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getProfileSetupStatus } from '../services/authService';
import { Swords, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { sound } from '../lib/sound';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const handleAuthCallback = async () => {
      // Check if URL has error query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const errorMsg = urlParams.get('error_description') || hashParams.get('error_description');

      if (errorMsg) {
        if (isSubscribed) {
          setAuthError(`Tizimga kirish bekor qilindi yoki xatolik yuz berdi: ${decodeURIComponent(errorMsg)}`);
        }
        return;
      }

      if (!isSupabaseConfigured() || !supabase) {
        if (isSubscribed) {
          setAuthError('Supabase ma\'lumotlari sozlanmagan. Iltimos .env faylini tekshiring.');
        }
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          if (isSubscribed) {
            setAuthError(`Sessiyani tasdiqlashda xatolik: ${sessionError.message}`);
          }
          return;
        }

        if (session?.user) {
          const status = await getProfileSetupStatus(session.user.id);
          sound.victory();

          if (isSubscribed) {
            if (!status.isSetupComplete) {
              navigate('/onboarding', { replace: true });
            } else {
              navigate('/home', { replace: true });
            }
          }
        } else {
          // Listen for auth state change if session is still processing
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (newSession?.user && isSubscribed) {
              const status = await getProfileSetupStatus(newSession.user.id);
              subscription.unsubscribe();
              if (!status.isSetupComplete) {
                navigate('/onboarding', { replace: true });
              } else {
                navigate('/home', { replace: true });
              }
            }
          });

          // Timeout fallback if no session arrives within 6 seconds
          setTimeout(() => {
            if (isSubscribed && !session) {
              subscription.unsubscribe();
              setAuthError('Autentifikatsiya seansi topilmadi. Qaytadan kirishga urinib ko\'ring.');
            }
          }, 6000);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Kutilmagan xatolik yuz berdi.';
        if (isSubscribed) {
          setAuthError(msg);
        }
      }
    };

    handleAuthCallback();

    return () => {
      isSubscribed = false;
    };
  }, [navigate]);

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 p-4 transition-colors">
        <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h1 className="font-outfit font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mb-2">
            Autentifikatsiya Xatoligi
          </h1>

          <p className="text-xs text-rose-600 dark:text-rose-400 mb-6 leading-relaxed bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
            {authError}
          </p>

          <button
            onClick={() => {
              sound.click();
              navigate('/login', { replace: true });
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-outfit font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Login Sahifasiga Qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 p-4 transition-colors">
      <div className="flex flex-col items-center gap-4 glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center max-w-sm">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 text-white shadow-lg animate-pulse">
          <Swords className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 text-sm font-outfit font-bold text-slate-800 dark:text-white">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>Google orqali tizimga kirilmoqda...</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Iltimos kuting, tayyorlanmoqda...
        </p>
      </div>
    </div>
  );
};
