import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, openLogin } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Authentication Required</h2>
          <p className="text-sm text-slate-400">
            You must be logged in as an Administrator to access the Cinepass Admin Portal.
          </p>
          <button
            onClick={openLogin}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/30"
          >
            <LogIn className="w-4 h-4" />
            Sign In with Admin Account
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 bg-slate-900/80 border border-rose-500/30 rounded-3xl shadow-2xl backdrop-blur-md space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">403 — Access Denied</h2>
          <p className="text-sm text-slate-400">
            Your account does not have administrative privileges (`ROLE_ADMIN`) to view this console.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Cinema Catalog
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

