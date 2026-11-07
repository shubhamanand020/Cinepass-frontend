import React from 'react';
import { Clapperboard, Server, ShieldCheck, Database, Layers } from 'lucide-react';

const currentYear = new Date().getFullYear();

export const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 mt-auto py-12 text-slate-600 dark:text-slate-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white">
                <Clapperboard className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                CINEPASS
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              An enterprise distributed movie ticket booking system engineered on Service-Oriented Architecture (SOA), Spring Cloud Gateway, Eureka Service Discovery, and React.js.
            </p>
          </div>

          {/* Microservices Specs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-rose-500" />
              Microservices Topology
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 font-mono">
              <li>API Gateway (Port 8080)</li>
              <li>Eureka Discovery (Port 8761)</li>
              <li>User Service (Port 8081)</li>
              <li>Movie Service (Port 8082)</li>
              <li>Booking Engine (Port 8083)</li>
              <li>Show Scheduler (Port 8084)</li>
            </ul>
          </div>

          {/* Architecture Highlights */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              SOA Guarantees
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Stateless HMAC-SHA256 JWT
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> 4 Isolated PostgreSQL DBs
              </li>
              <li className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" /> 5-Min Atomic Seat Hold Lock
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} Cinepass Entertainment Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built for Enterprise Review 1 & 2 SOA Evaluation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

