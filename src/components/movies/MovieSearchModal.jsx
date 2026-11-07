import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Film, Ticket, Play } from 'lucide-react';
import { movieApi } from '../../api/movieApi';

export const MovieSearchModal = ({ isOpen, onClose, onSelectTrailer }) => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setLoading(true);
      movieApi.getMovies()
        .then((data) => setMovies(data || []))
        .catch(() => setMovies([]))
        .finally(() => setLoading(false));

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? movies.filter((m) =>
        m.title?.toLowerCase().includes(query.toLowerCase()) ||
        m.genre?.toLowerCase().includes(query.toLowerCase()) ||
        m.language?.toLowerCase().includes(query.toLowerCase()) ||
        m.description?.toLowerCase().includes(query.toLowerCase())
      )
    : movies.slice(0, 4); // show top 4 featured when query is empty

  const handleSelectMovie = (movieId) => {
    onClose();
    navigate(`/movie/${movieId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <Search className="w-5 h-5 text-rose-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, genre (Sci-Fi, Action), language..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200/60 dark:bg-slate-800 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>{query ? `Search Results (${filtered.length})` : 'Featured Movies'}</span>
            <span>Jump to Movie or Preview Trailer</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
              Searching cinema catalog...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Film className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No movies found matching "{query}"
              </p>
              <p className="text-xs text-slate-400">
                Try searching for a different title, genre, or keyword.
              </p>
            </div>
          ) : (
            filtered.map((movie) => (
              <div
                key={movie.id}
                onClick={() => handleSelectMovie(movie.id)}
                className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=200'}
                    alt={movie.title}
                    className="w-12 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {movie.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-[10px]">
                        {movie.genre || 'Cinema'}
                      </span>
                      <span>•</span>
                      <span>{movie.language || 'English'}</span>
                      <span>•</span>
                      <span>{movie.duration ? `${movie.duration}m` : '120m'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {movie.trailerUrl && onSelectTrailer && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onSelectTrailer(movie);
                      }}
                      title="Play Trailer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Trailer</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectMovie(movie.id);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Book</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieSearchModal;
