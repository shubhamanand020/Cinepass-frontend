import React, { useState } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Grid3X3, Sparkles, Building, AlertTriangle 
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminScreensTab = ({ 
  screens, 
  onSaveScreen, 
  onDeleteScreen, 
  isLoading 
}) => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [previewScreen, setPreviewScreen] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    theatreName: '',
    rows: 8,
    seatsPerRow: 10,
    premiumRows: 2
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredScreens = screens.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.theatreName?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setSelectedScreen(null);
    setFormData({
      name: '',
      theatreName: '',
      rows: 8,
      seatsPerRow: 10,
      premiumRows: 2
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (screen) => {
    setSelectedScreen(screen);
    setFormData({
      name: screen.name || '',
      theatreName: screen.theatreName || '',
      rows: screen.rows || 8,
      seatsPerRow: screen.seatsPerRow || 10,
      premiumRows: screen.premiumRows || 0
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openDeleteModal = (screen) => {
    setSelectedScreen(screen);
    setDeleteConfirmOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Screen name is required';
    if (!formData.theatreName?.trim()) errors.theatreName = 'Theatre name is required';
    if (!formData.rows || Number(formData.rows) < 1) errors.rows = 'Minimum 1 row required';
    if (!formData.seatsPerRow || Number(formData.seatsPerRow) < 1) errors.seatsPerRow = 'Minimum 1 seat per row';
    if (Number(formData.premiumRows) < 0 || Number(formData.premiumRows) > Number(formData.rows)) {
      errors.premiumRows = 'Premium rows cannot exceed total rows';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      theatreName: formData.theatreName.trim(),
      rows: parseInt(formData.rows, 10),
      seatsPerRow: parseInt(formData.seatsPerRow, 10),
      premiumRows: parseInt(formData.premiumRows, 10)
    };

    const success = await onSaveScreen(payload, selectedScreen?.id);
    if (success) {
      setModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedScreen) return;
    const success = await onDeleteScreen(selectedScreen.id);
    if (success) {
      setDeleteConfirmOpen(false);
      setSelectedScreen(null);
      if (previewScreen?.id === selectedScreen.id) {
        setPreviewScreen(null);
      }
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
            placeholder="Search screens by name or theatre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Add Screen
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Screens List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredScreens.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
              No cinema screens registered yet. Click "Add Screen" to configure one.
            </div>
          ) : (
            filteredScreens.map((screen) => {
              const totalCapacity = (screen.rows || 0) * (screen.seatsPerRow || 0);
              const isSelected = previewScreen?.id === screen.id;

              return (
                <div
                  key={screen.id}
                  onClick={() => setPreviewScreen(screen)}
                  className={`p-5 rounded-2xl bg-slate-900/60 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500/80 bg-slate-900 shadow-lg shadow-amber-500/10'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">{screen.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          ID: #{screen.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <Building className="w-3.5 h-3.5 text-amber-400" />
                        {screen.theatreName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(screen);
                        }}
                        title="Edit Screen"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(screen);
                        }}
                        title="Delete Screen"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500">Dimensions</span>
                      <p className="font-semibold text-slate-200 mt-0.5">
                        {screen.rows} rows × {screen.seatsPerRow} cols
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Premium Rows</span>
                      <p className="font-semibold text-amber-400 mt-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {screen.premiumRows || 0} rows
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Total Capacity</span>
                      <p className="font-semibold text-slate-200 mt-0.5">
                        {totalCapacity} seats
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Live Seat Layout Visualizer */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 sticky top-24 self-start">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-amber-400" />
              Seat Grid Layout Preview
            </h4>
          </div>

          {previewScreen ? (
            <div className="space-y-4">
              <div className="text-xs">
                <span className="font-bold text-white">{previewScreen.name}</span>
                <p className="text-slate-400">{previewScreen.theatreName}</p>
              </div>

              {/* Curved Screen Indicator */}
              <div className="w-full flex flex-col items-center py-2">
                <div className="w-3/4 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full shadow-[0_0_12px_rgba(251,191,36,0.5)]"></div>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold mt-1">Screen</span>
              </div>

              {/* Mini Seat Matrix */}
              <div className="max-h-64 overflow-y-auto p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center gap-1.5">
                {Array.from({ length: Math.min(previewScreen.rows || 0, 12) }).map((_, rIdx) => {
                  const rowLetter = String.fromCharCode(65 + rIdx);
                  const isPremium = rIdx >= (previewScreen.rows - (previewScreen.premiumRows || 0));

                  return (
                    <div key={rowLetter} className="flex items-center gap-1">
                      <span className="w-3 text-[9px] font-mono text-slate-500 text-center font-bold">
                        {rowLetter}
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(previewScreen.seatsPerRow || 0, 14) }).map((_, cIdx) => (
                          <div
                            key={cIdx}
                            title={`${rowLetter}${cIdx + 1} (${isPremium ? 'Premium' : 'Standard'})`}
                            className={`w-3.5 h-3.5 rounded-sm transition-all ${
                              isPremium
                                ? 'bg-amber-500/80 hover:bg-amber-400'
                                : 'bg-slate-700 hover:bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-around pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-slate-700"></div>
                  <span>Standard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-500"></div>
                  <span className="text-amber-400 font-medium">Premium</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Select a screen from the list on the left to preview its dynamic physical seating topology.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Screen Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedScreen ? 'Edit Cinema Screen Layout' : 'Create Cinema Screen Layout'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Screen Name / Number *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Screen 1 - IMAX Laser"
              className={`w-full px-3.5 py-2 bg-slate-900 border ${
                formErrors.name ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500`}
            />
            {formErrors.name && <p className="text-xs text-rose-400 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Theatre / Cinema Hall Name *
            </label>
            <input
              type="text"
              value={formData.theatreName}
              onChange={(e) => setFormData({ ...formData, theatreName: e.target.value })}
              placeholder="e.g. Cinepass Grand Multiplex"
              className={`w-full px-3.5 py-2 bg-slate-900 border ${
                formErrors.theatreName ? 'border-rose-500' : 'border-slate-800'
              } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500`}
            />
            {formErrors.theatreName && <p className="text-xs text-rose-400 mt-1">{formErrors.theatreName}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Rows *
              </label>
              <input
                type="number"
                min="1"
                max="26"
                value={formData.rows}
                onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-900 border ${
                  formErrors.rows ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500`}
              />
              {formErrors.rows && <p className="text-xs text-rose-400 mt-1">{formErrors.rows}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Seats/Row *
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.seatsPerRow}
                onChange={(e) => setFormData({ ...formData, seatsPerRow: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-900 border ${
                  formErrors.seatsPerRow ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500`}
              />
              {formErrors.seatsPerRow && <p className="text-xs text-rose-400 mt-1">{formErrors.seatsPerRow}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Premium Rows *
              </label>
              <input
                type="number"
                min="0"
                value={formData.premiumRows}
                onChange={(e) => setFormData({ ...formData, premiumRows: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-900 border ${
                  formErrors.premiumRows ? 'border-rose-500' : 'border-slate-800'
                } rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500`}
              />
              {formErrors.premiumRows && <p className="text-xs text-rose-400 mt-1">{formErrors.premiumRows}</p>}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Calculated Capacity:</span>
            <span className="font-bold text-white text-sm">
              {(Number(formData.rows || 0) * Number(formData.seatsPerRow || 0))} seats
            </span>
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
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 text-sm font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : selectedScreen ? 'Update Screen' : 'Create Screen'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Screen Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="text-sm">
              <p className="font-semibold text-rose-200">Delete "{selectedScreen?.name}"?</p>
              <p className="mt-1 text-xs text-rose-300/80">
                Removing this screen will also prevent scheduling future shows on this screen.
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
              {isLoading ? 'Deleting...' : 'Delete Screen'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
