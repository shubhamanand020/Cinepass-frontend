import React, { useState, useEffect, useMemo } from 'react';
import { movieApi } from '../api/movieApi';
import { HeroBanner } from '../components/movies/HeroBanner';
import { MovieCard } from '../components/movies/MovieCard';
import { MovieFilters } from '../components/movies/MovieFilters';
import { TrailerModal } from '../components/movies/TrailerModal';
import { Film, AlertCircle, RefreshCw } from 'lucide-react';

export const HomePage = () => {
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
      setError(err.message || 'Failed to connect to Movie Service via Gateway.');
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
        // Search Query Match (Title, Genre, Description)
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          m.title?.toLowerCase().includes(q) ||
          m.genre?.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q);

        // Genre Match
        const matchesGenre =
          selectedGenre === 'ALL' ||
          (m.genre && m.genre.toLowerCase().includes(selectedGenre.toLowerCase()));

        // Language Match
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
        return 0; // Default order
      });
  }, [movies, searchQuery, selectedGenre, selectedLanguage, sortBy]);

  return (
    <div className="space-y-12 pb-16">
      {/* Dynamic Hero Banner */}
      <HeroBanner
        movies={movies}
        onWatchTrailer={(movie) => setTrailerMovie(movie)}
      />

      {/* Main Movies Catalog Section */}
      <section id="catalog" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Film className="w-7 h-7 text-rose-500" />
              Now Showing in Theatres
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Explore showtimes, screen layouts, and reserve seats in real time.
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
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Catalog Connection Idle</h3>
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

      {/* Trailer Modal */}
      <TrailerModal
        movie={trailerMovie}
        isOpen={!!trailerMovie}
        onClose={() => setTrailerMovie(null)}
      />
    </div>
  );
};
