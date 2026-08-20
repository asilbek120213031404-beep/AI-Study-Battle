import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Swords, Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 p-4 transition-colors">
        <div className="flex flex-col items-center gap-4 glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center max-w-sm">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 text-white shadow-lg animate-pulse">
            <Swords className="w-8 h-8" />
          </div>
          <div className="flex items-center gap-2 text-sm font-outfit font-bold text-slate-800 dark:text-white">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span>Tizimga kirish holati tekshirilmoqda...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
