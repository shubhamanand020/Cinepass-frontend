import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Shield,
} from 'lucide-react';

// Calculate dynamic seat tier & price: last N rows closest to the back are Premium, front rows closest to screen are Standard
const enrichSeatsWithScreenConfig = (rawSeats, currentScreen, currentShow) => {
  if (!Array.isArray(rawSeats)) return [];
  if (!currentScreen?.rows || currentScreen.premiumRows === undefined) {
    return rawSeats;
  }

  const totalRows = Number(currentScreen.rows) || 0;
  const premiumRows = Math.max(0, Math.min(Number(currentScreen.premiumRows) || 0, totalRows));
  const premiumStartRow = totalRows - premiumRows;

  // Extract all unique row keys sorted alphabetically
  const uniqueRowKeys = Array.from(
    new Set(
      rawSeats.map((s) => {
        const match = s.seatNumber?.match(/^([A-Z]+)/);
        return match ? match[1] : s.seatNumber?.[0] || 'A';
      })
    )
  ).sort();

  const rowKeyToIndex = new Map();
  uniqueRowKeys.forEach((key, idx) => rowKeyToIndex.set(key, idx));

  return rawSeats.map((seat) => {
    const match = seat.seatNumber?.match(/^([A-Z]+)/);
    const rowKey = match ? match[1] : seat.seatNumber?.[0] || 'A';
    const rowIdx = rowKeyToIndex.has(rowKey)
      ? rowKeyToIndex.get(rowKey)
      : rowKey.charCodeAt(0) - 65;

    const isPremium = premiumRows > 0 && rowIdx >= premiumStartRow;
    const computedType = isPremium ? 'PREMIUM' : 'STANDARD';

    let computedPrice = seat.price;
    if (currentShow) {
      computedPrice = isPremium ? currentShow.premiumPrice : currentShow.basePrice;
    }

    return {
      ...seat,
      seatType: computedType,
      price: computedPrice !== undefined && computedPrice !== null ? computedPrice : seat.price,
    };
  });
};

export const SeatBookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, openLogin } = useAuth();
  const { success, error: toastError, warning, info } = useToast();

  useEffect(() => {
    if (isAdmin) {
      warning('Administrators cannot reserve customer seats. Redirecting to Admin Console.');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdmin, navigate, warning]);

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

      const screenObj = screenData.status === 'fulfilled' ? screenData.value : null;
      if (movieData.status === 'fulfilled') setMovie(movieData.value);
      if (screenObj) setScreen(screenObj);

      let fetchedSeats = [];
      if (availabilityData.status === 'fulfilled' && availabilityData.value) {
        fetchedSeats = availabilityData.value;
      } else {
        // Fallback to static seats layout from show-service
        const staticSeats = await showApi.getSeats(showId);
        fetchedSeats = staticSeats.map((s) => ({ ...s, status: 'AVAILABLE' }));
      }
      setSeats(enrichSeatsWithScreenConfig(fetchedSeats, screenObj, showData));
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
          setSeats(enrichSeatsWithScreenConfig(live, screen, show));
        }
      } catch {
        // ignore background poll error
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [showId, activeBooking, screen, show]);

  const [currentTime] = useState(() => Date.now());

  // Check if show has already ended or started
  const isShowExpired = useMemo(() => {
    if (!show?.showTime) return false;
    const t = new Date(show.showTime).getTime();
    return !isNaN(t) && t < currentTime;
  }, [show, currentTime]);

  // Handle seat click
  const handleToggleSeat = (seat) => {
    if (isShowExpired) {
      warning('This screening has already concluded. Online seat reservations are closed.');
      return;
    }

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
    if (isShowExpired) {
      toastError('This screening has already concluded. Booking is closed.');
      return;
    }

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
      if (live) setSeats(enrichSeatsWithScreenConfig(live, screen, show));
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

  if (isAdmin) {
    return (
      <div className="py-24 text-center space-y-4">
        <Shield className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Administrator Access Restricted</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Customer seat reservations are restricted for ROLE_ADMIN. You can manage cinema showtimes and review booking audits in the Admin Console.
        </p>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-lg shadow-amber-600/20"
        >
          Open Admin Operations Console
        </Link>
      </div>
    );
  }

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
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Unable to Load Show</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">{error || 'Show not found.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Movies
        </Link>
      </div>
    );
  }

  if (isShowExpired) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Screening Concluded</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This theatrical screening took place in the past. Online ticket reservations are no longer available for this showtime.
        </p>
        <div className="pt-2">
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20"
          >
            <Film className="w-4 h-4" />
            Browse Upcoming Movies
          </Link>
        </div>
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
            5-Minute Guaranteed Seat Hold
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

      {/* Expired Show Warning Banner */}
      {isShowExpired && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="font-bold">Screening Concluded (Booking Closed)</p>
              <p className="text-xs text-amber-700 dark:text-amber-400/90 mt-0.5">
                This show was scheduled for {formatShowTime(show.showTime)} and has already ended. Seat reservation is disabled.
              </p>
            </div>
          </div>
          <Link
            to={movie ? `/movie/${movie.id}` : '/'}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors shrink-0"
          >
            Select Active Show
          </Link>
        </div>
      )}

      {/* Main Grid & Summary Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Section: Screen & Interactive Seat Map */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-2xl flex flex-col items-center">
          {/* Cinema Screen Visual Curve */}
          <ScreenVisual />

          {/* Seat Grid Map */}
          <SeatMap
            seats={seats}
            screen={screen}
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
            isExpired={isShowExpired}
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
