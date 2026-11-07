import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Clock, Ticket, ChevronLeft, ChevronRight, Play } from 'lucide-react';

export const HeroBanner = ({ movies = [], onWatchTrailer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Take up to 5 featured movies for the carousel
  const featured = movies.slice(0, 5);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [featured.length]);

  if (!featured.length) {
    return (
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-950 border border-slate-800/80 p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Cinepass Microservices Premier
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Reserve Your Cinema Experience In Real Time
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Experience distributed movie ticketing with atomic 5-minute seat locks, live showtimes, and instant confirmation.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="#catalog"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-lg shadow-rose-600/30"
            >
              Explore Movies
            </a>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>
    );
  }

  const currentMovie = featured[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? featured.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl min-h-[460px] flex items-center">
      {/* Background Poster Artwork with Cinematic Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={
            currentMovie.posterUrl ||
            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200'
          }
          alt={currentMovie.title}
          className="w-full h-full object-cover object-top opacity-30 blur-sm scale-105 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Featured Release
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium">
              {currentMovie.genre || 'Action'}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium">
              {currentMovie.language || 'English'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {currentMovie.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed">
            {currentMovie.description ||
              'Experience an extraordinary cinematic story on the big screen with Dolby Atmos and 4K laser projection.'}
          </p>

          <div className="flex items-center gap-6 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>{currentMovie.duration ? `${currentMovie.duration} mins` : '120 mins'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>{currentMovie.releaseDate || 'Now In Cinemas'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={`/movie/${currentMovie.id}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 transition-all shadow-lg shadow-rose-600/30"
            >
              <Ticket className="w-4 h-4" />
              Book Tickets Now
            </Link>
            {onWatchTrailer && (
              <button
                onClick={() => onWatchTrailer(currentMovie)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:text-white transition-all backdrop-blur-sm"
              >
                <Play className="w-4 h-4 text-rose-400 fill-rose-400" />
                Watch Trailer
              </button>
            )}
          </div>
        </div>

        {/* Featured Movie Floating Poster Preview */}
        <div className="hidden lg:block shrink-0 w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border-2 border-slate-800/80 group">
          <img
            src={
              currentMovie.posterUrl ||
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600'
            }
            alt={currentMovie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Navigation Controls */}
      {featured.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors backdrop-blur-md"
            aria-label="Previous movie"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 px-2">
            {featured.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-6 bg-rose-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors backdrop-blur-md"
            aria-label="Next movie"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};

