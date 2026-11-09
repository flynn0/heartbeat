import React, { useState } from 'react';
import { formatSecondsToDelay } from '../utils/time';
import { BarChart3, LineChart, TrendingUp, Info } from 'lucide-react';

export default function DelayChart({ data = [], onSelectRun, selectedRunId }) {
  const [viewMode, setViewMode] = useState('bar'); // 'bar' | 'line'
  const [unit, setUnit] = useState('minutes'); // 'minutes' | 'seconds'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
        No cron execution data recorded yet.
      </div>
    );
  }

  // Values in selected unit
  const values = data.map((d) => (unit === 'minutes' ? d.delaySeconds / 60 : d.delaySeconds));
  const maxVal = Math.max(...values, unit === 'minutes' ? 20 : 1200);
  const minVal = 0; // 0 baseline

  // Chart dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const getX = (index) => {
    if (data.length === 1) return padLeft + chartW / 2;
    return padLeft + (index / (data.length - 1)) * chartW;
  };

  const getY = (val) => {
    const ratio = (val - minVal) / (maxVal - minVal);
    return padTop + chartH - ratio * chartH;
  };

  // Generate path for line chart
  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(unit === 'minutes' ? d.delaySeconds / 60 : d.delaySeconds),
    d,
    val: unit === 'minutes' ? d.delaySeconds / 60 : d.delaySeconds,
  }));

  const linePath = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`
    : '';

  // Y-axis grid ticks
  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }).map((_, i) => {
    const val = (maxVal / tickCount) * i;
    return {
      val,
      y: getY(val),
      label: unit === 'minutes' ? `${val.toFixed(0)}m` : `${Math.round(val)}s`,
    };
  });

  const getBarColor = (seconds) => {
    if (seconds < 300) return 'fill-emerald-500 hover:fill-emerald-400'; // < 5m
    if (seconds < 900) return 'fill-amber-500 hover:fill-amber-400'; // 5m - 15m
    return 'fill-rose-500 hover:fill-rose-400'; // > 15m
  };

  const getBarGradient = (seconds) => {
    if (seconds < 300) return 'url(#grad-emerald)';
    if (seconds < 900) return 'url(#grad-amber)';
    return 'url(#grad-rose)';
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Cron Delay Time Visualization
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Execution delay beyond scheduled 03:14:00 UTC on the 17th of every month
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Unit Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setUnit('minutes')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                unit === 'minutes'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Minutes
            </button>
            <button
              onClick={() => setUnit('seconds')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                unit === 'seconds'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Seconds
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('bar')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bars</span>
            </button>
            <button
              onClick={() => setViewMode('line')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'line'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Line Chart"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Trend</span>
            </button>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto pb-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[620px] h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="grad-rose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="grad-amber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="grad-emerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {ticks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={t.y}
                x2={padLeft + chartW}
                y2={t.y}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeDasharray={idx === 0 ? '' : '4 4'}
                strokeWidth={idx === 0 ? '1.5' : '1'}
              />
              <text
                x={padLeft - 10}
                y={t.y + 4}
                textAnchor="end"
                className="text-[11px] font-mono fill-slate-400 dark:fill-slate-500 font-medium"
              >
                {t.label}
              </text>
            </g>
          ))}

          {/* Base Zero Line */}
          <line
            x1={padLeft}
            y1={padTop + chartH}
            x2={padLeft + chartW}
            y2={padTop + chartH}
            className="stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="2"
          />

          {/* Line Chart Mode */}
          {viewMode === 'line' && (
            <>
              <path d={areaPath} fill="url(#area-grad)" />
              <path
                d={linePath}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Bars / Points */}
          {data.map((item, i) => {
            const x = getX(i);
            const val = unit === 'minutes' ? item.delaySeconds / 60 : item.delaySeconds;
            const y = getY(val);
            const barHeight = Math.max(2, padTop + chartH - y);
            const barW = Math.min(36, Math.max(16, (chartW / data.length) * 0.65));
            const barX = x - barW / 2;
            const isHovered = hoveredIndex === i;
            const isSelected = selectedRunId === item.id;

            const dateObj = new Date(item.scheduledTime);
            const monthLabel = dateObj.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });
            const dayLabel = `${dateObj.getUTCDate()}th`;

            return (
              <g
                key={item.id}
                className="cursor-pointer transition-transform duration-150"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectRun && onSelectRun(item)}
              >
                {viewMode === 'bar' ? (
                  <>
                    <rect
                      x={barX}
                      y={y}
                      width={barW}
                      height={barHeight}
                      rx="4"
                      fill={getBarGradient(item.delaySeconds)}
                      className={`transition-all duration-150 ${
                        isSelected
                          ? 'stroke-2 stroke-rose-500 filter drop-shadow(0 0 6px rgba(244,63,94,0.4))'
                          : isHovered
                          ? 'filter brightness-110'
                          : ''
                      }`}
                    />
                    {/* Top cap value on hover */}
                    {isHovered && (
                      <text
                        x={x}
                        y={Math.max(16, y - 8)}
                        textAnchor="middle"
                        className="text-[11px] font-mono font-bold fill-rose-600 dark:fill-rose-400"
                      >
                        {item.delayFormatted}
                      </text>
                    )}
                  </>
                ) : (
                  <>
                    {/* Line mode circles */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered || isSelected ? 6.5 : 4.5}
                      className={`transition-all ${
                        isSelected
                          ? 'fill-rose-500 stroke-4 stroke-white dark:stroke-slate-900 shadow'
                          : 'fill-rose-500 stroke-2 stroke-white dark:stroke-slate-900 hover:fill-rose-400'
                      }`}
                    />
                    {isHovered && (
                      <text
                        x={x}
                        y={Math.max(16, y - 10)}
                        textAnchor="middle"
                        className="text-[11px] font-mono font-bold fill-rose-600 dark:fill-rose-400"
                      >
                        {item.delayFormatted}
                      </text>
                    )}
                  </>
                )}

                {/* X-axis Month Label */}
                <text
                  x={x}
                  y={padTop + chartH + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-mono font-medium ${
                    isHovered || isSelected
                      ? 'fill-rose-600 dark:fill-rose-400 font-bold'
                      : 'fill-slate-600 dark:fill-slate-400'
                  }`}
                >
                  {monthLabel}
                </text>
                <text
                  x={x}
                  y={padTop + chartH + 32}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-400 dark:fill-slate-600"
                >
                  {dayLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Details Banner */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>&lt; 5m (Optimal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>5m - 15m (Average queue)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>&gt; 15m (High load)</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Info className="w-3.5 h-3.5" />
          <span>Click on any data point to highlight run metadata below</span>
        </div>
      </div>
    </div>
  );
}
