import React from 'react';
import { Modal } from '../common/Modal';
import { Film } from 'lucide-react';

export const TrailerModal = ({ movie, isOpen, onClose }) => {
  if (!movie) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${movie.title} — Official Trailer`} maxWidth="max-w-2xl">
      <div className="space-y-4">
        {/* Cinematic Video Player Container */}
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative shadow-2xl flex items-center justify-center">
          {/* Default trailer view with movie imagery */}
          <img
            src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200'}
            alt={movie.title}
            className="w-full h-full object-cover opacity-40 blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="absolute z-10 text-center p-6 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-600/90 border border-rose-400/50 flex items-center justify-center text-white shadow-xl shadow-rose-600/50">
              <Film className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">{movie.title}</h4>
              <p className="text-xs text-slate-300">
                Official Theatrical Trailer Preview • {movie.language || 'English'} ({movie.genre || 'Action'})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Dolby Atmos • 4K Digital Cinema</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </Modal>
  );
};

