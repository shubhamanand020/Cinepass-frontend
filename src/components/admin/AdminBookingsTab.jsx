import React, { useState } from 'react';
import { 
  Search, Ticket, Clock, CheckCircle2, XCircle, AlertCircle, 
  Trash2, Calendar, AlertTriangle 
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminBookingsTab = ({ 
  bookings, 
  moviesMap, 
  showsMap, 
  screensMap, 
  usersMap, 
  onAdminCancelBooking, 
  isLoading 
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const filteredBookings = bookings.filter((b) => {
    // Status Filter
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;

    // Search Query (booking id, user id, or seat numbers)
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = String(b.id).includes(q);
      const matchUser = String(b.userId).includes(q) || usersMap[b.userId]?.name?.toLowerCase().includes(q) || usersMap[b.userId]?.email?.toLowerCase().includes(q);
      const matchSeat = b.seatNumbers?.some((s) => s.toLowerCase().includes(q));
      const show = showsMap[b.showId];
      const movie = show ? moviesMap[show.movieId] : null;
      const matchMovie = movie?.title?.toLowerCase().includes(q);

      return matchId || matchUser || matchSeat || matchMovie;
    }

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'HOLD':
      case 'HELD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> In Hold
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Clock className="w-3.5 h-3.5" /> Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <AlertCircle className="w-3.5 h-3.5" /> {status}
          </span>
        );
    }
  };

  const handleOpenCancel = (booking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    const success = await onAdminCancelBooking(selectedBooking.id);
    if (success) {
      setCancelModalOpen(false);
      setSelectedBooking(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Booking ID, Customer, Movie, Seat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl text-xs overflow-x-auto">
          {['ALL', 'CONFIRMED', 'HOLD', 'CANCELLED', 'EXPIRED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Audit Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Booking</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Movie & Showtime</th>
                <th className="py-3.5 px-4">Allocated Seats</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 text-sm">
                    No bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const show = showsMap[b.showId];
                  const movie = show ? moviesMap[show.movieId] : null;
                  const screen = show ? screensMap[show.screenId] : null;
                  const user = usersMap[b.userId];
                  const createdDate = b.createdAt ? new Date(b.createdAt) : null;
                  const isCancellable = b.status === 'CONFIRMED' || b.status === 'HOLD' || b.status === 'HELD';

                  return (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-purple-400">
                        <div className="flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5" />
                          #{b.id}
                        </div>
                        <span className="text-[10px] text-slate-500 block font-normal mt-0.5">
                          {createdDate ? createdDate.toLocaleDateString() : ''}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-300 font-semibold">
                            {user?.name ? user.name.slice(0, 2).toUpperCase() : `U${b.userId}`}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 text-xs">
                              {user?.name || `Customer #${b.userId}`}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {user?.email || `User ID: ${b.userId}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                          {movie?.title || `Show #${b.showId}`}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {show?.showTime ? new Date(show.showTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Time Pending'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {screen ? `${screen.name} • ${screen.theatreName}` : ''}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {b.seatNumbers?.map((seat) => (
                            <span key={seat} className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-200 border border-slate-700 font-semibold">
                              {seat}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-100 flex items-center gap-0.5">
                          ₹{b.totalAmount}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(b.status)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isCancellable ? (
                          <button
                            onClick={() => handleOpenCancel(b)}
                            title="Admin Cancel Booking"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600 font-mono italic">
                            Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Admin Override: Cancel Booking"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="text-sm">
              <p className="font-semibold text-rose-200">Force cancel booking #{selectedBooking?.id}?</p>
              <p className="mt-1 text-xs text-rose-300/80">
                This will release seats <span className="font-mono font-bold text-white">{selectedBooking?.seatNumbers?.join(', ')}</span> back to available inventory and set the booking status to CANCELLED.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
