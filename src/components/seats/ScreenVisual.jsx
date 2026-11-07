import React from 'react';
import { Monitor } from 'lucide-react';

export const ScreenVisual = () => {
  return (
    <div className="w-full max-w-3xl mx-auto my-8 flex flex-col items-center">
      {/* Curved Screen Banner */}
      <div className="relative w-full h-12 flex items-center justify-center">
        {/* Glow arc */}
        <div className="absolute inset-x-8 top-0 h-4 bg-gradient-to-b from-rose-500/30 via-indigo-500/20 to-transparent blur-md rounded-t-[100%]" />
        
        {/* Curved screen line */}
        <div className="w-full h-2.5 bg-gradient-to-r from-slate-700 via-rose-500 to-slate-700 rounded-t-[100%] shadow-[0_-4px_20px_rgba(244,63,94,0.4)]" />

        {/* Projection light beam downwards */}
        <div className="absolute top-3 inset-x-12 h-16 bg-gradient-to-b from-rose-500/10 via-rose-500/5 to-transparent pointer-events-none transform -perspective-1000 rotateX-45" />
      </div>

      {/* Screen Label */}
      <div className="mt-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        <Monitor className="w-3.5 h-3.5 text-rose-500" />
        <span>All Eyes This Way • Cinema Screen</span>
      </div>
    </div>
  );
};

