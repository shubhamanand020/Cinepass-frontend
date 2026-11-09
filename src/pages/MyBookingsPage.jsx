import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { bookingApi } from '../api/bookingApi';
import { showApi } from '../api/showApi';
import { movieApi } from '../api/movieApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Ticket,
  Clock,
  Armchair,
  AlertCircle,
  RefreshCw,
  XCircle,
  QrCode,
  Download,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { QrTicketModal } from '../components/seats/QrTicketModal';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600';

export const MyBookingsPage = () => {
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [showsMap, setShowsMap] = useState(new Map());
  const [moviesMap, setMoviesMap] = useState(new Map());
  const [screensMap, setScreensMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, CONFIRMED, CANCELLED
  const [selectedQrData, setSelectedQrData] = useState(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const { success, error: toastError } = useToast();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getMyBookings();
      const list = Array.isArray(data) ? data : [];
      setBookings(list);

      // Extract unique show IDs to fetch associated shows and movies
      const uniqueShowIds = Array.from(new Set(list.map((b) => b.showId).filter(Boolean)));

      if (uniqueShowIds.length > 0) {
        const [showsRes, screensRes] = await Promise.allSettled([
          Promise.all(uniqueShowIds.map((sId) => showApi.getShowById(sId).catch(() => null))),
          showApi.getScreens().catch(() => []),
        ]);

        const newShowsMap = new Map();
        const movieIdsToFetch = new Set();

        if (showsRes.status === 'fulfilled' && Array.isArray(showsRes.value)) {
          showsRes.value.forEach((s) => {
            if (s && s.id) {
              newShowsMap.set(s.id, s);
              if (s.movieId) movieIdsToFetch.add(s.movieId);
            }
          });
        }
        setShowsMap(newShowsMap);

        if (screensRes.status === 'fulfilled' && Array.isArray(screensRes.value)) {
          const newScreensMap = new Map();
          screensRes.value.forEach((sc) => newScreensMap.set(sc.id, sc));
          setScreensMap(newScreensMap);
        }

        if (movieIdsToFetch.size > 0) {
          const moviesRes = await Promise.all(
            Array.from(movieIdsToFetch).map((mId) =>
              movieApi.getMovieById(mId).catch(() => null)
            )
          );
          const newMoviesMap = new Map();
          moviesRes.forEach((m) => {
            if (m && m.id) newMoviesMap.set(m.id, m);
          });
          setMoviesMap(newMoviesMap);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings from Booking Service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (bookingId) => {
    if (
      !window.confirm(
        'Are you sure you want to cancel this booking? All reserved seats will be immediately returned to the cinema pool.'
      )
    ) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await bookingApi.cancelBooking(bookingId);
      success('Booking cancelled successfully and seats released.');
      fetchBookings();
    } catch (err) {
      toastError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleOpenQr = (booking) => {
    const show = showsMap.get(booking.showId);
    const movie = show ? moviesMap.get(show.movieId) : null;
    const screen = show ? screensMap.get(show.screenId) : null;
    setSelectedQrData({ booking, show, movie, screen });
    setIsQrOpen(true);
  };

  const handleDirectDownload = async (bookingId) => {
    try {
      setDownloadingId(bookingId);
      await bookingApi.downloadTicketPdf(bookingId);
      success('Ticket PDF downloaded successfully!');
    } catch (err) {
      console.error('Error downloading ticket PDF:', err);
      toastError('Failed to download PDF ticket pass');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    if (activeTab === 'CONFIRMED') {
      return bookings.filter((b) => b.status === 'CONFIRMED');
    }
    if (activeTab === 'CANCELLED') {
      return bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'EXPIRED');
    }
    return bookings;
  }, [bookings, activeTab]);

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
      return '7:00 PM';
    }
  };

  if (isAdmin) {
    return (
      <div className="py-20 text-center space-y-4 max-w-lg mx-auto animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Administrator Console Notice</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          The <span className="font-semibold text-rose-500">My Bookings</span> view is reserved for customer ticket management. As an Administrator, all cinema bookings, ticket statuses, and admission check-ins are monitored in the <span className="font-semibold text-amber-500">Bookings Audit</span> section.
        </p>
        <div className="pt-2">
          <Link
            to="/admin/dashboard?tab=bookings"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/25 active:scale-95"
          >
            Open All Bookings Audit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Ticket className="w-8 h-8 text-rose-500" />
            My Bookings & Tickets
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Access your cinema passes, view allocation statuses, or manage cancellations.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-slate-300 dark:hover:text-white dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Passes
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ALL'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
          }`}
        >
          All Passes ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('CONFIRMED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CONFIRMED'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
          }`}
        >
          Confirmed (
          {bookings.filter((b) => b.status === 'CONFIRMED').length})
        </button>
        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CANCELLED'
              ? 'bg-slate-700 dark:bg-slate-800 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
          }`}
        >
          Cancelled / Expired (
          {bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'EXPIRED').length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading your cinema bookings...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Unable to Load Bookings</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-200 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Passes in this Section</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {activeTab === 'ALL'
              ? "You haven't reserved any movie tickets yet. Pick a movie from our catalog to book your first cinema ticket."
              : `No tickets matching filter "${activeTab}".`}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => {
            const bId = booking.bookingId || booking.id;
            const isConfirmed = booking.status === 'CONFIRMED';
            const isHeld = booking.status === 'HELD';
            const isCancelled = booking.status === 'CANCELLED';
            const isExpired = booking.status === 'EXPIRED';

            const show = showsMap.get(booking.showId);
            const movie = show ? moviesMap.get(show.movieId) : null;
            const screen = show ? screensMap.get(show.screenId) : null;

            const seats = booking.seatNumbers || [];
            const total = booking.totalAmount ? Number(booking.totalAmount).toFixed(2) : '0.00';

            return (
              <div
                key={bId}
                className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-sm dark:shadow-2xl overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300"
              >
                {/* Ticket Top Half */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800 shadow">
                        <img
                          src={movie?.posterUrl || FALLBACK_POSTER}
                          alt={movie?.title || 'Movie'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500 tracking-wider">
                          REF #{bId}
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                          {movie?.title || `Show #${booking.showId}`}
                        </h3>
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                          {movie?.language || 'English'} • {movie?.genre || 'Cinema'}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${
                        isConfirmed
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : isHeld
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Show and Screen details */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        Screening Time
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">
                        {formatShowTime(show?.showTime)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Armchair className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        Screen & Theatre
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">
                        {screen?.name || `Screen ${show?.screenId || 1}`} (
                        {screen?.theatreName || 'Premier Cinema'})
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Allocated Seats</span>
                      <span className="font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                        {seats.join(', ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Perforated Stub Divider */}
                <div className="relative flex items-center justify-between px-2">
                  <div className="w-4 h-8 rounded-r-full bg-slate-50 dark:bg-slate-950 border-r border-t border-b border-slate-200 dark:border-slate-800 -ml-2" />
                  <div className="flex-1 border-b-2 border-dashed border-slate-200 dark:border-slate-800 mx-2" />
                  <div className="w-4 h-8 rounded-l-full bg-slate-50 dark:bg-slate-950 border-l border-t border-b border-slate-200 dark:border-slate-800 -mr-2" />
                </div>

                {/* Ticket Bottom Stub */}
                <div className="p-6 bg-slate-50/70 dark:bg-slate-950/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => isConfirmed && handleOpenQr(booking)}
                      disabled={!isConfirmed}
                      title={isConfirmed ? "Click to view full digital QR ticket" : ""}
                      className={`p-2 rounded-xl border transition-all ${
                        isConfirmed 
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 cursor-pointer' 
                          : 'bg-slate-900 text-slate-600 border-slate-800 cursor-default'
                      }`}
                    >
                      <QrCode className="w-7 h-7 shrink-0" />
                    </button>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Total Amount
                      </div>
                      <div className="text-base font-black text-emerald-400 font-mono">
                        ₹{total}
                      </div>
                      {booking.checkedInAt && (
                        <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Checked In
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {isConfirmed && (
                      <>
                        <button
                          onClick={() => handleOpenQr(booking)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 px-3 py-2 rounded-xl transition-all border border-rose-500/30 shadow-sm"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          View QR
                        </button>

                        <button
                          onClick={() => handleDirectDownload(bId)}
                          disabled={downloadingId === bId}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                        >
                          <Download className={`w-3.5 h-3.5 ${downloadingId === bId ? 'animate-bounce' : ''}`} />
                          {downloadingId === bId ? 'Saving...' : 'PDF Pass'}
                        </button>

                        <button
                          onClick={() => handleCancel(bId)}
                          disabled={cancellingId === bId}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 px-2.5 py-2 rounded-xl transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {cancellingId === bId ? 'Releasing...' : 'Cancel'}
                        </button>
                      </>
                    )}

                    {isHeld && (
                      <Link
                        to={`/booking/${booking.showId}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 px-3.5 py-2 rounded-xl transition-colors border border-amber-500/30"
                      >
                        Resume Booking
                      </Link>
                    )}

                    {(isCancelled || isExpired) && (
                      <span className="text-xs text-slate-500 italic">
                        {isCancelled ? 'Cancelled' : 'Expired'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scannable Digital QR Ticket Modal */}
      <QrTicketModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        booking={selectedQrData?.booking}
        show={selectedQrData?.show}
        movie={selectedQrData?.movie}
        screen={selectedQrData?.screen}
      />
    </div>
  );
};
