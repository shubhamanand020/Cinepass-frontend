import React, { useState } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Clock, Globe, Calendar, AlertTriangle 
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminMoviesTab = ({ 
  movies, 
  onSaveMovie, 
  onDeleteMovie, 
  isLoading 
}) => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    language: '',
    duration: '',
    releaseDate: '',
    posterUrl: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredMovies = movies.filter((m) =>
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.genre?.toLowerCase().includes(search.toLowerCase()) ||
    m.language?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setSelectedMovie(null);
    setFormData({
      title: '',
      description: '',
      genre: '',
      language: '',
      duration: '',
      releaseDate: '',
      posterUrl: ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (movie) => {
    setSelectedMovie(movie);
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre || '',
      language: movie.language || '',
      duration: movie.duration || '',
      releaseDate: movie.releaseDate || '',
      posterUrl: movie.posterUrl || ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openDeleteModal = (movie) => {
    setSelectedMovie(movie);
    setDeleteConfirmOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.genre?.trim()) errors.genre = 'Genre is required';
    if (!formData.language?.trim()) errors.language = 'Language is required';
    if (!formData.duration || Number(formData.duration) <= 0) {
      errors.duration = 'Valid positive duration (minutes) required';
    }
    if (!formData.releaseDate) errors.releaseDate = 'Release date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      duration: parseInt(formData.duration, 10)
    };

    const success = await onSaveMovie(payload, selectedMovie?.id);
    if (success) {
      setModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedMovie) return;
    const success = await onDeleteMovie(selectedMovie.id);
    if (success) {
      setDeleteConfirmOpen(false);
      setSelectedMovie(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog by title, genre, language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-rose-600/20"
        >
          <Plus className="w-4 h-4" /> Add Movie
        </button>
      </div>

      {/* Movies Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Movie</th>
                <th className="py-3.5 px-4">Genre</th>
                <th className="py-3.5 px-4">Language</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Release Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMovies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">
                    No movies found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded-lg border border-slate-800 shadow"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
                          }}
                        />
                        <div>
                          <p className="font-bold text-white group-hover:text-rose-400 transition-colors">
                            {movie.title}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                            {movie.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {movie.genre}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 flex items-center gap-1.5 mt-3">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      {movie.language}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {movie.duration} mins
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {movie.releaseDate}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(movie)}
                          title="Edit Movie"
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(movie)}
                          title="Delete Movie"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Movie Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedMovie ? 'Edit Catalog Movie' : 'Add New Movie to Catalog'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Movie Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Inception"
              className={`w-full px-3.5 py-2 bg-slate-900 border ${
                formErrors.title ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500`}
            />
            {formErrors.title && <p className="text-xs text-rose-400 mt-1">{formErrors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Genre *
              </label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="e.g. Sci-Fi, Action"
                className={`w-full px-3.5 py-2 bg-slate-900 border ${
                  formErrors.genre ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500`}
              />
              {formErrors.genre && <p className="text-xs text-rose-400 mt-1">{formErrors.genre}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Language *
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                placeholder="e.g. English, Hindi"
                className={`w-full px-3.5 py-2 bg-slate-900 border ${
                  formErrors.language ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500`}
              />
              {formErrors.language && <p className="text-xs text-rose-400 mt-1">{formErrors.language}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 148"
                className={`w-full px-3.5 py-2 bg-slate-900 border ${
                  formErrors.duration ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500`}
              />
              {formErrors.duration && <p className="text-xs text-rose-400 mt-1">{formErrors.duration}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Release Date *
              </label>
              <input
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                className={`w-full px-3.5 py-2 bg-slate-900 border ${
                  formErrors.releaseDate ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500`}
              />
              {formErrors.releaseDate && <p className="text-xs text-rose-400 mt-1">{formErrors.releaseDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Poster Image URL
            </label>
            <input
              type="url"
              value={formData.posterUrl}
              onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
              placeholder="https://image-url.com/poster.jpg"
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Synopsis
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief narrative of the movie..."
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            />
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : selectedMovie ? 'Update Movie' : 'Create Movie'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Movie Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="text-sm">
              <p className="font-semibold text-rose-200">Delete "{selectedMovie?.title}"?</p>
              <p className="mt-1 text-xs text-rose-300/80">
                This action is permanent and will remove the movie from the catalog. Shows associated with this movie will remain unaffected or may be orphaned.
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
              {isLoading ? 'Deleting...' : 'Delete Movie'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
