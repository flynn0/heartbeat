import React from 'react';
import { Heart, GitCommit, Shield } from 'lucide-react';
import GithubIcon from './GithubIcon';

export default function Footer({ version = '0.1.0', lastUpdated }) {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="font-bold text-slate-900 dark:text-white">heartbeat</span>
            <span className="text-slate-400">·</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              v{version}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Every month on the 17th @ 03:14 UTC
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Apache-2.0 License</span>
            </div>
            <a
              href="https://github.com/flynn0/heartbeat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>flynn0/heartbeat</span>
            </a>
          </div>
        </div>

        {lastUpdated && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
            <div>
              Designed & built for monitoring GitHub Actions cron scheduling latency.
            </div>
            <div className="mt-2 sm:mt-0 font-mono">
              Last recorded heartbeat: {new Date(lastUpdated).toUTCString()}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
