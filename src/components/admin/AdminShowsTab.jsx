import React, { useState } from 'react';
import { 
  Plus, Edit3, Trash2, Calendar, Clock, Tv, Sparkles, AlertTriangle 
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminShowsTab = ({ 
  shows, 
  movies, 
  screens, 
  moviesMap, 
  screensMap, 
  onSaveShow, 
  onDeleteShow, 
  isLoading 
}) => {
  const [filterMovieId, setFilterMovieId] = useState('');
  const [filterScreenId, setFilterScreenId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [formData, setFormData] = useState({
    movieId: '',
    screenId: '',
    showTime: '',
    basePrice: 200,
    premiumPrice: 350
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredShows = shows.filter((show) => {
    if (filterMovieId && String(show.movieId) !== String(filterMovieId)) return false;
    if (filterScreenId && String(show.screenId) !== String(filterScreenId)) return false;
    return true;
  });

  const openCreateModal = () => {
    setSelectedShow(null);
    setFormData({
      movieId: movies[0]?.id || '',
      screenId: screens[0]?.id || '',
      showTime: '',
      basePrice: 200,
      premiumPrice: 350
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (show) => {
    setSelectedShow(show);
    // Format LocalDateTime string for datetime-local input (YYYY-MM-DDTHH:mm)
    let formattedDate = '';
    if (show.showTime) {
      formattedDate = show.showTime.substring(0, 16);
    }

    setFormData({
      movieId: show.movieId,
      screenId: show.screenId,
      showTime: formattedDate,
      basePrice: show.basePrice,
      premiumPrice: show.premiumPrice
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openDeleteModal = (show) => {
    setSelectedShow(show);
    setDeleteConfirmOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.movieId) errors.movieId = 'Please select a movie';
    if (!formData.screenId) errors.screenId = 'Please select a cinema screen';
    if (!formData.showTime) errors.showTime = 'Show date and time is required';
    if (!formData.basePrice || Number(formData.basePrice) <= 0) {
      errors.basePrice = 'Valid base ticket price required';
    }
    if (!formData.premiumPrice || Number(formData.premiumPrice) <= 0) {
      errors.premiumPrice = 'Valid premium ticket price required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Format showTime to ISO format expected by Spring Boot (e.g. 2026-11-08T18:30:00)
    let formattedShowTime = formData.showTime;
    if (formattedShowTime.length === 16) {
      formattedShowTime += ':00';
    }

    const payload = {
      movieId: parseInt(formData.movieId, 10),
      screenId: parseInt(formData.screenId, 10),
      showTime: formattedShowTime,
      basePrice: parseFloat(formData.basePrice),
      premiumPrice: parseFloat(formData.premiumPrice)
    };

    const success = await onSaveShow(payload, selectedShow?.id);
    if (success) {
      setModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedShow) return;
    const success = await onDeleteShow(selectedShow.id);
    if (success) {
      setDeleteConfirmOpen(false);
      setSelectedShow(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Movie Filter */}
          <select
            value={filterMovieId}
            onChange={(e) => setFilterMovieId(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Movies ({movies.length})</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          {/* Screen Filter */}
          <select
            value={filterScreenId}
            onChange={(e) => setFilterScreenId(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Screens ({screens.length})</option>
            {screens.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.theatreName})
              </option>
            ))}
          </select>

          {(filterMovieId || filterScreenId) && (
            <button
              onClick={() => {
                setFilterMovieId('');
                setFilterScreenId('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" /> Schedule Show
        </button>
      </div>

      {/* Shows Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Show ID</th>
                <th className="py-3.5 px-4">Movie</th>
                <th className="py-3.5 px-4">Screen & Theatre</th>
                <th className="py-3.5 px-4">Showtime</th>
                <th className="py-3.5 px-4">Pricing</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredShows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">
                    No scheduled shows match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredShows.map((show) => {
                  const movie = moviesMap[show.movieId];
                  const screen = screensMap[show.screenId];
                  const showDate = show.showTime ? new Date(show.showTime) : null;

                  return (
                    <tr key={show.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-emerald-400">
                        #{show.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
                            alt={movie?.title || 'Movie'}
                            className="w-9 h-12 object-cover rounded-md border border-slate-800 shadow"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
                            }}
                          />
                          <div>
                            <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {movie?.title || `Movie #${show.movieId}`}
                            </p>
                            <p className="text-xs text-slate-400">
                              {movie?.genre} • {movie?.duration}m
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-200">
                          {screen?.name || `Screen #${show.screenId}`}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Tv className="w-3 h-3 text-slate-500" />
                          {screen?.theatreName || 'Main Complex'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            {showDate ? showDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {showDate ? showDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono">
                            Base: ₹{show.basePrice}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3" /> ₹{show.premiumPrice}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(show)}
                            title="Edit Show"
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(show)}
                            title="Delete Show"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule / Edit Show Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedShow ? 'Edit Scheduled Showtime' : 'Schedule New Showtime'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Movie *
            </label>
            <select
              value={formData.movieId}
              onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
              className={`w-full px-3.5 py-2 bg-slate-900 border ${
                formErrors.movieId ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500`}
            >
              <option value="">Select a movie from catalog...</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.language} - {m.duration}m)
                </option>
              ))}
            </select>
            {formErrors.movieId && <p className="text-xs text-rose-400 mt-1">{formErrors.movieId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Cinema Screen & Hall *
            </label>
            <select
              value={formData.screenId}
              onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
              className={`w-full px-3.5 py-2 bg-slate-900 border ${
                formErrors.screenId ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500`}
            >
              <option value="">Select an available screen...</option>
              {screens.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.theatreName} ({(s.rows || 0) * (s.seatsPerRow || 0)} seats)
                </option>
              ))}
            </select>
            {formErrors.screenId && <p className="text-xs text-rose-400 mt-1">{formErrors.screenId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Show Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.showTime}
              onChange={(e) => setFormData({ ...formData, showTime: e.target.value })}
              className={`w-full px-3.5 py-2 bg-slate-900 border ${
                formErrors.showTime ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500`}
            />
            {formErrors.showTime && <p className="text-xs text-rose-400 mt-1">{formErrors.showTime}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Base Seat Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                className={`w-full px-3.5 py-2 bg-slate-900 border ${
                  formErrors.basePrice ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500`}
              />
              {formErrors.basePrice && <p className="text-xs text-rose-400 mt-1">{formErrors.basePrice}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Premium Seat Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={formData.premiumPrice}
                onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
                className={`w-full px-3.5 py-2 bg-slate-900 border ${
                  formErrors.premiumPrice ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500`}
              />
              {formErrors.premiumPrice && <p className="text-xs text-rose-400 mt-1">{formErrors.premiumPrice}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : selectedShow ? 'Update Showtime' : 'Schedule Showtime'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Show Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="text-sm">
              <p className="font-semibold text-rose-200">Cancel & Delete Showtime #{selectedShow?.id}?</p>
              <p className="mt-1 text-xs text-rose-300/80">
                This will permanently delete this show schedule and its seating matrix. Any existing customer bookings associated with this show may be affected.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete Show'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
