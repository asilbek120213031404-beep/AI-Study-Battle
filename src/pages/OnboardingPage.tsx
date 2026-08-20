import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, CheckCircle2, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { validateOpenAIApiKey, saveSecureApiKey, maskApiKey, getSecureApiKey, removeSecureApiKey } from '../lib/security';
import { sound } from '../lib/sound';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();

  const existingKey = getSecureApiKey();
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validation = validateOpenAIApiKey(apiKeyInput);
    if (!validation.valid) {
      setError(validation.error || 'Yaroqsiz API kalit');
      sound.wrong();
      return;
    }

    saveSecureApiKey(apiKeyInput, true);
    sound.correct();
    setSuccess(true);
    updateUserProfile({ hasApiKey: true, apiKeyMasked: maskApiKey(apiKeyInput) });

    setTimeout(() => {
      navigate('/home');
    }, 1200);
  };

  const handleRemoveKey = () => {
    removeSecureApiKey();
    setApiKeyInput('');
    setSuccess(false);
    updateUserProfile({ hasApiKey: false, apiKeyMasked: undefined });
    sound.click();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 p-4 transition-colors">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
          <Key className="w-7 h-7" />
        </div>

        <h1 className="font-outfit font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2">
          API Kalit Sozlamasi
        </h1>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          Sizning API kalitingiz faqat maxsus AI bellashuv testlarini tuzish uchun ishlatiladi.
        </p>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-6">
          <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
            <Lock className="w-4 h-4" />
            Xavfsizlik va Maxfiylik Kafolati
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
            <li>Kalit to'liqlicha sizga tegishli.</li>
            <li>U maxfiy saqlanadi va hech qachon ommaga ko'rsatilmaydi.</li>
            <li>U raqiblarga yoki brauzer jurnallariga chiqmaydi.</li>
            <li>Saqlangandan so'ng u <code className="font-mono-code font-bold text-blue-500">sk-••••••••1234</code> ko'rinishida yashiriladi.</li>
          </ul>
        </div>

        {existingKey && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  API Kaliti Ulangan
                </div>
                <div className="text-xs font-mono-code text-slate-500 dark:text-slate-400">
                  {maskApiKey(existingKey)}
                </div>
              </div>
            </div>
            <button
              onClick={handleRemoveKey}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-colors"
            >
              O'chirish
            </button>
          </div>
        )}

        <form onSubmit={handleSaveKey} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              API Kalitini Kiriting (sk-...)
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono-code focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              API kalit xavfsiz saqlandi! Yo'naltirilmoqda...
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-outfit font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              API Kalitni Saqlash
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                sound.click();
                navigate('/home');
              }}
              className="py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
            >
              Hozircha O'tkazib Yuborish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
