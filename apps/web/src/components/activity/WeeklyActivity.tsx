'use client';

import React from 'react';
import { WeeklyActivityResponse } from '@ascendiaos/shared';
import { CalendarRange } from 'lucide-react';

interface WeeklyActivityProps {
  weekly: WeeklyActivityResponse | null;
  loading?: boolean;
}

export function WeeklyActivity({ weekly, loading }: WeeklyActivityProps) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-sm p-6 animate-pulse space-y-4">
        <div className="h-4 bg-background rounded-sm w-1/3" />
        <div className="h-24 bg-background rounded-sm w-full" />
      </div>
    );
  }

  if (!weekly) return null;

  const totalHrs = Math.floor(weekly.totalStudySeconds / 3600);
  const totalMins = Math.floor((weekly.totalStudySeconds % 3600) / 60);

  const maxSeconds = Math.max(
    ...weekly.days.map((d) => d.studySeconds),
    3600, // At least 1 hour scale
  );

  return (
    <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <CalendarRange className="w-4 h-4 text-orange-500" />
          <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
            This Week's Activity
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-secondary">
            Total:{' '}
            <strong className="text-primary font-semibold">
              {totalHrs > 0 ? `${totalHrs}h ${totalMins}m` : `${totalMins}m`}
            </strong>
          </span>
          <span className="text-secondary">
            Active Days:{' '}
            <strong className="text-emerald-400 font-semibold">
              {weekly.activeDaysCount} / {weekly.totalDaysCount}
            </strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-1">
        {weekly.days.map((day) => {
          const hrs = Math.floor(day.studySeconds / 3600);
          const mins = Math.floor((day.studySeconds % 3600) / 60);
          const formatted = hrs > 0 ? `${hrs}h ${mins}m` : day.studySeconds > 0 ? `${mins}m` : '0m';
          const heightPercent = Math.min(100, Math.round((day.studySeconds / maxSeconds) * 100));

          return (
            <div
              key={day.date}
              className="flex flex-col items-center space-y-2 group"
            >
              <div className="text-[10px] text-secondary font-mono font-medium">
                {formatted}
              </div>

              <div className="w-full bg-background border border-border rounded-sm h-24 flex items-end p-1 relative">
                <div
                  className={`w-full rounded-xs transition-all duration-300 ${
                    day.isActive
                      ? 'bg-emerald-500 group-hover:bg-emerald-400'
                      : day.studySeconds > 0
                      ? 'bg-orange-500/60 group-hover:bg-orange-500'
                      : 'bg-zinc-800/40'
                  }`}
                  style={{ height: `${Math.max(4, heightPercent)}%` }}
                />
              </div>

              <div className="text-xs font-mono font-semibold text-primary">
                {day.dayName}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
