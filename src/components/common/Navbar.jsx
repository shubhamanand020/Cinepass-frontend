import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Clapperboard, Ticket, LogOut, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, openLogin, openRegister } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
                <Clapperboard className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-rose-400 via-rose-200 to-amber-200 bg-clip-text text-transparent">
                  CINEPASS
                </span>
                <span className="text-[10px] tracking-widest uppercase text-slate-500 font-semibold -mt-1">
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
                    ? 'text-rose-400 bg-rose-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Movies
              </Link>
              <Link
                to="/my-bookings"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/my-bookings')
                    ? 'text-rose-400 bg-rose-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Ticket className="w-4 h-4" />
                My Bookings
              </Link>
            </div>
          </div>

          {/* Right Action: Auth & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow">
                    {user?.name ? user.name.slice(0, 2) : 'US'}
                  </div>
                  <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">
                    {user?.name || user?.email}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800/80">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-100 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-rose-400" />
                      My Tickets & History
                    </Link>

                    <div className="border-t border-slate-800/80 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
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
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
              isActive('/') ? 'text-rose-400 bg-rose-500/10' : 'text-slate-300'
            }`}
          >
            Movies
          </Link>
          <Link
            to="/my-bookings"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
              isActive('/my-bookings') ? 'text-rose-400 bg-rose-500/10' : 'text-slate-300'
            }`}
          >
            My Bookings
          </Link>

          <div className="pt-3 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-3 py-1">
                  <div className="text-xs text-slate-500">Signed in as</div>
                  <div className="text-sm font-semibold text-slate-200">{user?.name || user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-rose-400 bg-rose-500/10"
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
                  className="py-2.5 px-4 rounded-xl text-sm font-medium text-slate-300 bg-slate-900 text-center"
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
    </nav>
  );
};
