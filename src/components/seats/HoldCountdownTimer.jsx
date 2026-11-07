import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export const HoldCountdownTimer = ({ expiresAt, onExpire }) => {
  const [remaining, setRemaining] = useState(() => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const target = new Date(expiresAt).getTime();
      const sec = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setRemaining(sec);

      if (sec <= 0) {
        if (onExpire) onExpire();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = remaining < 60;
  const isWarning = remaining < 120 && !isUrgent;

  let colorClasses = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
  if (isUrgent) {
    colorClasses = 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse';
  } else if (isWarning) {
    colorClasses = 'bg-amber-500/15 border-amber-500/40 text-amber-300';
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider transition-all shadow-lg ${colorClasses}`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
      ) : (
        <Clock className="w-4 h-4 shrink-0" />
      )}
      <span>Seats Locked for:</span>
      <span className="text-sm font-extrabold">{formattedTime}</span>
    </div>
  );
};
