/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, RefreshCw, Cpu, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  needsAuth: boolean;
  userEmail: string | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onSync: () => void;
  isSyncing: boolean;
  keywords: string[];
}

export default function Header({
  needsAuth,
  userEmail,
  onLogin,
  onLogout,
  isLoggingIn,
  onSync,
  isSyncing,
  keywords
}: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 py-4 px-6 md:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Title Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-sans font-extrabold text-slate-800 tracking-tight">
              Agentic Intelligence Digest
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Curated News Aggregator & Executive Summarization Engine
            </p>
          </div>
        </div>

        {/* Configurations, Sync & Authentication state */}
        <div className="flex flex-wrap items-center gap-3 md:self-center">
          
          {/* Keyword indicators */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-250">
            <span className="text-xs font-semibold text-slate-400">Tracking:</span>
            {keywords.slice(0, 3).map((kw, i) => (
              <span key={i} className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50/70 border border-blue-100 px-1.5 py-0.5 rounded uppercase">
                #{kw}
              </span>
            ))}
            {keywords.length > 3 && (
              <span className="text-[10px] text-slate-400 font-bold">+{keywords.length - 3}</span>
            )}
          </div>

          {/* Sync Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-all rounded-lg font-sans font-semibold text-xs disabled:opacity-60 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Aggregating...' : 'Sync News'}
          </button>

          {/* Gmail integration and login */}
          {needsAuth ? (
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="gsi-material-button flex items-center gap-3.5 px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-705 font-semibold text-xs hover:shadow-sm transition-all active:bg-slate-50 cursor-pointer relative overflow-hidden"
              style={{ minHeight: '38px' }}
            >
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-[18px] h-[18px] block">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents font-sans">Connect Gmail Auth</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-lg py-1.5 px-3">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Gmail Ready</span>
                <span className="text-xs font-semibold truncate max-w-[120px]">{userEmail || 'nhanquy@gmail.com'}</span>
              </div>
              <button 
                onClick={onLogout}
                className="text-emerald-700 hover:text-emerald-900 border-l border-emerald-200 pl-2 text-xs font-sans font-bold cursor-pointer"
              >
                Exit
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
