import React, { useState } from 'react';
import { 
  Search, Ticket, Clock, CheckCircle2, XCircle, AlertCircle, 
  Trash2, Calendar, AlertTriangle, Download, ShieldCheck 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { bookingApi } from '../../api/bookingApi';
import { useToast } from '../../context/ToastContext';

export const AdminBookingsTab = ({ 
  bookings, 
  moviesMap, 
  showsMap, 
  screensMap, 
  usersMap, 
  onAdminCancelBooking, 
  onRefresh, 
  isLoading 
}) => {
  const toast = useToast();
  const showToast = (msg, type = 'info') => {
    if (toast.showToast) {
      toast.showToast(msg, type);
    } else if (type === 'success' && toast.success) {
      toast.success(msg);
    } else if (type === 'error' && toast.error) {
      toast.error(msg);
    } else if (type === 'warning' && toast.warning) {
      toast.warning(msg);
    } else if (toast.info) {
      toast.info(msg);
    }
  };
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  
  // Ticket Verification Gate Scanner State
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyTokenInput, setVerifyTokenInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const filteredBookings = bookings.filter((b) => {
    // Status Filter
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;

    // Search Query (booking id, user id, seat numbers, or token)
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = String(b.id).includes(q);
      const matchUser = String(b.userId).includes(q) || usersMap[b.userId]?.name?.toLowerCase().includes(q) || usersMap[b.userId]?.email?.toLowerCase().includes(q);
      const matchSeat = b.seatNumbers?.some((s) => s.toLowerCase().includes(q));
      const matchToken = b.ticketToken?.toLowerCase().includes(q);
      const show = showsMap[b.showId];
      const movie = show ? moviesMap[show.movieId] : null;
      const matchMovie = movie?.title?.toLowerCase().includes(q);

      return matchId || matchUser || matchSeat || matchToken || matchMovie;
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

  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    if (!verifyTokenInput.trim()) {
      showToast('Please enter a ticket token to verify', 'error');
      return;
    }

    try {
      setVerifying(true);
      const result = await bookingApi.verifyTicket(verifyTokenInput.trim());
      setVerifyResult(result);
      if (result.valid) {
        showToast(result.message || 'Ticket verified successfully!', 'success');
      } else if (result.alreadyCheckedIn) {
        showToast(result.message || 'Warning: Ticket was already checked in', 'warning');
      } else {
        showToast(result.message || 'Invalid ticket pass', 'error');
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error verifying ticket:', err);
      const msg = err.response?.data?.message || 'Verification failed. Token not found or invalid.';
      setVerifyResult({ valid: false, alreadyCheckedIn: false, message: msg });
      showToast(msg, 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleDirectDownload = async (bookingId) => {
    try {
      setDownloadingId(bookingId);
      await bookingApi.downloadTicketPdf(bookingId);
      showToast('Ticket PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('Error downloading ticket PDF:', err);
      showToast('Failed to download PDF ticket pass', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const openVerifyForToken = (token) => {
    setVerifyTokenInput(token);
    setVerifyResult(null);
    setVerifyModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Booking ID, Customer, Movie, Seat, Token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
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

          {/* Gate Scanner Button */}
          <button
            onClick={() => {
              setVerifyTokenInput('');
              setVerifyResult(null);
              setVerifyModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4" />
            Gate Scanner
          </button>
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
                        {b.ticketToken && (
                          <button
                            onClick={() => openVerifyForToken(b.ticketToken)}
                            className="text-[10px] font-mono text-purple-400 hover:text-purple-300 hover:underline block text-left mt-0.5"
                            title="Click to check in this ticket token"
                          >
                            Token: {b.ticketToken.slice(0, 8)}...
                          </button>
                        )}
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
                        {b.checkedInAt && (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Checked In
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => openVerifyForToken(b.ticketToken || '')}
                                title="Check In / Verify Gate Pass"
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors text-xs inline-flex items-center"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDirectDownload(b.id)}
                                disabled={downloadingId === b.id}
                                title="Download PDF Pass"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs inline-flex items-center"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {isCancellable ? (
                            <button
                              onClick={() => handleOpenCancel(b)}
                              title="Admin Cancel Booking"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors text-xs inline-flex items-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-xs text-slate-600 font-mono italic">
                              Closed
                            </span>
                          )}
                        </div>
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

      {/* Gate Scanner & Ticket Verification Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title="Gate Admission & Ticket Verifier"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <form onSubmit={handleVerifyTicket} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Scan or Enter Ticket Token *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                value={verifyTokenInput}
                onChange={(e) => setVerifyTokenInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={verifying}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 whitespace-nowrap"
              >
                {verifying ? 'Scanning...' : 'Verify Ticket'}
              </button>
            </div>
          </form>

          {verifyResult && (
            <div className={`p-4 rounded-2xl border space-y-3 animate-fadeIn ${
              verifyResult.valid 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : verifyResult.alreadyCheckedIn
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {verifyResult.valid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Valid Admission Pass • Check-in OK</span>
                    </>
                  ) : verifyResult.alreadyCheckedIn ? (
                    <>
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Already Checked In (Used Pass)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Invalid Ticket</span>
                    </>
                  )}
                </span>
                {verifyResult.checkedInAt && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    verifyResult.valid 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {verifyResult.alreadyCheckedIn ? 'Prior Check-In: ' : 'Checked In: '}
                    {new Date(verifyResult.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-white">
                {verifyResult.message}
              </p>

              {(verifyResult.valid || verifyResult.alreadyCheckedIn) && (
                <div className="pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Movie</span>
                    <span className="font-bold text-white">{verifyResult.movieTitle}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Screen</span>
                    <span className="font-medium text-slate-200">{verifyResult.theatreName} • {verifyResult.screenName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Showtime</span>
                    <span className="font-medium text-slate-200">
                      {verifyResult.showTime ? new Date(verifyResult.showTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Seats</span>
                    <span className="font-mono font-bold text-rose-400">{verifyResult.seatNumbers?.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Booking Ref</span>
                    <span className="font-mono text-purple-400">#{verifyResult.bookingId}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={() => setVerifyModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
