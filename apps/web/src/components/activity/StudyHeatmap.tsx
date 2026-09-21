'use client';

import React, { useState } from 'react';
import { DailyActivityItem } from '@studyos/shared';

interface StudyHeatmapProps {
  days: DailyActivityItem[];
  totalActiveDays?: number;
  totalStudySeconds?: number;
  loading?: boolean;
}

const LEVEL_COLORS = [
  'bg-zinc-800/50 border-zinc-700/30 hover:border-zinc-500', // Level 0
  'bg-emerald-950/80 border-emerald-800/60 hover:border-emerald-600', // Level 1
  'bg-emerald-800 border-emerald-700/80 hover:border-emerald-500', // Level 2
  'bg-emerald-600 border-emerald-500 hover:border-emerald-400', // Level 3
  'bg-emerald-400 border-emerald-300 hover:border-emerald-200 shadow-sm shadow-emerald-500/20', // Level 4
];

const LEVEL_LABELS = ['None', 'Low (15-29m)', 'Moderate (30-59m)', 'High (1-2h)', 'Very High (2h+)'];

export function StudyHeatmap({
  days,
  totalActiveDays = 0,
  totalStudySeconds = 0,
  loading = false,
}: StudyHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DailyActivityItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-sm p-6 space-y-4 animate-pulse">
        <div className="h-5 bg-background rounded-sm w-1/4" />
        <div className="h-32 bg-background rounded-sm w-full" />
      </div>
    );
  }

  // Format date helper: YYYY-MM-DD -> "Sep 20, 2026"
  const formatDateLabel = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(Date.UTC(y, m - 1, d));
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return dateStr;
    }
  };

  // Format study duration: seconds -> "2h 14m" or "45m" or "0m"
  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
    return `${mins}m`;
  };

  // Arrange days into 7-row columns (Sunday=0 to Saturday=6)
  // Compute column offset for the first day
  const gridColumns: (DailyActivityItem | null)[][] = [];
  let currentCol: (DailyActivityItem | null)[] = [];

  if (days.length > 0) {
    const firstDateStr = days[0].date;
    const [fy, fm, fd] = firstDateStr.split('-').map(Number);
    const firstDayOfWeek = new Date(Date.UTC(fy, fm - 1, fd)).getUTCDay();

    // Pad first column if first day is not Sunday
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentCol.push(null);
    }

    for (const day of days) {
      currentCol.push(day);
      if (currentCol.length === 7) {
        gridColumns.push(currentCol);
        currentCol = [];
      }
    }
    if (currentCol.length > 0) {
      while (currentCol.length < 7) {
        currentCol.push(null);
      }
      gridColumns.push(currentCol);
    }
  }

  // Compute month headers across columns
  const monthHeaders: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;

  gridColumns.forEach((col, cIdx) => {
    const validDay = col.find((d) => d !== null);
    if (validDay) {
      const [y, m] = validDay.date.split('-').map(Number);
      if (m !== lastMonth) {
        const monthName = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
          month: 'short',
          timeZone: 'UTC',
        });
        monthHeaders.push({ label: monthName, colIndex: cIdx });
        lastMonth = m;
      }
    }
  });

  const totalHours = Math.floor(totalStudySeconds / 3600);
  const totalMins = Math.floor((totalStudySeconds % 3600) / 60);

  return (
    <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <h3 className="text-sm font-bold text-primary tracking-tight font-mono">
            Study Activity Heatmap
          </h3>
          <p className="text-xs text-secondary mt-0.5 font-mono">
            Recorded study time over the past 365 days
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono shrink-0">
          <div>
            <span className="text-secondary">Active Days: </span>
            <span className="font-bold text-emerald-400">{totalActiveDays} days</span>
          </div>
          <div>
            <span className="text-secondary">Total Time: </span>
            <span className="font-bold text-orange-400">
              {totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`}
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Container (Horizontally Scrollable) */}
      <div className="relative overflow-x-auto pb-2 pt-1 scrollbar-thin">
        <div className="inline-block min-w-max">
          {/* Month Labels Header Row */}
          <div className="flex text-[10px] text-secondary font-mono mb-1 pl-8 relative h-4">
            {monthHeaders.map((mh, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${mh.colIndex * 15 + 32}px` }}
              >
                {mh.label}
              </span>
            ))}
          </div>

          <div className="flex">
            {/* Day of Week Labels */}
            <div className="flex flex-col justify-between text-[9px] text-secondary font-mono pr-2 h-[105px] pt-[2px]">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Grid Columns */}
            <div className="flex gap-[3px]">
              {gridColumns.map((col, cIdx) => (
                <div key={cIdx} className="flex flex-col gap-[3px]">
                  {col.map((day, rIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={rIdx}
                          className="w-3 h-3 rounded-[2px] bg-transparent"
                        />
                      );
                    }

                    const colorClass = LEVEL_COLORS[day.activityLevel] || LEVEL_COLORS[0];

                    return (
                      <button
                        key={day.date}
                        type="button"
                        className={`w-3 h-3 rounded-[2px] border transition-all ${colorClass} focus:outline-none focus:ring-1 focus:ring-emerald-400`}
                        aria-label={`${formatDateLabel(day.date)}: ${formatDuration(
                          day.studySeconds,
                        )} study time, ${day.sessions} sessions`}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipPos({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                          setHoveredDay(day);
                        }}
                        onMouseLeave={() => {
                          setHoveredDay(null);
                          setTooltipPos(null);
                        }}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipPos({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                          setHoveredDay(day);
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredDay && tooltipPos && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full bg-zinc-900 border border-zinc-700 text-zinc-100 p-2.5 rounded-sm shadow-xl text-xs font-mono pointer-events-none space-y-1 w-48"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="font-bold text-zinc-200 text-[11px] border-b border-zinc-800 pb-1">
            {formatDateLabel(hoveredDay.date)}
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Study Time:</span>
            <span className="font-semibold text-emerald-400">
              {formatDuration(hoveredDay.studySeconds)}
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Sessions:</span>
            <span className="font-semibold text-zinc-200">{hoveredDay.sessions}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Topics Studied:</span>
            <span className="font-semibold text-orange-400">{hoveredDay.topicsStudied}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Completed:</span>
            <span className="font-semibold text-emerald-400">{hoveredDay.topicsCompleted}</span>
          </div>
          <div className="flex justify-between text-[10px] pt-1 text-zinc-400 border-t border-zinc-800/80">
            <span>Activity Level:</span>
            <span className="text-zinc-300 font-semibold">
              {LEVEL_LABELS[hoveredDay.activityLevel]}
            </span>
          </div>
        </div>
      )}

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-secondary font-mono pt-2 border-t border-border gap-2">
        <span>Less</span>
        <div className="flex items-center space-x-1.5">
          {LEVEL_COLORS.map((cls, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-[2px] border ${cls}`}
              title={LEVEL_LABELS[idx]}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
