import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit3, Trash2, Calendar, Clock, Tv, Sparkles, 
  AlertTriangle, CheckCircle2, History, LayoutGrid, X, AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminShowsTab = ({ 
  shows = [], 
  movies = [], 
  screens = [], 
  moviesMap = {}, 
  screensMap = {}, 
  onSaveShow, 
  onDeleteShow, 
  isLoading 
}) => {
  const [currentTime] = useState(() => Date.now());
  const [activeSection, setActiveSection] = useState('active'); // 'active' | 'expired' | 'all'
  const [filterMovieId, setFilterMovieId] = useState('');
  const [filterScreenId, setFilterScreenId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);

  // Form State supporting single (edit) and multiple showtimes (create)
  const [formData, setFormData] = useState({
    movieId: '',
    screenId: '',
    showTimes: [''], // for multiple showtimes in single operation
    showTime: '',    // for edit mode
    basePrice: 200,
    premiumPrice: 350
  });
  const [formErrors, setFormErrors] = useState({});
  const [conflictError, setConflictError] = useState(null);

  // Filter shows based on movie and screen dropdowns
  const filteredShows = useMemo(() => {
    return shows.filter((show) => {
      if (filterMovieId && String(show.movieId) !== String(filterMovieId)) return false;
      if (filterScreenId && String(show.screenId) !== String(filterScreenId)) return false;
      return true;
    });
  }, [shows, filterMovieId, filterScreenId]);

  // Partition shows into active (present/future) and expired
  const activeShows = useMemo(() => {
    return filteredShows.filter((s) => s.showTime && new Date(s.showTime).getTime() >= currentTime);
  }, [filteredShows, currentTime]);

  const expiredShows = useMemo(() => {
    return filteredShows.filter((s) => s.showTime && new Date(s.showTime).getTime() < currentTime);
  }, [filteredShows, currentTime]);

  const displayedShows = activeSection === 'active' 
    ? activeShows 
    : activeSection === 'expired' 
    ? expiredShows 
    : filteredShows;

  // Screen Allocations Overview computation
  const screenStats = useMemo(() => {
    return screens.map((screen) => {
      const screenShows = shows.filter((s) => String(s.screenId) === String(screen.id));
      const upcoming = screenShows.filter((s) => s.showTime && new Date(s.showTime).getTime() >= currentTime);
      const expired = screenShows.filter((s) => s.showTime && new Date(s.showTime).getTime() < currentTime);

      // Group upcoming shows by movie
      const movieMap = new Map();
      upcoming.forEach((s) => {
        if (!movieMap.has(s.movieId)) {
          movieMap.set(s.movieId, []);
        }
        movieMap.get(s.movieId).push(s);
      });

      return {
        screen,
        totalShows: screenShows.length,
        upcomingShows: upcoming,
        expiredShows: expired,
        movieMap,
        isActive: upcoming.length > 0,
      };
    });
  }, [screens, shows, currentTime]);

  const activeScreensCount = screenStats.filter((s) => s.isActive).length;
  const emptyScreensCount = screens.length - activeScreensCount;
  const totalExpiredShowsCount = useMemo(() => {
    return shows.filter((s) => s.showTime && new Date(s.showTime).getTime() < currentTime).length;
  }, [shows, currentTime]);

  // Conflict Detection Engine: detects overlapping movie showtimes on the same screen
  const detectConflict = (screenId, movieId, startTimeStr, excludeShowId = null) => {
    if (!screenId || !movieId || !startTimeStr) return null;
    const candidateStart = new Date(startTimeStr).getTime();
    if (isNaN(candidateStart)) return null;

    const candidateMovie = moviesMap[movieId];
    const candidateDuration = Number(candidateMovie?.duration) || 120;
    const candidateEnd = candidateStart + candidateDuration * 60 * 1000;

    for (const s of shows) {
      if (excludeShowId && s.id === excludeShowId) continue;
      if (String(s.screenId) !== String(screenId)) continue;
      if (!s.showTime) continue;

      const existingStart = new Date(s.showTime).getTime();
      if (isNaN(existingStart)) continue;
      const existingMovie = moviesMap[s.movieId];
      const existingDuration = Number(existingMovie?.duration) || 120;
      const existingEnd = existingStart + existingDuration * 60 * 1000;

      // Overlap: candidate starts before existing ends AND candidate ends after existing starts
      if (candidateStart < existingEnd && candidateEnd > existingStart) {
        return {
          conflictingShow: s,
          movieTitle: existingMovie?.title || `Movie #${s.movieId}`,
          screenName: screensMap[screenId]?.name || `Screen ${screenId}`,
          existingStart: new Date(existingStart),
          existingEnd: new Date(existingEnd),
        };
      }
    }
    return null;
  };

  // Detect internal conflicts within the multi-showtime batch on the same screen
  const detectBatchInternalConflict = (movieId, timeStrings) => {
    const movie = moviesMap[movieId];
    const duration = (Number(movie?.duration) || 120) * 60 * 1000;

    const intervals = timeStrings
      .map((t, idx) => ({ idx, start: new Date(t).getTime(), end: new Date(t).getTime() + duration }))
      .filter((item) => !isNaN(item.start));

    for (let i = 0; i < intervals.length; i++) {
      for (let j = i + 1; j < intervals.length; j++) {
        const a = intervals[i];
        const b = intervals[j];
        if (a.start < b.end && a.end > b.start) {
          return {
            slotA: i + 1,
            slotB: j + 1,
            timeA: timeStrings[i],
            timeB: timeStrings[j],
          };
        }
      }
    }
    return null;
  };

  // Modal Handlers
  const openCreateModal = (preselectedScreenId = '') => {
    setSelectedShow(null);
    setFormData({
      movieId: movies[0]?.id || '',
      screenId: preselectedScreenId || screens[0]?.id || '',
      showTimes: [''],
      showTime: '',
      basePrice: 200,
      premiumPrice: 350
    });
    setFormErrors({});
    setConflictError(null);
    setModalOpen(true);
  };

  const openEditModal = (show) => {
    setSelectedShow(show);
    let formattedDate = '';
    if (show.showTime) {
      formattedDate = show.showTime.substring(0, 16);
    }

    setFormData({
      movieId: show.movieId,
      screenId: show.screenId,
      showTimes: [formattedDate],
      showTime: formattedDate,
      basePrice: show.basePrice,
      premiumPrice: show.premiumPrice
    });
    setFormErrors({});
    setConflictError(null);
    setModalOpen(true);
  };

  const openDeleteModal = (show) => {
    setSelectedShow(show);
    setDeleteConfirmOpen(true);
  };

  // Multi-slot management
  const addShowtimeSlot = () => {
    setFormData((prev) => ({
      ...prev,
      showTimes: [...prev.showTimes, '']
    }));
  };

  const removeShowtimeSlot = (index) => {
    setFormData((prev) => ({
      ...prev,
      showTimes: prev.showTimes.filter((_, i) => i !== index)
    }));
  };

  const updateShowtimeSlot = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.showTimes];
      updated[index] = value;
      return { ...prev, showTimes: updated };
    });
    setConflictError(null);
  };

  // Format date helper for ISO submission
  const formatISO = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.length === 16 ? `${dateStr}:00` : dateStr;
  };

  const formatTimeStr = (dateObj) => {
    if (!dateObj) return '';
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const validate = () => {
    const errors = {};
    if (!formData.movieId) errors.movieId = 'Please select a movie';
    if (!formData.screenId) errors.screenId = 'Please select a cinema screen';

    if (selectedShow) {
      // Edit mode: single showtime
      if (!formData.showTime) {
        errors.showTime = 'Show date and time is required';
      }
    } else {
      // Create mode: multiple showtimes
      const validSlots = formData.showTimes.filter((t) => !!t.trim());
      if (validSlots.length === 0) {
        errors.showTimes = 'Please specify at least one showtime';
      }
    }

    if (!formData.basePrice || Number(formData.basePrice) <= 0) {
      errors.basePrice = 'Valid base ticket price required';
    }
    if (!formData.premiumPrice || Number(formData.premiumPrice) <= 0) {
      errors.premiumPrice = 'Valid premium ticket price required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError(null);
    if (!validate()) return;

    if (selectedShow) {
      // Validate single showtime conflict
      const conflict = detectConflict(formData.screenId, formData.movieId, formData.showTime, selectedShow.id);
      if (conflict) {
        setConflictError(
          `Scheduling Conflict on ${conflict.screenName}: "${conflict.movieTitle}" is already scheduled from ${formatTimeStr(conflict.existingStart)} to ${formatTimeStr(conflict.existingEnd)}. Overlapping schedules are not permitted on the same screen.`
        );
        return;
      }

      const payload = {
        movieId: parseInt(formData.movieId, 10),
        screenId: parseInt(formData.screenId, 10),
        showTime: formatISO(formData.showTime),
        basePrice: parseFloat(formData.basePrice),
        premiumPrice: parseFloat(formData.premiumPrice)
      };

      const success = await onSaveShow(payload, selectedShow.id);
      if (success) {
        setModalOpen(false);
      }
    } else {
      // Create mode: Validate multiple showtimes
      const validSlots = formData.showTimes.filter((t) => !!t.trim());

      // 1. Check for conflicts between slots in the same batch
      const batchConflict = detectBatchInternalConflict(formData.movieId, validSlots);
      if (batchConflict) {
        setConflictError(
          `Internal Batch Conflict: Showtime Slot #${batchConflict.slotA} (${batchConflict.timeA.replace('T', ' ')}) overlaps with Slot #${batchConflict.slotB} (${batchConflict.timeB.replace('T', ' ')}) for this movie run.`
        );
        return;
      }

      // 2. Check each slot against existing database shows on that screen
      for (let i = 0; i < validSlots.length; i++) {
        const slotTime = validSlots[i];
        const conflict = detectConflict(formData.screenId, formData.movieId, slotTime);
        if (conflict) {
          setConflictError(
            `Scheduling Conflict in Slot #${i + 1} (${slotTime.replace('T', ' ')}) on ${conflict.screenName}: "${conflict.movieTitle}" is already scheduled from ${formatTimeStr(conflict.existingStart)} to ${formatTimeStr(conflict.existingEnd)}. Please choose non-overlapping hours.`
          );
          return;
        }
      }

      // Construct payload array for single batch operation
      const payloads = validSlots.map((st) => ({
        movieId: parseInt(formData.movieId, 10),
        screenId: parseInt(formData.screenId, 10),
        showTime: formatISO(st),
        basePrice: parseFloat(formData.basePrice),
        premiumPrice: parseFloat(formData.premiumPrice)
      }));

      const success = await onSaveShow(payloads);
      if (success) {
        setModalOpen(false);
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedShow) return;
    const success = await onDeleteShow(selectedShow.id);
    if (success) {
      setDeleteConfirmOpen(false);
      setSelectedShow(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. SCREEN ALLOCATIONS & CAPACITY OVERVIEW */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <span>Cinema Screen Allocations Overview</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live monitor of active movie allocations, screen occupancy, and available scheduling slots.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200">
              Total Screens: <strong className="text-slate-900 dark:text-white ml-1 font-mono">{screens.length}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Active: <strong className="ml-1 font-mono">{activeScreensCount}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400">
              Available: <strong className="ml-1 font-mono">{emptyScreensCount}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400">
              Expired Runs: <strong className="ml-1 font-mono">{totalExpiredShowsCount}</strong>
            </span>
          </div>
        </div>

        {/* Screen Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {screenStats.map(({ screen, upcomingShows: upcoming, expiredShows: expired, movieMap, isActive }) => {
            const totalSeats = (screen.rows || 10) * (screen.seatsPerRow || 10);

            return (
              <div 
                key={screen.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive 
                    ? 'bg-white dark:bg-slate-900/90 border-slate-300 dark:border-slate-700/80 shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-300 dark:border-slate-800/80 border-dashed'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {screen.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{screen.theatreName}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isActive 
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                    }`}>
                      {isActive ? `${upcoming.length} Shows` : 'Available'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-2">
                    <span>Capacity: <strong className="text-slate-900 dark:text-slate-200">{totalSeats} seats</strong></span>
                    <span>Completed: <strong className="text-amber-600 dark:text-amber-400 font-mono">{expired.length}</strong></span>
                  </div>

                  {/* Scheduled Movies */}
                  <div className="space-y-2 pt-1">
                    {Array.from(movieMap.entries()).length === 0 ? (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-center">
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">No scheduled upcoming shows</p>
                        <button
                          onClick={() => openCreateModal(screen.id)}
                          className="mt-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Schedule Here
                        </button>
                      </div>
                    ) : (
                      Array.from(movieMap.entries()).map(([movieId, movieShows]) => {
                        const movie = moviesMap[movieId];
                        return (
                          <div key={movieId} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                              {movie?.title || `Movie #${movieId}`}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {movieShows.map((s) => (
                                <span 
                                  key={s.id} 
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/80 shadow-2xs font-semibold"
                                >
                                  {new Date(s.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Hall #{screen.id}</span>
                  <button
                    onClick={() => openCreateModal(screen.id)}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-semibold hover:underline"
                  >
                    + Add Show
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SECTION TABS & CONTROLS */}
      <div className="space-y-4">
        {/* Navigation Tabs: Active vs Expired vs All */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
            <button
              onClick={() => setActiveSection('active')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSection === 'active'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active Schedules ({activeShows.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('expired')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSection === 'expired'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Expired Showtimes ({expiredShows.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSection === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-800 shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>All ({filteredShows.length})</span>
            </button>
          </div>

          <button
            onClick={() => openCreateModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" /> Add Showtimes (Single / Multi-Slot)
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Movie Filter */}
          <select
            value={filterMovieId}
            onChange={(e) => setFilterMovieId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Movies ({movies.length})</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          {/* Screen Filter */}
          <select
            value={filterScreenId}
            onChange={(e) => setFilterScreenId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Screens ({screens.length})</option>
            {screens.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.theatreName})
              </option>
            ))}
          </select>

          {(filterMovieId || filterScreenId) && (
            <button
              onClick={() => {
                setFilterMovieId('');
                setFilterScreenId('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. SHOWS TABLE */}
      {activeSection === 'expired' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
          <History className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="font-bold text-amber-200">Theatrical Runs Archive</p>
            <p className="text-amber-300/80 mt-0.5">
              These screenings have concluded and are archived for administrative audit. They are automatically hidden from customer booking.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <th className="py-3.5 px-4">Show ID</th>
                <th className="py-3.5 px-4">Movie</th>
                <th className="py-3.5 px-4">Screen & Theatre</th>
                <th className="py-3.5 px-4">Showtime</th>
                <th className="py-3.5 px-4">Pricing</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {displayedShows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">
                    {activeSection === 'expired' 
                      ? 'No expired showtimes found.' 
                      : 'No scheduled shows match the selected filters.'}
                  </td>
                </tr>
              ) : (
                displayedShows.map((show) => {
                  const movie = moviesMap[show.movieId];
                  const screen = screensMap[show.screenId];
                  const showDate = show.showTime ? new Date(show.showTime) : null;
                  const isPast = showDate && showDate.getTime() < currentTime;

                  return (
                    <tr key={show.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        #{show.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
                            alt={movie?.title || 'Movie'}
                            className="w-9 h-12 object-cover rounded-md border border-slate-200 dark:border-slate-800 shadow-xs"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {movie?.title || `Movie #${show.movieId}`}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {movie?.genre} • {movie?.duration}m
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {screen?.name || `Screen #${show.screenId}`}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Tv className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          {screen?.theatreName || 'Main Complex'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 flex-wrap">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            {showDate ? showDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                            {isPast && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                Completed Run
                              </span>
                            )}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            {showDate ? showDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono">
                            Base: ₹{show.basePrice}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-mono flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3" /> ₹{show.premiumPrice}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(show)}
                            title="Edit Show"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(show)}
                            title="Delete Show"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 border border-rose-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* 4. SCHEDULE / EDIT SHOW MODAL (MULTI-SHOWTIME CAPABLE) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedShow ? 'Edit Scheduled Showtime' : 'Schedule Showtimes (Single or Multi-Slot)'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {conflictError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs space-y-1 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                <span>Scheduling Conflict Detected</span>
              </div>
              <p>{conflictError}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Movie *
            </label>
            <select
              value={formData.movieId}
              onChange={(e) => {
                setFormData({ ...formData, movieId: e.target.value });
                setConflictError(null);
              }}
              className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${
                formErrors.movieId ? 'border-rose-500' : 'border-slate-300 dark:border-slate-800'
              } rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500`}
            >
              <option value="">Select a movie from catalog...</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.language} - {m.duration}m)
                </option>
              ))}
            </select>
            {formErrors.movieId && <p className="text-xs text-rose-400 mt-1">{formErrors.movieId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Cinema Screen & Hall *
            </label>
            <select
              value={formData.screenId}
              onChange={(e) => {
                setFormData({ ...formData, screenId: e.target.value });
                setConflictError(null);
              }}
              className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${
                formErrors.screenId ? 'border-rose-500' : 'border-slate-300 dark:border-slate-800'
              } rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500`}
            >
              <option value="">Select an available screen...</option>
              {screens.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.theatreName} ({(s.rows || 0) * (s.seatsPerRow || 0)} seats)
                </option>
              ))}
            </select>
            {formErrors.screenId && <p className="text-xs text-rose-400 mt-1">{formErrors.screenId}</p>}
          </div>

          {/* Showtimes input: Single in Edit mode, Multi-Slot in Create mode */}
          {selectedShow ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Show Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.showTime}
                onChange={(e) => {
                  setFormData({ ...formData, showTime: e.target.value });
                  setConflictError(null);
                }}
                className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${
                  formErrors.showTime ? 'border-rose-500' : 'border-slate-300 dark:border-slate-800'
                } rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500`}
              />
              {formErrors.showTime && <p className="text-xs text-rose-400 mt-1">{formErrors.showTime}</p>}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Showtime Slots ({formData.showTimes.length}) *
                </label>
                <button
                  type="button"
                  onClick={addShowtimeSlot}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Slot
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {formData.showTimes.map((timeVal, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 w-6">#{idx + 1}</span>
                    <input
                      type="datetime-local"
                      value={timeVal}
                      onChange={(e) => updateShowtimeSlot(idx, e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    {formData.showTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeShowtimeSlot(idx)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 transition-colors"
                        title="Remove slot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {formErrors.showTimes && <p className="text-xs text-rose-400 mt-1">{formErrors.showTimes}</p>}
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                You can schedule multiple theatrical slots for this movie in a single operation. Each slot will be conflict-checked automatically.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Base Seat Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${
                  formErrors.basePrice ? 'border-rose-500' : 'border-slate-300 dark:border-slate-800'
                } rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500`}
              />
              {formErrors.basePrice && <p className="text-xs text-rose-400 mt-1">{formErrors.basePrice}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Premium Seat Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={formData.premiumPrice}
                onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
                className={`w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border ${
                  formErrors.premiumPrice ? 'border-rose-500' : 'border-slate-300 dark:border-slate-800'
                } rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500`}
              />
              {formErrors.premiumPrice && <p className="text-xs text-rose-400 mt-1">{formErrors.premiumPrice}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isLoading 
                ? 'Saving...' 
                : selectedShow 
                ? 'Update Showtime' 
                : formData.showTimes.length > 1 
                ? `Schedule ${formData.showTimes.length} Showtimes` 
                : 'Schedule Showtime'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Show Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
            <div className="text-sm">
              <p className="font-semibold text-rose-900 dark:text-rose-200">Delete Showtime #{selectedShow?.id}?</p>
              <p className="mt-1 text-xs text-rose-700/80 dark:text-rose-300/80">
                This will permanently delete this show schedule and its seating matrix. Any existing customer bookings associated with this show may be affected.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete Show'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
