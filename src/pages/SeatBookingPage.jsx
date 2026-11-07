import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { showApi } from '../api/showApi';
import { movieApi } from '../api/movieApi';
import { bookingApi } from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ScreenVisual } from '../components/seats/ScreenVisual';
import { SeatMap } from '../components/seats/SeatMap';
import { BookingSummaryPanel } from '../components/seats/BookingSummaryPanel';
import { BookingConfirmationModal } from '../components/seats/BookingConfirmationModal';
import {
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Clock,
  Armchair,
  AlertCircle,
  Film,
} from 'lucide-react';

export const SeatBookingPage = () => {
  const { showId } = useParams();
  const { isAuthenticated, openLogin } = useAuth();
  const { success, error: toastError, warning, info } = useToast();

  const [show, setShow] = useState(null);
  const [movie, setMovie] = useState(null);
  const [screen, setScreen] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  // Fetch show details, movie, and live seat availability
  const loadShowAndSeats = useCallback(async () => {
    setError(null);
    try {
      const showData = await showApi.getShowById(showId);
      setShow(showData);

      // Load associated movie and screen
      const [movieData, screenData, availabilityData] = await Promise.allSettled([
        showData.movieId ? movieApi.getMovieById(showData.movieId) : null,
        showData.screenId ? showApi.getScreenById(showData.screenId) : null,
        showApi.getAvailability(showId),
      ]);

      if (movieData.status === 'fulfilled') setMovie(movieData.value);
      if (screenData.status === 'fulfilled') setScreen(screenData.value);

      if (availabilityData.status === 'fulfilled' && availabilityData.value) {
        setSeats(availabilityData.value);
      } else {
        // Fallback to static seats layout from show-service
        const staticSeats = await showApi.getSeats(showId);
        setSeats(staticSeats.map((s) => ({ ...s, status: 'AVAILABLE' })));
      }
    } catch (err) {
      setError(err.message || 'Failed to load show and seat layout.');
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    loadShowAndSeats();
  }, [loadShowAndSeats]);

  // Periodic polling for live availability every 15s when no active hold is held by the current user
  useEffect(() => {
    if (activeBooking) return; // don't disrupt current hold

    const interval = setInterval(async () => {
      try {
        const live = await showApi.getAvailability(showId);
        if (live && live.length > 0) {
          setSeats(live);
        }
      } catch {
        // ignore background poll error
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [showId, activeBooking]);

  // Handle seat click
  const handleToggleSeat = (seat) => {
    if (activeBooking) {
      warning('You already have active held seats. Please confirm or release your current hold.');
      return;
    }

    const seatNum = seat.seatNumber;
    setSelectedSeatNumbers((prev) => {
      if (prev.includes(seatNum)) {
        return prev.filter((s) => s !== seatNum);
      } else {
        if (prev.length >= 8) {
          warning('Maximum 8 seats can be reserved per booking.');
          return prev;
        }
        return [...prev, seatNum];
      }
    });
  };

  // Convert selected seat numbers to full seat objects
  const selectedSeatObjects = seats.filter((s) =>
    selectedSeatNumbers.includes(s.seatNumber)
  );

  // Trigger 5-Minute Atomic Seat Hold
  const handleHoldSeats = async () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    if (selectedSeatNumbers.length === 0) {
      warning('Please pick at least one seat to reserve.');
      return;
    }

    setActionLoading(true);
    try {
      const booking = await bookingApi.holdSeats({
        showId: Number(showId),
        seatNumbers: selectedSeatNumbers,
      });

      setActiveBooking(booking);
      success(
        `Seats ${booking.seatNumbers.join(', ')} successfully locked for 5 minutes!`
      );

      // Refresh seat statuses
      const live = await showApi.getAvailability(showId);
      if (live) setSeats(live);
    } catch (err) {
      toastError(err.message || 'Could not hold seats. Some may already be taken.');
      // Refresh to get fresh state
      loadShowAndSeats();
    } finally {
      setActionLoading(false);
    }
  };

  // Release/Cancel current hold
  const handleReleaseHold = async () => {
    if (!activeBooking) {
      setSelectedSeatNumbers([]);
      return;
    }

    const bId = activeBooking.bookingId || activeBooking.id;
    setActionLoading(true);
    try {
      await bookingApi.cancelBooking(bId);
      info('Seats released back to cinema pool.');
    } catch (err) {
      console.warn('Hold release notice:', err);
    } finally {
      setActiveBooking(null);
      setSelectedSeatNumbers([]);
      setActionLoading(false);
      loadShowAndSeats();
    }
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!activeBooking) return;
    const bId = activeBooking.bookingId || activeBooking.id;

    setActionLoading(true);
    try {
      const confirmed = await bookingApi.confirmBooking(bId);
      setActiveBooking(confirmed);
      setIsBookingConfirmed(true);
      success('Booking confirmed successfully! Enjoy the show.');
      loadShowAndSeats();
    } catch (err) {
      toastError(err.message || 'Booking confirmation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading cinema layout and seats...</p>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Unable to Load Show</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">{error || 'Show not found.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Movies
        </Link>
      </div>
    );
  }

  const formatShowTime = (timeStr) => {
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return '7:00 PM';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '7:00 PM';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={movie ? `/movie/${movie.id}` : '/'}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{movie ? `Back to ${movie.title}` : 'Back'}</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            5-Min Atomic Seat Engine
          </div>

          <button
            onClick={loadShowAndSeats}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-slate-400 dark:hover:text-white dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh Seats
          </button>
        </div>
      </div>

      {/* Show & Movie Title Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
            <Film className="w-3.5 h-3.5" />
            <span>{screen?.theatreName || 'Cinepass Premier Cinemas'}</span>
            <span>•</span>
            <span>{screen?.name || `Screen ${show.screenId}`}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {movie?.title || `Show #${show.id}`}
          </h1>
        </div>

        <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-200">
            <Clock className="w-4 h-4 text-rose-500" />
            <span>{formatShowTime(show.showTime)}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
            <Armchair className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span>₹{show.basePrice || 250} / ₹{show.premiumPrice || 350}</span>
          </div>
        </div>
      </div>

      {/* Main Grid & Summary Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Section: Screen & Interactive Seat Map */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-2xl flex flex-col items-center">
          {/* Cinema Screen Visual Curve */}
          <ScreenVisual />

          {/* Seat Grid Map */}
          <SeatMap
            seats={seats}
            selectedSeats={selectedSeatNumbers}
            heldSeats={activeBooking?.seatNumbers || []}
            onToggleSeat={handleToggleSeat}
            isHoldActive={!!activeBooking}
          />
        </div>

        {/* Right Section: Booking & Hold Summary Panel */}
        <div className="lg:col-span-4 sticky top-24">
          <BookingSummaryPanel
            selectedSeats={selectedSeatObjects}
            activeBooking={activeBooking}
            onHoldSeats={handleHoldSeats}
            onProceedToConfirm={() => setIsConfirmModalOpen(true)}
            onReleaseHold={handleReleaseHold}
            loading={actionLoading}
            isAuthenticated={isAuthenticated}
            onPromptLogin={openLogin}
          />
        </div>
      </div>

      {/* Confirmation & Payment Dialog Modal */}
      <BookingConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          if (!isBookingConfirmed) {
            setIsConfirmModalOpen(false);
          }
        }}
        booking={activeBooking}
        movie={movie}
        show={show}
        onConfirm={handleConfirmBooking}
        loading={actionLoading}
        confirmed={isBookingConfirmed}
      />
    </div>
  );
};
