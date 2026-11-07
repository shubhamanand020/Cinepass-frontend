import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Ticket, Star, Play } from 'lucide-react';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600';

export const MovieCard = ({ movie, onWatchTrailer }) => {
  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 hover:border-rose-500/50 hover:bg-slate-50/80 dark:hover:bg-slate-900 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-600/15 hover:-translate-y-1.5 flex-1 shadow-sm">
      {/* Poster Image Container */}
      <div className="aspect-[2/3] w-full bg-slate-950 relative overflow-hidden">
        <img
          src={movie.posterUrl || FALLBACK_POSTER}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = FALLBACK_POSTER;
          }}
        />

        {/* Gradient Overlay for hover effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Genre Pill Tag */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-rose-300 border border-rose-500/30 shadow-lg">
          {movie.genre || 'Cinema'}
        </div>

        {/* Quality / Screen Tag */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500/20 backdrop-blur-md text-[10px] font-extrabold text-amber-300 border border-amber-500/40 flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-amber-300" />
          4K LASER
        </div>

        {/* Hover Quick Action */}
        <div className="absolute inset-0 flex items-end gap-2 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-950/50 backdrop-blur-[2px]">
          {onWatchTrailer && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWatchTrailer(movie);
              }}
              title="Watch Official Trailer"
              className="p-2.5 rounded-xl text-white bg-slate-900/90 hover:bg-rose-600 border border-slate-700/80 transition-all shadow-lg active:scale-95"
              aria-label={`Watch ${movie.title} trailer`}
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          )}
          <Link
            to={`/movie/${movie.id}`}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/40 active:scale-95 transition-all"
          >
            <Ticket className="w-4 h-4" />
            Book Tickets
          </Link>
        </div>
      </div>

      {/* Movie Details Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
            {movie.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {movie.description || 'Experience this thrilling movie exclusively in theaters.'}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{movie.duration ? `${movie.duration}m` : '120m'}</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{movie.language || 'English'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

