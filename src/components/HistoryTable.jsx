import React, { useState } from 'react';
import { formatUTC, formatLocal } from '../utils/time';
import { Clock, Zap, Download, Search, CheckCircle2, GitCommit, User, ExternalLink, Calendar } from 'lucide-react';

export default function HistoryTable({ cronData = [], manualData = [], selectedRunId }) {
  const [activeTab, setActiveTab] = useState('cron'); // 'cron' | 'manual'
  const [searchTerm, setSearchTerm] = useState('');

  const currentList = activeTab === 'cron' ? cronData : manualData;

  const filtered = currentList.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.id && item.id.toLowerCase().includes(term)) ||
      (item.commitSha && item.commitSha.toLowerCase().includes(term)) ||
      (item.actor && item.actor.toLowerCase().includes(term)) ||
      (item.note && item.note.toLowerCase().includes(term)) ||
      (item.scheduledTime && item.scheduledTime.includes(term)) ||
      (item.actualTime && item.actualTime.includes(term))
    );
  });

  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentList, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `${activeTab}_history.json`);
    dlAnchorElem.click();
  };

  const getDelayPill = (seconds) => {
    if (seconds < 300) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    }
    if (seconds < 900) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800';
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Header with Tabs, Search and Export */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setActiveTab('cron')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'cron'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4 text-rose-500" />
            <span>Scheduled Cron Runs</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200 dark:bg-slate-600 font-mono">
              {cronData.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-purple-500" />
            <span>Manual Triggers</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200 dark:bg-slate-600 font-mono">
              {manualData.length}
            </span>
          </button>
        </div>

        {/* Search & Export */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab} logs...`}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <button
            onClick={downloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
            title="Download JSON data"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              {activeTab === 'cron' ? (
                <>
                  <th className="py-3 px-4 sm:px-6">Run & Scheduled Slot</th>
                  <th className="py-3 px-4">Actual Execution</th>
                  <th className="py-3 px-4">Delay (Queue Jitter)</th>
                  <th className="py-3 px-4">Trigger Actor</th>
                  <th className="py-3 px-4">Commit</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </>
              ) : (
                <>
                  <th className="py-3 px-4 sm:px-6">Manual Run ID</th>
                  <th className="py-3 px-4">Execution Time (UTC / Local)</th>
                  <th className="py-3 px-4">Triggered By</th>
                  <th className="py-3 px-4">Workflow Dispatch Note</th>
                  <th className="py-3 px-4">Commit</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                  No execution records found matching your query.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedRunId === item.id;
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-rose-50/70 dark:bg-rose-950/30'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {activeTab === 'cron' ? (
                      <>
                        <td className="py-3 px-4 sm:px-6">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>#{item.runNumber || item.id}</span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-rose-500 text-white font-sans font-bold">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-sans">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{formatUTC(item.scheduledTime)}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-800 dark:text-slate-200">
                            {formatUTC(item.actualTime)}
                          </div>
                          <div className="text-[11px] text-slate-400 font-sans">
                            {formatLocal(item.actualTime)}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getDelayPill(
                              item.delaySeconds
                            )}`}
                          >
                            <span>{item.delayFormatted}</span>
                            <span className="text-[10px] opacity-75">({item.delaySeconds}s)</span>
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-sans">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.actor || 'system'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <GitCommit className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.commitSha?.slice(0, 7) || 'HEAD'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Success</span>
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 sm:px-6">
                          <div className="font-semibold text-purple-600 dark:text-purple-400">
                            #{item.runNumber || item.id}
                          </div>
                          <div className="text-[11px] text-slate-400 font-sans">
                            workflow_dispatch
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-slate-800 dark:text-slate-200">
                            {formatUTC(item.actualTime)}
                          </div>
                          <div className="text-[11px] text-slate-400 font-sans">
                            {formatLocal(item.actualTime)}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-sans">
                            <User className="w-3.5 h-3.5 text-purple-400" />
                            <span>{item.actor}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-slate-700 dark:text-slate-300 font-sans bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs">
                            {item.note || 'Manual dispatch'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <GitCommit className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.commitSha?.slice(0, 7) || 'HEAD'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Recorded</span>
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
