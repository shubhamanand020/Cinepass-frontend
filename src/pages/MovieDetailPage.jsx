import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieApi } from '../api/movieApi';
import { showApi } from '../api/showApi';
import { ShowtimeSelector } from '../components/movies/ShowtimeSelector';
import { TrailerModal } from '../components/movies/TrailerModal';
import {
  Clock,
  Calendar,
  ArrowLeft,
  Ticket,
  Play,
  Share2,
  Sparkles,
  AlertCircle,
  Film,
} from 'lucide-react';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600';

export const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [movieRes, showsRes, screensRes] = await Promise.allSettled([
          movieApi.getMovieById(id),
          showApi.getShows(id),
          showApi.getScreens(),
        ]);

        if (!isMounted) return;

        if (movieRes.status === 'fulfilled') {
          setMovie(movieRes.value);
        } else {
          throw new Error('Movie not found or failed to connect to Movie Service.');
        }

        if (showsRes.status === 'fulfilled') {
          setShows(showsRes.value || []);
        }

        if (screensRes.status === 'fulfilled') {
          setScreens(screensRes.value || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load movie details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading film details & showtimes...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Film Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {error || 'Unable to retrieve details for this movie.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Movies</span>
        </Link>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: movie.title, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:bg-slate-900 dark:border-slate-800 transition-colors"
          aria-label="Share movie"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Cinematic Overview Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800/90 shadow-2xl p-6 sm:p-10">
        {/* Backdrop Glow */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.posterUrl || FALLBACK_POSTER}
            alt={movie.title}
            className="w-full h-full object-cover object-top opacity-20 blur-md scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/80" />
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Movie Poster */}
          <div className="md:col-span-4 lg:col-span-3 aspect-[2/3] max-w-[280px] mx-auto md:mx-0 w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-slate-800 group relative">
            <img
              src={movie.posterUrl || FALLBACK_POSTER}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = FALLBACK_POSTER;
              }}
            />
            <button
              onClick={() => setIsTrailerOpen(true)}
              className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-colors flex flex-col items-center justify-center gap-2 group-hover:scale-100"
              aria-label="Watch Trailer"
            >
              <div className="w-12 h-12 rounded-full bg-rose-600/90 border border-rose-400/50 flex items-center justify-center text-white shadow-xl shadow-rose-600/50 group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">Watch Trailer</span>
            </button>
          </div>

          {/* Movie Metadata & Overview */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  {movie.genre || 'Action'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                  {movie.language || 'English'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                  2D • 3D • IMAX 4K
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span>{movie.duration ? `${movie.duration} minutes` : '120 minutes'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span>Release Date: {movie.releaseDate || 'In Theaters'}</span>
                </div>
              </div>

              {/* Synopsis */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  About the Movie
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                  {movie.description ||
                    'An enthralling cinematic journey brought to the big screen with high-fidelity visual effects, powerful storytelling, and state-of-the-art surround sound acoustics.'}
                </p>
              </div>

              {/* Cast & Crew Specs */}
              <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Audio Experience</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block">Dolby Atmos 7.1</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Projection Quality</span>
                  <span className="text-slate-200 font-semibold mt-0.5 block">RGB Laser 4K</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Seat Lock Engine</span>
                  <span className="text-rose-400 font-semibold mt-0.5 block">5-Minute Atomic Hold</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="#showtimes-section"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 transition-all shadow-lg shadow-rose-600/30"
              >
                <Ticket className="w-4 h-4" />
                Select Showtime & Book Seats
              </a>

              <button
                onClick={() => setIsTrailerOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:text-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 transition-colors"
              >
                <Play className="w-4 h-4 text-rose-500 fill-rose-500 dark:text-rose-400 dark:fill-rose-400" />
                Play Official Trailer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Showtimes & Screen Selection Section */}
      <section id="showtimes-section" className="space-y-6 pt-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live Theatrical Schedule
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Film className="w-7 h-7 text-rose-500" />
            Select Date & Showtime
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Pick a convenient showtime below to open the interactive seat map and reserve your seats.
          </p>
        </div>

        {/* Dynamic Showtime Selector with Date & Screen Grouping */}
        <ShowtimeSelector shows={shows} screens={screens} />
      </section>

      {/* Trailer Modal */}
      <TrailerModal
        movie={movie}
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
      />
    </div>
  );
};
