import React from 'react';
import { Modal } from '../common/Modal';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Ticket,
  Clock,
  Armchair,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export const BookingConfirmationModal = ({
  isOpen,
  onClose,
  booking,
  movie,
  show,
  onConfirm,
  loading = false,
  confirmed = false,
}) => {
  if (!booking) return null;

  const total = booking.totalAmount ? Number(booking.totalAmount).toFixed(2) : '0.00';
  const seats = booking.seatNumbers || [];
  const bookingId = booking.bookingId || booking.id;

  const formatShowTime = (timeStr) => {
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return '7:00 PM';
      return d.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Today, 7:00 PM';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={confirmed ? 'Booking Confirmed! 🎉' : 'Confirm Your Reservation'}
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {!confirmed ? (
          /* Confirmation Review Step */
          <>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-base text-white">
                      {movie?.title || 'Selected Movie'}
                    </h4>
                    <p className="text-xs text-rose-400 font-semibold mt-0.5">
                      {movie?.language || 'English'} • {movie?.genre || 'Cinema'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                    Seat Lock Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800/80 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatShowTime(show?.showTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5 text-slate-500" />
                    <span>Seats: {seats.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Price summary */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm">
                <span className="text-slate-400 font-medium">Total Amount Due</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  ₹{total}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-1/3 py-3 px-4 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Back
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="w-2/3 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Confirming Reservation...
                  </>
                ) : (
                  <>
                    Confirm & Complete Booking
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Confirmation Success Ticket View */
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Tickets Confirmed!</h3>
              <p className="text-xs text-slate-400">
                Your reservation has been atomically saved and confirmed in Cinepass.
              </p>
            </div>

            {/* Cinema Ticket Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 shadow-2xl space-y-4 text-left relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500">
                    Booking Reference
                  </span>
                  <div className="text-base font-extrabold text-emerald-400 font-mono">
                    #{bookingId}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase">
                  CONFIRMED
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white text-sm">{movie?.title}</div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Screen & Time</span>
                  <span className="font-semibold text-slate-200">
                    Screen {show?.screenId || 1} • {formatShowTime(show?.showTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allocated Seats</span>
                  <span className="font-bold text-rose-400 font-mono">
                    {seats.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                  <span className="text-slate-300">Total Paid</span>
                  <span className="text-emerald-400 font-mono">₹{total}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/my-bookings"
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                Go to My Bookings
              </Link>
              <Link
                to="/"
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center"
              >
                Back to Movies
              </Link>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
