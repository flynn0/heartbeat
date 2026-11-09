import React, { useState } from 'react';
import { Code2, Terminal, Copy, Check, FileJson, ArrowUpRight, Sparkles, Database, Clock, Zap } from 'lucide-react';

export default function ApiExplorer({ initialData }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState('latest-delay');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedSpec, setCopiedSpec] = useState(false);

  const endpoints = [
    {
      id: 'latest-delay',
      name: 'Latest Cron Delay',
      method: 'GET',
      path: '/api/latest-delay.json',
      desc: 'Retrieves the latest monthly cron execution, including scheduled time, actual runner time, and calculated delay.',
      icon: Clock,
      sample: initialData?.api?.latestDelay || {
        id: "cron-2026-10-17",
        type: "cron",
        runNumber: 10,
        scheduledTime: "2026-10-17T03:14:00.000Z",
        actualTime: "2026-10-17T03:23:55.000Z",
        delayMs: 595000,
        delaySeconds: 595,
        delayFormatted: "+9m 55s",
        status: "success"
      }
    },
    {
      id: 'latest-manual',
      name: 'Latest Manual Trigger & Delay',
      method: 'GET',
      path: '/api/latest-manual.json',
      desc: 'Retrieves the latest manual workflow_dispatch run with dispatch timestamp, execution time, and queue delay.',
      icon: Zap,
      sample: initialData?.api?.latestManual || {
        id: "manual-1794211962221",
        type: "manual",
        runNumber: 12,
        dispatchTime: "2026-11-09T08:12:38.014Z",
        actualTime: "2026-11-09T08:12:42.214Z",
        delayMs: 4200,
        delaySeconds: 4,
        delayFormatted: "+4s",
        actor: "flynn0",
        note: "Release verification trigger",
        status: "success"
      }
    },
    {
      id: 'history',
      name: 'Whole Execution History & Measurements',
      method: 'GET',
      path: '/api/history.json',
      desc: 'Retrieves the complete historical array of cron measurements, manual dispatches, and aggregate statistics.',
      icon: Database,
      sample: {
        version: "0.1.1",
        lastUpdated: initialData?.lastUpdated,
        statistics: initialData?.statistics || {
          totalRuns: 13,
          cronRuns: 10,
          manualRuns: 3,
          latestCronDelaySeconds: 595,
          averageCronDelaySeconds: 587,
          minCronDelaySeconds: 214,
          maxCronDelaySeconds: 1098
        },
        cronHistoryCount: initialData?.cron?.length || 10,
        manualHistoryCount: initialData?.manual?.length || 3
      }
    },
    {
      id: 'summary',
      name: 'Consolidated Summary',
      method: 'GET',
      path: '/api/summary.json',
      desc: 'Retrieves a single unified summary object with schedule metadata, latest cron latency, and latest manual dispatch.',
      icon: Sparkles,
      sample: {
        version: "0.1.1",
        schedule: {
          cron: "14 3 17 * *",
          description: "Every month on the 17th at 03:14:00 UTC"
        },
        latestCronDelay: initialData?.api?.latestDelay,
        latestManualTrigger: initialData?.api?.latestManual
      }
    }
  ];

  const current = endpoints.find(e => e.id === selectedEndpoint) || endpoints[0];

  const copyCurl = (path, idx) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://flynn0.github.io/heartbeat';
    const cmd = `curl -s "${origin}${path}" | jq .`;
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copySpecUrl = (format = 'json') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://flynn0.github.io/heartbeat';
    navigator.clipboard.writeText(`${origin}/openapi.${format}`);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Public REST API & Machine-Readable Spec
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Programmatically query cron jitter metrics, manual triggers, and execution history.
          </p>
        </div>

        {/* OpenAPI badges & links */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="./openapi.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            <FileJson className="w-3.5 h-3.5 text-rose-500" />
            <span>OpenAPI 3.1 (JSON)</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </a>
          <a
            href="./openapi.yaml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-500" />
            <span>OpenAPI (YAML)</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Grid: Left Endpoints list, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints Nav */}
        <div className="lg:col-span-5 space-y-2">
          {endpoints.map((ep, idx) => {
            const isSelected = selectedEndpoint === ep.id;
            const Icon = ep.icon;
            return (
              <div
                key={ep.id}
                onClick={() => setSelectedEndpoint(ep.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-rose-500/80 bg-rose-50/60 dark:bg-rose-950/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                      {ep.path}
                    </span>
                  </div>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-500' : 'text-slate-400'}`} />
                </div>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {ep.desc}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <span className="text-slate-400 font-sans">{ep.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyCurl(ep.path, idx);
                    }}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    title="Copy cURL command"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="w-3 h-3" />
                        <span>Copy cURL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Response Box */}
        <div className="lg:col-span-7 flex flex-col rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 shadow-inner">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-400 font-bold">200 OK</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{current.path}</span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(current.sample, null, 2));
                setCopiedIndex('code');
                setTimeout(() => setCopiedIndex(null), 2000);
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors cursor-pointer"
            >
              {copiedIndex === 'code' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-400/90 leading-relaxed max-h-[360px] scrollbar-thin">
            {JSON.stringify(current.sample, null, 2)}
          </pre>

          <div className="mt-auto px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Content-Type: application/json</span>
            <span>Static REST endpoint · CORS enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
