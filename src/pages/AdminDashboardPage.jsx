import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Shield, LayoutDashboard, Film, Tv, Calendar, Ticket, RefreshCw, AlertCircle 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { movieApi } from '../api/movieApi';
import { showApi } from '../api/showApi';
import { bookingApi } from '../api/bookingApi';
import { authApi } from '../api/authApi';

import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminMoviesTab } from '../components/admin/AdminMoviesTab';
import { AdminScreensTab } from '../components/admin/AdminScreensTab';
import { AdminShowsTab } from '../components/admin/AdminShowsTab';
import { AdminBookingsTab } from '../components/admin/AdminBookingsTab';

export const AdminDashboardPage = () => {
  const toast = useToast();
  const showToast = useCallback((msg, type = 'info') => {
    if (toast?.showToast) {
      toast.showToast(msg, type);
    } else if (type === 'success' && toast?.success) {
      toast.success(msg);
    } else if (type === 'error' && toast?.error) {
      toast.error(msg);
    } else if (type === 'warning' && toast?.warning) {
      toast.warning(msg);
    } else if (toast?.info) {
      toast.info(msg);
    }
  }, [toast]);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(() => {
    return ['overview', 'movies', 'screens', 'shows', 'bookings'].includes(tabParam)
      ? tabParam
      : 'overview';
  });

  useEffect(() => {
    if (tabParam && ['overview', 'movies', 'screens', 'shows', 'bookings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  }, [setSearchParams]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Core Data Collections
  const [movies, setMovies] = useState([]);
  const [screens, setScreens] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch all microservices data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [moviesRes, screensRes, showsRes, bookingsRes, usersRes] = await Promise.allSettled([
        movieApi.getMovies(),
        showApi.getScreens(),
        showApi.getShows(),
        bookingApi.getAllBookingsAdmin(),
        authApi.getAllUsers()
      ]);

      if (moviesRes.status === 'fulfilled') setMovies(moviesRes.value || []);
      if (screensRes.status === 'fulfilled') setScreens(screensRes.value || []);
      if (showsRes.status === 'fulfilled') setShows(showsRes.value || []);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value || []);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value || []);

      // If all failed, set an error
      if (
        moviesRes.status === 'rejected' &&
        screensRes.status === 'rejected' &&
        showsRes.status === 'rejected' &&
        bookingsRes.status === 'rejected'
      ) {
        setError('Failed to load administrative operations data.');
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('An unexpected error occurred while loading operations data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Lookup maps for fast relational resolution
  const moviesMap = useMemo(() => {
    const map = {};
    movies.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [movies]);

  const screensMap = useMemo(() => {
    const map = {};
    screens.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [screens]);

  const showsMap = useMemo(() => {
    const map = {};
    shows.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [shows]);

  const usersMap = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  // Computed KPI statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalMovies = movies.length;
    const totalScreens = screens.length;
    const uniqueTheatres = new Set(screens.map((s) => s.theatreName).filter(Boolean)).size;
    const totalShows = shows.length;
    const totalBookings = bookings.length;

    const confirmedList = bookings.filter((b) => b.status === 'CONFIRMED');
    const confirmedBookings = confirmedList.length;
    const totalRevenue = confirmedList.reduce(
      (sum, b) => sum + parseFloat(b.totalAmount || 0),
      0
    );

    return {
      totalUsers,
      totalMovies,
      totalScreens,
      totalTheatres: uniqueTheatres,
      totalShows,
      totalBookings,
      confirmedBookings,
      totalRevenue: totalRevenue.toFixed(2)
    };
  }, [users, movies, screens, shows, bookings]);

  // Handlers for Movie CRUD
  const handleSaveMovie = async (movieData, id = null) => {
    try {
      setActionLoading(true);
      if (id) {
        await movieApi.updateMovie(id, movieData);
        showToast('Movie updated successfully!', 'success');
      } else {
        await movieApi.createMovie(movieData);
        showToast('New movie added to catalog!', 'success');
      }
      const updatedMovies = await movieApi.getMovies();
      setMovies(Array.isArray(updatedMovies) ? updatedMovies : []);
      return true;
    } catch (err) {
      console.error('Error saving movie:', err);
      showToast(err.response?.data?.message || 'Failed to save movie record', 'error');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMovie = async (id) => {
    try {
      setActionLoading(true);
      await movieApi.deleteMovie(id);
      showToast('Movie deleted from catalog', 'success');
      const updatedMovies = await movieApi.getMovies();
      setMovies(Array.isArray(updatedMovies) ? updatedMovies : []);
      return true;
    } catch (err) {
      console.error('Error deleting movie:', err);
      showToast(err.response?.data?.message || 'Failed to delete movie', 'error');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for Screen CRUD
  const handleSaveScreen = async (screenData, id = null) => {
    try {
      setActionLoading(true);
      if (id) {
        await showApi.updateScreen(id, screenData);
        showToast('Screen layout updated successfully!', 'success');
      } else {
        await showApi.createScreen(screenData);
        showToast('New screen layout created!', 'success');
      }
      const updatedScreens = await showApi.getScreens();
      setScreens(Array.isArray(updatedScreens) ? updatedScreens : []);
      return true;
    } catch (err) {
      console.error('Error saving screen:', err);
      showToast(err.response?.data?.message || 'Failed to save screen layout', 'error');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteScreen = async (id) => {
    try {
      setActionLoading(true);
      await showApi.deleteScreen(id);
      showToast('Cinema screen deleted', 'success');
      const updatedScreens = await showApi.getScreens();
      setScreens(Array.isArray(updatedScreens) ? updatedScreens : []);
      return true;
    } catch (err) {
      console.error('Error deleting screen:', err);
      showToast(err.response?.data?.message || 'Failed to delete screen', 'error');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for Show Scheduling CRUD
  const handleSaveShow = async (showData, id = null) => {
    try {
      setActionLoading(true);
      if (id) {
        await showApi.updateShow(id, showData);
        showToast('Showtime updated successfully!', 'success');
      } else {
        await showApi.createShow(showData);
        showToast('New showtime scheduled!', 'success');
      }
      const updatedShows = await showApi.getShows();
      setShows(Array.isArray(updatedShows) ? updatedShows : []);
      return true;
    } catch (err) {
      console.error('Error saving show:', err);
      showToast(err.response?.data?.message || 'Failed to schedule show', 'error');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteShow = async (id) => {
    try {
      setActionLoading(true);
      await showApi.deleteShow(id);
      showToast('Showtime deleted', 'success');
      const updatedShows = await showApi.getShows();
      setShows(Array.isArray(updatedShows) ? updatedShows : []);
      return true;
    } catch (err) {
      console.error('Error deleting show:', err);
      showToast(err.response?.data?.message || 'Failed to delete show', 'error');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Handler for Admin Booking Cancellation
  const handleAdminCancelBooking = async (id) => {
    try {
      setActionLoading(true);
      await bookingApi.adminCancelBooking(id);
      showToast(`Booking #${id} has been cancelled by Admin`, 'success');
      const updatedBookings = await bookingApi.getAllBookingsAdmin();
      setBookings(Array.isArray(updatedBookings) ? updatedBookings : []);
      return true;
    } catch (err) {
      console.error('Error cancelling booking:', err);
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const navItems = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, count: null },
    { id: 'movies', label: 'Movies', icon: Film, count: movies.length },
    { id: 'screens', label: 'Screens & Layouts', icon: Tv, count: screens.length },
    { id: 'shows', label: 'Show Scheduler', icon: Calendar, count: shows.length },
    { id: 'bookings', label: 'Bookings Audit', icon: Ticket, count: bookings.length }
  ], [movies.length, screens.length, shows.length, bookings.length]);

  return (
    <div className="pb-16 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/40 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Admin Operations Console
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                ROLE_ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Centralized management for movie catalog, cinema screens, scheduling, and customer transactions.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAllData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white dark:border-transparent text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Operations Data
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.count !== null && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
        </div>
      ) : (
        /* Tab Views */
        <div>
          {activeTab === 'overview' && (
            <AdminOverviewTab
              stats={stats}
              recentBookings={bookings}
              moviesMap={moviesMap}
              showsMap={showsMap}
              onNavigateTab={(tab) => handleTabChange(tab)}
            />
          )}

          {activeTab === 'movies' && (
            <AdminMoviesTab
              movies={movies}
              onSaveMovie={handleSaveMovie}
              onDeleteMovie={handleDeleteMovie}
              isLoading={actionLoading}
            />
          )}

          {activeTab === 'screens' && (
            <AdminScreensTab
              screens={screens}
              onSaveScreen={handleSaveScreen}
              onDeleteScreen={handleDeleteScreen}
              isLoading={actionLoading}
            />
          )}

          {activeTab === 'shows' && (
            <AdminShowsTab
              shows={shows}
              movies={movies}
              screens={screens}
              moviesMap={moviesMap}
              screensMap={screensMap}
              onSaveShow={handleSaveShow}
              onDeleteShow={handleDeleteShow}
              isLoading={actionLoading}
            />
          )}

          {activeTab === 'bookings' && (
            <AdminBookingsTab
              bookings={bookings}
              moviesMap={moviesMap}
              showsMap={showsMap}
              screensMap={screensMap}
              usersMap={usersMap}
              onAdminCancelBooking={handleAdminCancelBooking}
              onRefresh={fetchAllData}
              isLoading={actionLoading}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;

