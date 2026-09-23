'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { StudyTrendResponse, TrendPeriod } from '@ascendiaos/shared';

interface StudyTrendChartProps {
  trend: StudyTrendResponse;
  onPeriodChange: (period: TrendPeriod) => void;
}

export const StudyTrendChart: React.FC<StudyTrendChartProps> = ({
  trend,
  onPeriodChange,
}) => {
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    date: string;
    duration: string;
    x: number;
    y: number;
  } | null>(null);

  const periods: Array<{ label: string; value: TrendPeriod }> = [
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' },
    { label: '1 year', value: '365d' },
  ];

  const maxSeconds = Math.max(
    ...trend.points.map((p) => p.studySeconds),
    3600, // min scale 1 hour
  );

  return (
    <div className="bg-surface p-6 rounded-sm border border-border space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
            Study Time Trend
          </h3>
          <p className="text-xs text-secondary mt-0.5">{trend.comparison.text}</p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center space-x-1 bg-background p-1 rounded-sm border border-border shrink-0">
          {periods.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPeriodChange(p.value)}
              className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-xs transition-colors ${
                trend.period === p.value
                  ? 'bg-orange-500 text-zinc-950 font-bold'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accessible Description for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        {trend.accessibleSummary}
      </div>

      {/* SVG Bar / Line Chart Visualization */}
      <div className="relative pt-6 pb-2">
        <div className="h-44 w-full flex items-end justify-between gap-1 border-b border-border px-1">
          {trend.points.map((pt, idx) => {
            const heightPercent = Math.round((pt.studySeconds / maxSeconds) * 100);
            const isToday = idx === trend.points.length - 1;

            return (
              <div
                key={pt.date}
                className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredPoint({
                    date: pt.date,
                    duration: pt.formattedDuration,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Bar */}
                <div
                  className={`w-full max-w-[12px] rounded-t-xs transition-all duration-150 ${
                    pt.studySeconds > 0
                      ? isToday
                        ? 'bg-orange-400 group-hover:bg-orange-300'
                        : 'bg-orange-500/60 group-hover:bg-orange-500'
                      : 'bg-border/30 group-hover:bg-border/60'
                  }`}
                  style={{
                    height: pt.studySeconds > 0 ? `${Math.max(8, heightPercent)}%` : '4px',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* X-Axis Sample Labels */}
        <div className="flex justify-between text-[10px] font-mono text-secondary mt-2 px-1">
          <span>{trend.points[0]?.date}</span>
          {trend.points.length > 10 && (
            <span>
              {trend.points[Math.floor(trend.points.length / 2)]?.date}
            </span>
          )}
          <span>{trend.points[trend.points.length - 1]?.date}</span>
        </div>

        {/* Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 px-2.5 py-1.5 bg-zinc-900 text-zinc-100 border border-zinc-700 text-xs rounded-sm shadow-lg pointer-events-none font-mono text-center"
            style={{
              left: `${hoveredPoint.x}px`,
              top: `${hoveredPoint.y}px`,
            }}
          >
            <div className="font-bold text-orange-400">{hoveredPoint.duration}</div>
            <div className="text-[10px] text-zinc-400">{hoveredPoint.date}</div>
          </div>
        )}
      </div>
    </div>
  );
};
