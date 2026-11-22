import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Armchair, Ticket } from 'lucide-react';

export const ShowtimeSelector = ({ shows = [], screens = [] }) => {
  const [currentTime] = useState(() => Date.now());

  // Filter out all past showtimes: only future/present shows are visible to customers
  const upcomingShows = useMemo(() => {
    return shows.filter((show) => {
      if (!show.showTime) return false;
      const d = new Date(show.showTime);
      return !isNaN(d.getTime()) && d.getTime() >= currentTime;
    });
  }, [shows, currentTime]);

  // Build a lookup map of screens by id
  const screenMap = useMemo(() => {
    const map = new Map();
    screens.forEach((s) => map.set(s.id, s));
    return map;
  }, [screens]);

  // Extract unique show dates ONLY from upcoming shows
  const availableDates = useMemo(() => {
    const dateSet = new Set();
    upcomingShows.forEach((show) => {
      const d = new Date(show.showTime);
      dateSet.add(d.toISOString().split('T')[0]);
    });
    return Array.from(dateSet).sort();
  }, [upcomingShows]);

  // Selected date defaults to first upcoming available date
  const [selectedDate, setSelectedDate] = useState(() => {
    return availableDates[0] || '';
  });

  // Keep selectedDate synchronized if availableDates update
  useEffect(() => {
    if (availableDates.length > 0 && !availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // Filter upcoming shows for the active date
  const showsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return upcomingShows.filter((show) => {
      const d = new Date(show.showTime);
      return d.toISOString().split('T')[0] === selectedDate;
    });
  }, [upcomingShows, selectedDate]);

  // Group shows by screenId
  const groupedByScreen = useMemo(() => {
    const map = new Map();
    showsForDate.forEach((show) => {
      const screenId = show.screenId || 1;
      if (!map.has(screenId)) {
        map.set(screenId, []);
      }
      map.get(screenId).push(show);
    });

    // Sort shows within screen by showTime ascending
    map.forEach((list) => {
      list.sort((a, b) => new Date(a.showTime) - new Date(b.showTime));
    });

    return map;
  }, [showsForDate]);

  const todayStr = useMemo(() => new Date(currentTime).toISOString().split('T')[0], [currentTime]);
  const tomorrowStr = useMemo(() => new Date(currentTime + 86400000).toISOString().split('T')[0], [currentTime]);

  const formatDateLabel = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');

      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const day = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });

      if (dateStr === todayStr) return { label: 'Today', sub: `${day} ${month}` };
      if (dateStr === tomorrowStr) return { label: 'Tomorrow', sub: `${day} ${month}` };
      return { label: weekday, sub: `${day} ${month}` };
    } catch {
      return { label: dateStr, sub: '' };
    }
  };

  const formatTime = (timeStr) => {
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return '7:00 PM';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '7:00 PM';
    }
  };

  // If no present or future shows are scheduled, display clear empty state
  if (upcomingShows.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
          <Ticket className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Upcoming Showtimes Scheduled</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            All previous screenings for this movie have concluded. New showtimes will be posted here as soon as the cinema schedule is released.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {availableDates.map((dateStr) => {
          const { label, sub } = formatDateLabel(dateStr);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center min-w-[95px] px-4 py-2.5 rounded-2xl transition-all border ${
                isSelected
                  ? 'bg-gradient-to-b from-rose-600 to-rose-700 text-white border-rose-500 shadow-lg shadow-rose-600/30 scale-[1.02]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
              <span className="text-sm font-extrabold mt-0.5">{sub}</span>
            </button>
          );
        })}
      </div>

      {/* Screen Showtimes List */}
      <div className="space-y-4">
        {Array.from(groupedByScreen.entries()).map(([screenId, screenShows]) => {
          const screen = screenMap.get(screenId);
          const screenName = screen?.name || `Screen ${screenId}`;
          const theatreName = screen?.theatreName || 'Cinepass Premier Cinemas';
          const totalSeats = screen ? (screen.rows || 10) * (screen.seatsPerRow || 10) : 100;

          return (
            <div
              key={screenId}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 shadow-sm dark:shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/70">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="text-rose-600 dark:text-rose-400 font-extrabold">{screenName}</span>
                    <span className="text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">{theatreName}</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                    <Armchair className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{totalSeats} Total Seats (Standard & Premium Tiers)</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full self-start sm:self-auto">
                  <span>M-Ticket Available</span>
                </div>
              </div>

              {/* Show Time Slot Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {screenShows.map((show) => {
                  const basePrice = show.basePrice ? Number(show.basePrice).toFixed(0) : '250';
                  const premiumPrice = show.premiumPrice ? Number(show.premiumPrice).toFixed(0) : '350';

                  return (
                    <Link
                      key={show.id}
                      to={`/booking/${show.id}`}
                      className="group p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-rose-500/60 hover:bg-slate-100 dark:hover:bg-slate-900/90 transition-all duration-200 text-center flex flex-col justify-between hover:shadow-lg hover:shadow-rose-600/15"
                    >
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {formatTime(show.showTime)}
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        ₹{basePrice} - ₹{premiumPrice}
                      </div>

                      <div className="mt-2 text-[10px] font-semibold text-rose-600 dark:text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        Select Seats ➔
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {showsForDate.length === 0 && (
          <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-sm text-slate-600 dark:text-slate-400">No shows available for the selected date.</p>
          </div>
        )}
      </div>
    </div>
  );
};
