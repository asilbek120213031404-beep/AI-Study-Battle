import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const auth = useAuthContext();

  return {
    user: auth.user,
    supabaseUser: auth.supabaseUser,
    session: auth.session,
    isAuthenticated: auth.isAuthenticated,
    hasApiKey: auth.hasApiKey,
    loading: auth.loading,
    error: auth.error,
    loginWithGoogle: auth.signInWithGoogle,
    signInWithGoogle: auth.signInWithGoogle,
    logout: auth.logout,
    updateUserProfile: auth.updateUserProfile,
    clearError: auth.clearError,
  };
};
