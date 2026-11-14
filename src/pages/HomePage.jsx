import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { movieApi } from '../api/movieApi';
import { useAuth } from '../context/AuthContext';
import { HeroBanner } from '../components/movies/HeroBanner';
import { MovieCard } from '../components/movies/MovieCard';
import { MovieFilters } from '../components/movies/MovieFilters';
import { TrailerModal } from '../components/movies/TrailerModal';
import { 
  Film, AlertCircle, RefreshCw, Sparkles, Shield, Ticket, 
  Tv, Volume2, Armchair, Clock, QrCode, ArrowRight, CheckCircle2 
} from 'lucide-react';

export const HomePage = () => {
  const { user, isAdmin, isAuthenticated, openLogin } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [sortBy, setSortBy] = useState('default');

  // Trailer Preview Modal State
  const [trailerMovie, setTrailerMovie] = useState(null);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await movieApi.getMovies();
      setMovies(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load movie catalog. Please check service connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Compute unique genres and languages dynamically from movies data
  const genres = useMemo(() => {
    const set = new Set();
    movies.forEach((m) => {
      if (m.genre) {
        m.genre.split(',').forEach((g) => set.add(g.trim()));
      }
    });
    return Array.from(set).sort();
  }, [movies]);

  const languages = useMemo(() => {
    const set = new Set();
    movies.forEach((m) => {
      if (m.language) set.add(m.language.trim());
    });
    return Array.from(set).sort();
  }, [movies]);

  // Filter & Sort Logic
  const filteredMovies = useMemo(() => {
    return movies
      .filter((m) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          m.title?.toLowerCase().includes(q) ||
          m.genre?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q);

        const matchesGenre =
          selectedGenre === 'ALL' ||
          (m.genre && m.genre.toLowerCase().includes(selectedGenre.toLowerCase()));

        const matchesLanguage =
          selectedLanguage === 'ALL' ||
          (m.language && m.language.toLowerCase() === selectedLanguage.toLowerCase());

        return matchesQuery && matchesGenre && matchesLanguage;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'duration-asc') {
          return (a.duration || 0) - (b.duration || 0);
        }
        if (sortBy === 'duration-desc') {
          return (b.duration || 0) - (a.duration || 0);
        }
        return 0;
      });
  }, [movies, searchQuery, selectedGenre, selectedLanguage, sortBy]);

  return (
    <div className="space-y-16 pb-20">
      {/* Role-Specific Fast Action Strip */}
      {isAdmin ? (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-rose-500/15 border border-amber-500/35 p-6 sm:p-8 shadow-lg shadow-amber-950/10 dark:shadow-amber-950/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                ADMINISTRATIVE OPERATIONS CONSOLE ACTIVE
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome, {user?.name || 'Administrator'}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Full administrative privileges enabled. Manage movies, schedule multi-screen showtimes, audit real-time guest reservations, and scan admission passes at cinema gates.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/admin/dashboard"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-amber-950 dark:text-amber-100 bg-amber-400 hover:bg-amber-300 dark:bg-amber-500 dark:hover:bg-amber-400 shadow-md shadow-amber-500/30 transition-all flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-950 dark:text-amber-100" />
                Open Admin Dashboard
              </Link>
              <Link
                to="/admin/dashboard?tab=shows"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5"
              >
                Schedule Shows
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      ) : isAuthenticated ? (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-indigo-500/10 border border-rose-300/40 dark:border-rose-500/20 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Premier Cinepass Member
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome back, {user?.name || 'Movie Lover'}!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ready for tonight's cinema experience? Explore new arrivals or jump straight to your bookings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#catalog"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 shadow-md shadow-rose-600/30 transition-all"
              >
                Browse Now Showing
              </a>
              <Link
                to="/my-bookings"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Ticket className="w-3.5 h-3.5 text-rose-500" />
                My Passes
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Dynamic Hero Banner */}
      <HeroBanner
        movies={movies}
        onWatchTrailer={(movie) => setTrailerMovie(movie)}
      />

      {/* Theatrical VIP Experience Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            THE CINEPASS STANDARD
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cinematic Luxury & Acoustic Excellence
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Step beyond standard moviegoing with cutting-edge technology and unparalleled comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1: IMAX Laser */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-orange-200/80 dark:border-amber-500/25 shadow-sm hover:shadow-md transition-all space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform">
              <Tv className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">IMAX® with Laser</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ultra-high definition dual-laser projection delivers photorealistic 4K sharpness, deep blacks, and breathtaking color spectrums.
            </p>
          </div>

          {/* Pillar 2: Dolby Atmos */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-orange-200/80 dark:border-amber-500/25 shadow-sm hover:shadow-md transition-all space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Dolby Atmos® 360°</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Precision multi-channel acoustic objects place sound anywhere around and above you for total auditory immersion in every scene.
            </p>
          </div>

          {/* Pillar 3: VIP Recliners */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-orange-200/80 dark:border-amber-500/25 shadow-sm hover:shadow-md transition-all space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/25 group-hover:scale-105 transition-transform">
              <Armchair className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">VIP Luxe Recliners</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Plush motorized heated leather recliners with personal swivel tables, generous legroom, and available in-seat gourmet dining.
            </p>
          </div>

          {/* Pillar 4: 5-Min Hold & Instant QR */}
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-orange-200/80 dark:border-amber-500/25 shadow-sm hover:shadow-md transition-all space-y-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">5-Min Guaranteed Hold</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Zero-collision seat reservation locks your chosen recliners for 5 minutes, backed by instant contactless digital QR gate passes.
            </p>
          </div>
        </div>
      </section>

      {/* Main Movies Catalog Section */}
      <section id="catalog" className="space-y-6 pt-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Film className="w-7 h-7 text-rose-500" />
              Now Showing in Theatres
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select a blockbuster, inspect interactive screen layouts, and secure your seats.
            </p>
          </div>

          <button
            onClick={fetchMovies}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-slate-300 dark:hover:text-white dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Catalog
          </button>
        </div>

        {/* Search, Filter & Sort Controls */}
        <MovieFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          sortBy={sortBy}
          setSortBy={setSortBy}
          genres={genres}
          languages={languages}
          totalResults={filteredMovies.length}
        />

        {/* Movie Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-[2/3] rounded-2xl bg-slate-200 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-10 rounded-3xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Catalog Temporarily Unavailable</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchMovies}
              className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-lg shadow-rose-600/30"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Film className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Matching Movies Found</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              We couldn't find any movies matching "{searchQuery || selectedGenre}". Try adjusting your filters.
            </p>
            {(searchQuery || selectedGenre !== 'ALL' || selectedLanguage !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('ALL');
                  setSelectedLanguage('ALL');
                }}
                className="mt-2 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 bg-rose-500/10 rounded-xl transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onWatchTrailer={(m) => setTrailerMovie(m)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Cinepass Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 text-white p-8 sm:p-12 border border-amber-500/30 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            THE PREMIER CINEMA PROMISE
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Seamless Bookings. Zero Wait Times. Unforgettable Screenings.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            From the moment you reserve your seats online to the final credits roll, Cinepass is crafted to deliver the ultimate entertainment experience.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">5-Minute Seat Guarantee</h4>
                <p className="text-xs text-slate-400">Lock your favorite seats with zero risk of double booking during checkout.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Contactless Gate QR Scanner</h4>
                <p className="text-xs text-slate-400">Scan straight from your smartphone or print your ticket for effortless entry.</p>
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={openLogin}
                className="px-6 py-3 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/20 transition-all active:scale-95"
              >
                Sign In to Book Faster
              </button>
              <a
                href="#catalog"
                className="px-5 py-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
              >
                Browse Now Showing
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Trailer Modal */}
      <TrailerModal
        movie={trailerMovie}
        isOpen={!!trailerMovie}
        onClose={() => setTrailerMovie(null)}
      />
    </div>
  );
};
