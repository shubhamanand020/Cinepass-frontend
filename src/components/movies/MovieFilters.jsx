import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export const MovieFilters = ({
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  selectedLanguage,
  setSelectedLanguage,
  sortBy,
  setSortBy,
  genres = [],
  languages = [],
  totalResults = 0,
}) => {
  return (
    <div className="space-y-4 bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md">
      {/* Top Row: Search and Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies by title, genre, or keywords..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 rounded-md"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls: Language and Sort */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-rose-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* Sort By Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none font-medium cursor-pointer"
            >
              <option value="default" className="bg-slate-950">Featured First</option>
              <option value="title" className="bg-slate-950">Title (A-Z)</option>
              <option value="duration-asc" className="bg-slate-950">Duration (Shortest)</option>
              <option value="duration-desc" className="bg-slate-950">Duration (Longest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Genre Chips and Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedGenre('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedGenre === 'ALL'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Genres
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedGenre === genre
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-rose-400 font-bold">{totalResults}</span> {totalResults === 1 ? 'film' : 'films'}
        </div>
      </div>
    </div>
  );
};

