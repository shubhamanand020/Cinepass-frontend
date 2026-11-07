import React, { useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Film, ExternalLink, AlertCircle } from 'lucide-react';

/**
 * Extracts YouTube Video ID from standard, short, or embed URLs.
 * Examples supported:
 *  - https://www.youtube.com/watch?v=zSWdZVtXT7E
 *  - https://youtu.be/zSWdZVtXT7E
 *  - https://www.youtube.com/embed/zSWdZVtXT7E
 *  - zSWdZVtXT7E (raw 11-char ID)
 */
const extractYouTubeId = (url) => {
  if (!url) return null;
  const trimmed = url.trim();

  // If already an 11-char ID without slashes
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    // Check youtu.be shortlinks
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch && shortMatch[1]) return shortMatch[1];

    // Check youtube.com/watch?v=... or /embed/... or /v/...
    const standardMatch = trimmed.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([a-zA-Z0-9_-]{11})/
    );
    if (standardMatch && standardMatch[1]) return standardMatch[1];
  } catch {
    return null;
  }

  return null;
};

export const TrailerModal = ({ movie, isOpen, onClose }) => {
  const youtubeId = useMemo(() => {
    return extractYouTubeId(movie?.trailerUrl);
  }, [movie?.trailerUrl]);

  if (!movie) return null;

  const embedUrl = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${movie.title} — Official Trailer`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Video Player or Fallback Container */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 relative shadow-2xl flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <>
              {/* Fallback view when no valid YouTube URL is present */}
              <img
                src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200'}
                alt={movie.title}
                className="w-full h-full object-cover opacity-25 blur-xs"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

              <div className="absolute z-10 text-center p-6 space-y-3 max-w-md">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-600/30">
                  <Film className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-500/30 mb-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Trailer Coming Soon
                  </div>
                  <h4 className="text-xl font-extrabold text-white">{movie.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Official theatrical preview will be available soon. Check back before release!
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Meta Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {movie.genre || 'Cinema'}
            </span>
            <span>•</span>
            <span>{movie.duration ? `${movie.duration} mins` : '120 mins'}</span>
            <span>•</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">Dolby Atmos 4K</span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {movie.trailerUrl && (
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:hover:text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TrailerModal;

