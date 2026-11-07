import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { bookingApi } from '../api/bookingApi';
import { showApi } from '../api/showApi';
import { movieApi } from '../api/movieApi';
import { useToast } from '../context/ToastContext';
import {
  Ticket,
  Clock,
  Armchair,
  AlertCircle,
  RefreshCw,
  XCircle,
  QrCode,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [showsMap, setShowsMap] = useState(new Map());
  const [moviesMap, setMoviesMap] = useState(new Map());
  const [screensMap, setScreensMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, CONFIRMED, CANCELLED

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

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Ticket className="w-8 h-8 text-rose-500" />
            My Bookings & Tickets
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access your cinema passes, view allocation statuses, or manage cancellations.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Passes
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ALL'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          All Passes ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('CONFIRMED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CONFIRMED'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          Confirmed (
          {bookings.filter((b) => b.status === 'CONFIRMED').length})
        </button>
        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CANCELLED'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
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
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-200">Unable to Load Bookings</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No Passes in this Section</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
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
                className="rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all duration-300"
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
                        <div className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                          REF #{bId}
                        </div>
                        <h3 className="text-base font-extrabold text-white leading-tight">
                          {movie?.title || `Show #${booking.showId}`}
                        </h3>
                        <p className="text-xs text-rose-400 font-semibold mt-0.5">
                          {movie?.language || 'English'} • {movie?.genre || 'Cinema'}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shrink-0 ${
                        isConfirmed
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : isHeld
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Show and Screen details */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Screening Time
                      </span>
                      <span className="font-semibold text-slate-200">
                        {formatShowTime(show?.showTime)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Armchair className="w-3.5 h-3.5 text-slate-500" />
                        Screen & Theatre
                      </span>
                      <span className="font-semibold text-slate-200">
                        {screen?.name || `Screen ${show?.screenId || 1}`} (
                        {screen?.theatreName || 'Premier Cinema'})
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400">Allocated Seats</span>
                      <span className="font-extrabold text-rose-400 font-mono">
                        {seats.join(', ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Perforated Stub Divider */}
                <div className="relative flex items-center justify-between px-2">
                  <div className="w-4 h-8 rounded-r-full bg-slate-950 border-r border-t border-b border-slate-800 -ml-2" />
                  <div className="flex-1 border-b-2 border-dashed border-slate-800 mx-2" />
                  <div className="w-4 h-8 rounded-l-full bg-slate-950 border-l border-t border-b border-slate-800 -mr-2" />
                </div>

                {/* Ticket Bottom Stub */}
                <div className="p-6 bg-slate-950/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-slate-600 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Total Amount
                      </div>
                      <div className="text-base font-black text-emerald-400 font-mono">
                        ₹{total}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isConfirmed && (
                      <button
                        onClick={() => handleCancel(bId)}
                        disabled={cancellingId === bId}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3.5 py-2 rounded-xl transition-colors border border-rose-500/20"
                      >
                        <XCircle className="w-4 h-4" />
                        {cancellingId === bId ? 'Releasing...' : 'Cancel Booking'}
                      </button>
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
    </div>
  );
};
