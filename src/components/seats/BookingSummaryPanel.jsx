import React from 'react';
import { Armchair, ShieldCheck, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { HoldCountdownTimer } from './HoldCountdownTimer';

export const BookingSummaryPanel = ({
  selectedSeats = [],
  activeBooking = null,
  onHoldSeats,
  onProceedToConfirm,
  onReleaseHold,
  loading = false,
  isAuthenticated = false,
  onPromptLogin,
}) => {
  // Compute price totals from selectedSeats objects
  const standardSeats = selectedSeats.filter((s) => s.seatType !== 'PREMIUM');
  const premiumSeats = selectedSeats.filter((s) => s.seatType === 'PREMIUM');

  const standardTotal = standardSeats.reduce((sum, s) => sum + Number(s.price || 0), 0);
  const premiumTotal = premiumSeats.reduce((sum, s) => sum + Number(s.price || 0), 0);
  const subtotal = standardTotal + premiumTotal;

  // Use booking's actual total amount if held, otherwise computed subtotal
  const grandTotal = activeBooking?.totalAmount ? Number(activeBooking.totalAmount) : subtotal;

  const isHoldActive = activeBooking && activeBooking.status === 'HELD';

  return (
    <div className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Armchair className="w-5 h-5 text-rose-500" />
          Booking Summary
        </h3>

        {isHoldActive && (
          <HoldCountdownTimer
            expiresAt={activeBooking.holdExpiresAt}
            onExpire={onReleaseHold}
          />
        )}
      </div>

      {/* Selected Seats Tag List */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Selected Seats ({selectedSeats.length})
        </div>

        {selectedSeats.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
            No seats selected yet. Click on available seats in the seat map.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedSeats.map((seat) => (
              <span
                key={seat.seatNumber}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                  seat.seatType === 'PREMIUM'
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-300'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                }`}
              >
                {seat.seatNumber} ({seat.seatType === 'PREMIUM' ? '₹' + seat.price : '₹' + seat.price})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      {selectedSeats.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {standardSeats.length > 0 && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Standard Seats ({standardSeats.length} × ₹{standardSeats[0]?.price || 250})</span>
              <span className="text-slate-900 dark:text-slate-200 font-semibold font-mono">₹{standardTotal.toFixed(2)}</span>
            </div>
          )}

          {premiumSeats.length > 0 && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Premium Seats ({premiumSeats.length} × ₹{premiumSeats[0]?.price || 350})</span>
              <span className="text-slate-900 dark:text-slate-200 font-semibold font-mono">₹{premiumTotal.toFixed(2)}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
            <span>Total Payable:</span>
            <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2">
        {!isHoldActive ? (
          <button
            type="button"
            disabled={selectedSeats.length === 0 || loading}
            onClick={() => {
              if (!isAuthenticated) {
                onPromptLogin();
              } else {
                onHoldSeats();
              }
            }}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Locking Seats in Real Time...
              </>
            ) : !isAuthenticated ? (
              <>
                Sign In to Lock Seats
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Hold Seats for 5 Minutes
              </>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              disabled={loading}
              onClick={onProceedToConfirm}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Confirming Booking...
                </>
              ) : (
                <>
                  Confirm Booking (₹{grandTotal.toFixed(2)})
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onReleaseHold}
              disabled={loading}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel & Release Hold
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

