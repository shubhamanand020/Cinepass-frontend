import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldAlert, LogIn } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, openLogin } = useAuth();
  const { warning } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      warning('Please sign in to access this page.');
    }
  }, [isAuthenticated, warning]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 bg-slate-900/60 border border-slate-800 rounded-3xl shadow-xl backdrop-blur-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Authentication Required</h2>
          <p className="text-sm text-slate-400 mb-6">
            You need to be signed in to view this section or manage your bookings.
          </p>
          <button
            onClick={openLogin}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-lg shadow-rose-600/30"
          >
            <LogIn className="w-4 h-4" />
            Sign In with Cinepass
          </button>
        </div>
      </div>
    );
  }

  return children;
};

