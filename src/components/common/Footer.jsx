import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Clapperboard, Sparkles, ShieldCheck, Film, Shield, Ticket, LogIn, UserPlus, CheckCircle2 
} from 'lucide-react';

const currentYear = new Date().getFullYear();

export const Footer = () => {
  const { isAuthenticated, isAdmin, openLogin, openRegister } = useAuth();

  return (
    <footer className="w-full bg-white/95 dark:bg-slate-950/90 border-t border-orange-200/80 dark:border-amber-500/20 mt-auto py-12 text-slate-600 dark:text-slate-400 transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-600/30">
                <Clapperboard className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  CINEPASS
                </span>
                <span className="text-[9px] tracking-widest uppercase font-bold text-amber-600 dark:text-amber-400 -mt-1">
                  PREMIER CINEMAS
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Experience the pinnacle of cinema entertainment. Featuring cutting-edge IMAX® laser projection, Dolby Atmos® dimensional acoustics, and seamless online seat booking.
            </p>
            <div className="pt-1">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35">
                  <Shield className="w-3 h-3 text-amber-500" />
                  ADMINISTRATIVE ACCESS
                </span>
              ) : isAuthenticated ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  <Ticket className="w-3 h-3 text-rose-500" />
                  PREMIER MEMBER
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  CINEMA GUEST
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Role-Adaptive Navigation */}
          <div>
            {isAdmin ? (
              <>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  Admin Console
                </h4>
                <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                  <li>
                    <Link to="/admin/dashboard" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                      Operations Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/dashboard?tab=shows" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                      Showtime Scheduler
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/dashboard?tab=movies" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                      Manage Movies Catalog
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/dashboard?tab=screens" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                      Screen Layouts & Seating
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/dashboard?tab=bookings" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                      Bookings Audit & Gate Scanner
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                      Administrator Profile
                    </Link>
                  </li>
                </ul>
              </>
            ) : isAuthenticated ? (
              <>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-rose-500" />
                  Cinema Experience
                </h4>
                <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                  <li>
                    <Link to="/" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                      Now Showing & Trailers
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-bookings" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                      My Tickets & QR Passes
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                      Member Account & Preferences
                    </Link>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-rose-500" />
                  Quick Navigation
                </h4>
                <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                  <li>
                    <Link to="/" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                      Browse All Movies
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={openLogin}
                      className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center gap-1 text-left"
                    >
                      <LogIn className="w-3 h-3 text-rose-500" />
                      Sign In
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={openRegister}
                      className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center gap-1 text-left"
                    >
                      <UserPlus className="w-3 h-3 text-rose-500" />
                      Create Free Account
                    </button>
                  </li>
                </ul>
              </>
            )}
          </div>

          {/* Theatrical Experiences */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Theatrical Formats
            </h4>
            <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                IMAX® with Laser Dual Projection
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Dolby Atmos® 360° Surround Audio
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                4K HDR Laser Clarity
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                VIP Motorized Leather Recliners
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                Gourmet In-Seat Dine-In Service
              </li>
            </ul>
          </div>

          {/* Cinema Guarantees & Guest Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Guest Guarantees
            </h4>
            <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>5-Minute Guaranteed Seat Hold</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Contactless Digital QR Passes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Printable Official PDF Tickets</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>24/7 Guest Care & Assistance</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Guarantee */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {currentYear} Cinepass Cinemas & Entertainment Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>Laser Projection</span>
            <span>•</span>
            <span>Dolby Atmos® Audio</span>
            <span>•</span>
            <span>Guaranteed Seating</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
