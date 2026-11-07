import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Clapperboard, Ticket, LogOut, Menu, X, Shield, User, Sun, Moon, Search } from 'lucide-react';
import { MovieSearchModal } from '../movies/MovieSearchModal';
import { TrailerModal } from '../movies/TrailerModal';

export const Navbar = () => {
  const { user, isAdmin, isAuthenticated, logout, openLogin, openRegister } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [trailerMovie, setTrailerMovie] = useState(null);

  const isActive = (path) => location.pathname === path;

  // Keyboard shortcut Ctrl+K / Cmd+K to launch search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
                <Clapperboard className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 dark:from-rose-400 dark:via-rose-200 dark:to-amber-200 bg-clip-text text-transparent">
                  CINEPASS
                </span>
                <span className="text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 font-semibold -mt-1">
                  Microservices Cinema
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                Movies
              </Link>
              <Link
                to="/my-bookings"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/my-bookings')
                    ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                <Ticket className="w-4 h-4" />
                My Bookings
              </Link>

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/dashboard')
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30'
                      : 'text-amber-600/90 dark:text-amber-400/90 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-500/10'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  Admin Console
                </Link>
              )}
            </div>
          </div>

          {/* Right Action: Search, Theme Switcher & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800 text-xs transition-colors"
              title="Quick Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden lg:inline">Search movies...</span>
              <kbd className="hidden lg:inline text-[10px] font-mono font-semibold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400">
                Ctrl K
              </kbd>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all duration-200 active:scale-95"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase shadow ${
                      isAdmin
                        ? 'bg-gradient-to-br from-amber-500 to-rose-600'
                        : 'bg-gradient-to-br from-rose-500 to-indigo-600'
                    }`}
                  >
                    {user?.name ? user.name.slice(0, 2) : 'US'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 max-w-[120px] truncate leading-tight">
                      {user?.name || user?.email}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {isAdmin ? 'ADMIN' : 'USER'}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          Administrator
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-600 dark:text-amber-300 hover:text-amber-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                      My Tickets & History
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      Account Profile
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800/80 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={openLogin}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={openRegister}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/25 active:scale-95 transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Search + Theme Toggle + Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search movies"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <Search className="w-5 h-5 text-rose-500" />
            </button>
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:bg-slate-900 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
              isActive('/') ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            Movies
          </Link>
          <Link
            to="/my-bookings"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
              isActive('/my-bookings') ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            My Bookings
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
              isActive('/profile') ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            My Profile
          </Link>

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30"
            >
              Admin Console
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-3 py-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Signed in as ({isAdmin ? 'ADMIN' : 'USER'})
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    {user?.name || user?.email}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLogin();
                  }}
                  className="py-2.5 px-4 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openRegister();
                  }}
                  className="py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-rose-600 text-center shadow-lg shadow-rose-600/30"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Movie Quick-Search Modal */}
      <MovieSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectTrailer={(movie) => setTrailerMovie(movie)}
      />

      {/* Trailer Modal (triggered from search or navbar) */}
      <TrailerModal
        movie={trailerMovie}
        isOpen={!!trailerMovie}
        onClose={() => setTrailerMovie(null)}
      />
    </nav>
  );
};
