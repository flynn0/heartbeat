import React from 'react';
import { formatSecondsToDelay } from '../utils/time';
import { Clock, Activity, Zap, ShieldCheck, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

export default function StatsGrid({ cronData = [], manualData = [] }) {
  if (!cronData.length) return null;

  const latestRun = cronData[cronData.length - 1];

  const delays = cronData.map((d) => d.delaySeconds);
  const avgDelaySec = Math.round(delays.reduce((a, b) => a + b, 0) / delays.length);
  const minDelaySec = Math.min(...delays);
  const maxDelaySec = Math.max(...delays);

  const getDelayBadge = (sec) => {
    if (sec < 300) {
      return {
        label: 'Fast Runner Queue',
        color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      };
    }
    if (sec < 900) {
      return {
        label: 'Typical Queue Delay',
        color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      };
    }
    return {
      label: 'High GitHub Queue',
      color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    };
  };

  const badge = getDelayBadge(latestRun.delaySeconds);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Latest Delay Card */}
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs relative overflow-hidden group hover:border-rose-300 dark:hover:border-rose-800 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            Latest Cron Delay
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl lg:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            {latestRun.delayFormatted}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            ({latestRun.delaySeconds}s)
          </span>
        </div>
        <div className="mt-3">
          <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${badge.color}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Average Delay Card */}
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            Average Cron Delay
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl lg:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
            {formatSecondsToDelay(avgDelaySec)}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            (mean)
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Calculated across {cronData.length} monthly 17th runs
        </p>
      </div>

      {/* Min & Max Jitter Card */}
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            Delay Variance (Min / Max)
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Min Delay</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {formatSecondsToDelay(minDelaySec)}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <div className="flex items-center gap-1 text-xs text-rose-500 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Max Delay</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {formatSecondsToDelay(maxDelaySec)}
            </div>
          </div>
        </div>
      </div>

      {/* Separate Executions Recorded */}
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs relative overflow-hidden group hover:border-purple-300 dark:hover:border-purple-800 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            Recorded Runs
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-500 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <div>
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              {cronData.length}
            </span>
            <span className="text-xs text-slate-500 ml-1">Cron</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <div>
            <span className="text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
              {manualData.length}
            </span>
            <span className="text-xs text-slate-500 ml-1">Manual</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Recorded in separate datasets</span>
        </div>
      </div>
    </div>
  );
}
