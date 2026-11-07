import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Film className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-white">404</h1>
        <h2 className="text-xl font-bold text-slate-200">Scene Not Found</h2>
        <p className="text-sm text-slate-400">
          The page or movie show you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30"
        >
          <Home className="w-4 h-4" />
          Return to Cinema Home
        </Link>
      </div>
    </div>
  );
};

