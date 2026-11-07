import React from 'react';
import { 
  Users, Film, Tv, Calendar, Ticket, IndianRupee, 
  ArrowUpRight, Clock, CheckCircle2, AlertCircle, XCircle 
} from 'lucide-react';

export const AdminOverviewTab = ({ 
  stats, 
  recentBookings, 
  moviesMap, 
  showsMap, 
  onNavigateTab 
}) => {
  const kpis = [
    {
      label: 'Registered Users',
      value: stats.totalUsers,
      subtext: 'Active customer accounts',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      tab: null
    },
    {
      label: 'Catalog Movies',
      value: stats.totalMovies,
      subtext: 'Available for scheduling',
      icon: Film,
      color: 'from-rose-600 to-pink-600',
      tab: 'movies'
    },
    {
      label: 'Cinema Screens',
      value: stats.totalScreens,
      subtext: `${stats.totalTheatres} unique theatres`,
      icon: Tv,
      color: 'from-amber-500 to-orange-600',
      tab: 'screens'
    },
    {
      label: 'Scheduled Shows',
      value: stats.totalShows,
      subtext: 'Active showtimes',
      icon: Calendar,
      color: 'from-emerald-500 to-teal-600',
      tab: 'shows'
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      subtext: `${stats.confirmedBookings} confirmed bookings`,
      icon: Ticket,
      color: 'from-purple-600 to-violet-600',
      tab: 'bookings'
    },
    {
      label: 'Gross Revenue',
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`,
      subtext: 'From confirmed tickets',
      icon: IndianRupee,
      color: 'from-emerald-600 to-green-600',
      tab: 'bookings'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'HOLD':
      case 'HELD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> In Hold
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <AlertCircle className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => kpi.tab && onNavigateTab(kpi.tab)}
              className={`p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all shadow-lg relative overflow-hidden group ${
                kpi.tab ? 'cursor-pointer hover:bg-slate-900/80' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {kpi.label}
                  </p>
                  <h3 className="text-3xl font-extrabold text-white mt-1.5 tracking-tight">
                    {kpi.value}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {kpi.subtext}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              {kpi.tab && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-rose-400 transition-colors">
                  <span>Manage {kpi.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Launch & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launch Bar */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white mb-2">Operational Shortcuts</h4>
            <p className="text-xs text-slate-400 mb-5">
              Rapidly trigger core administrative actions across cinema microservices.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateTab('movies')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-rose-500/40 text-sm font-medium text-slate-200 hover:text-white transition-all text-left"
              >
                <span className="flex items-center gap-2.5">
                  <Film className="w-4 h-4 text-rose-400" />
                  Add or Update Movie
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => onNavigateTab('shows')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 text-sm font-medium text-slate-200 hover:text-white transition-all text-left"
              >
                <span className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Schedule New Show
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => onNavigateTab('screens')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 text-sm font-medium text-slate-200 hover:text-white transition-all text-left"
              >
                <span className="flex items-center gap-2.5">
                  <Tv className="w-4 h-4 text-amber-400" />
                  Create Screen Layout
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => onNavigateTab('bookings')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-purple-500/40 text-sm font-medium text-slate-200 hover:text-white transition-all text-left"
              >
                <span className="flex items-center gap-2.5">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  Review Booking Audit
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>Spring Security RBAC</span>
            <span className="font-mono text-amber-400 font-semibold">ROLE_ADMIN Active</span>
          </div>
        </div>

        {/* Recent Transactions Monitor */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white">Recent Customer Bookings</h4>
              <p className="text-xs text-slate-400">Latest reservation events processed across theatres</p>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              View all ({stats.totalBookings}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No recent bookings registered in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
                    <th className="pb-3">Booking ID</th>
                    <th className="pb-3">Movie & Show</th>
                    <th className="pb-3">Seats</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentBookings.slice(0, 5).map((booking) => {
                    const show = showsMap[booking.showId];
                    const movie = show ? moviesMap[show.movieId] : null;

                    return (
                      <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-mono text-xs text-rose-400 font-medium">
                          #{booking.id}
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-slate-200 line-clamp-1">
                            {movie?.title || `Show #${booking.showId}`}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {show?.showTime ? new Date(show.showTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Time Pending'}
                          </p>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1 max-w-[140px]">
                            {booking.seatNumbers?.map((seat) => (
                              <span key={seat} className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {seat}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 font-semibold text-slate-200">
                          ₹{booking.totalAmount}
                        </td>
                        <td className="py-3">
                          {getStatusBadge(booking.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

