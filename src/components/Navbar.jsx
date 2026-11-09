import React from 'react';
import { Heart, Moon, Sun, Tag, Radio } from 'lucide-react';
import GithubIcon from './GithubIcon';

export default function Navbar({ theme, onToggleTheme, version = '0.1.0' }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-tr from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/20">
            <Heart className="w-5 h-5 animate-heartbeat fill-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                heartbeat
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-mono">
                <Tag className="w-3 h-3" />
                <span>v{version}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium hidden sm:block">
              Monthly 17th @ 03:14 UTC Cron Delay Observatory
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Live Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-slate-800">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Active Cron</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            aria-label="Toggle Dark Mode"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/flynn0/heartbeat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xs"
          >
            <GithubIcon className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
