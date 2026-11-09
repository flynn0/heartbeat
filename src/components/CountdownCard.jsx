import React, { useState, useEffect } from 'react';
import { getNextScheduledRun, getTimeRemaining, formatUTC, formatLocal } from '../utils/time';
import { Calendar, Clock, Heart, Terminal, Sparkles } from 'lucide-react';

export default function CountdownCard() {
  const [nextRun, setNextRun] = useState(getNextScheduledRun());
  const [remaining, setRemaining] = useState(getTimeRemaining(nextRun));
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = getNextScheduledRun(now);
      setNextRun(target);
      setRemaining(getTimeRemaining(target));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const copyManualCommand = () => {
    navigator.clipboard.writeText('gh workflow run heartbeat.yml -f note="Manual trigger"');
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-500 via-rose-600 to-red-700 text-white p-6 sm:p-8 shadow-xl shadow-rose-500/10">
      {/* Decorative background grid and glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_50%)] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left column: Schedule explanation */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 tracking-wide">
            <Heart className="w-3.5 h-3.5 text-rose-200 animate-heartbeat fill-rose-200" />
            <span>CRON SCHEDULE: 14 3 17 * *</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Next Scheduled Heartbeat
          </h2>
          <p className="mt-1 text-sm text-rose-100/90 leading-relaxed">
            Every month on the <strong className="text-white">17th at 3:14 AM UTC</strong> (17 is prime &amp; 3:14 = &pi;), this repo triggers
            a scheduled GitHub Actions workflow to measure runner queue latency.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-rose-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-200" />
              <span>Target: {formatUTC(nextRun.toISOString())}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-200" />
              <span>Your Time: {formatLocal(nextRun.toISOString())}</span>
            </div>
          </div>
        </div>

        {/* Right column: Live countdown blocks */}
        <div className="flex flex-col items-start lg:items-end gap-3">
          <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="bg-black/20 backdrop-blur-md rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border border-white/10 min-w-[64px] sm:min-w-[76px]">
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                {String(remaining.days).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs font-medium uppercase text-rose-200 tracking-wider">
                Days
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border border-white/10 min-w-[64px] sm:min-w-[76px]">
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                {String(remaining.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs font-medium uppercase text-rose-200 tracking-wider">
                Hours
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border border-white/10 min-w-[64px] sm:min-w-[76px]">
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
                {String(remaining.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs font-medium uppercase text-rose-200 tracking-wider">
                Mins
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-md rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border border-white/10 min-w-[64px] sm:min-w-[76px]">
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white animate-pulse">
                {String(remaining.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs font-medium uppercase text-rose-200 tracking-wider">
                Secs
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyManualCommand}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-medium text-white border border-white/20 cursor-pointer"
              title="Copy GitHub CLI command to manually trigger workflow"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{showCopied ? 'Command Copied!' : 'Manual Trigger CLI'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
