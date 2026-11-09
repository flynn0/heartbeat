import React from 'react';
import { HelpCircle, Clock, Zap, GitBranch, Cpu, ShieldAlert } from 'lucide-react';

export default function ExplainerSection() {
  return (
    <div className="bg-white dark:bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="w-5 h-5 text-rose-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          About Heartbeat & GitHub Actions Cron Jitter
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: What is schedule delay? */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
            Why is GitHub Cron Delayed?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            GitHub Actions scheduled workflows run on a shared infrastructure pool. During periods of high load,
            workflow starts may be queued and delayed past the exact cron trigger minute. Heartbeat tracks this
            exact latency over time.
          </p>
        </div>

        {/* Card 2: Why the 17th at 3:14 AM? */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
            Why 17th @ 03:14 UTC?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The reason for the 17th at 3:14 AM is that <strong className="text-slate-900 dark:text-white">17 is a prime number</strong> and <strong className="text-slate-900 dark:text-white">3:14 represents the first 3 digits of &pi;</strong> (&pi; &approx; 3.14). This also avoids top-of-the-hour runner contention (<code className="font-mono text-xs text-rose-500">:00</code> and <code className="font-mono text-xs text-rose-500">:30</code>).
          </p>
        </div>

        {/* Card 3: Separate Manual Recording */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
            Separated Manual Triggers
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Manual dispatches (<code className="font-mono text-xs text-purple-500">workflow_dispatch</code>) are recorded in their own dedicated dataset (<code className="font-mono text-xs">manual_history.json</code>) without polluting the scheduled cron jitter benchmarks.
          </p>
        </div>
      </div>
    </div>
  );
}
