'use client';

import React from 'react';
import { DailySummaryResponse } from '@studyos/shared';
import { Clock, BookOpen, CheckCircle, Flame } from 'lucide-react';

interface DailyActivityCardProps {
  summary: DailySummaryResponse | null;
  loading?: boolean;
}

export function DailyActivityCard({ summary, loading }: DailyActivityCardProps) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-sm p-6 animate-pulse space-y-4">
        <div className="h-4 bg-background rounded-sm w-1/3" />
        <div className="h-8 bg-background rounded-sm w-1/2" />
      </div>
    );
  }

  if (!summary) return null;

  const hours = Math.floor(summary.totalStudySeconds / 3600);
  const minutes = Math.floor((summary.totalStudySeconds % 3600) / 60);

  return (
    <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-orange-400" />
          <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
            Today's Activity
          </h3>
        </div>
        <span className="text-[11px] text-secondary font-mono">
          {summary.date} ({summary.timezone})
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background border border-border rounded-sm p-3.5 space-y-1">
          <div className="text-[11px] text-secondary font-medium font-mono flex items-center">
            Focused Time
          </div>
          <div className="text-2xl font-bold font-mono text-orange-400 tracking-tight">
            {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
          </div>
        </div>

        <div className="bg-background border border-border rounded-sm p-3.5 space-y-1">
          <div className="text-[11px] text-secondary font-medium font-mono">
            Sessions
          </div>
          <div className="text-2xl font-bold font-mono text-primary tracking-tight">
            {summary.sessionCount}
          </div>
        </div>

        <div className="bg-background border border-border rounded-sm p-3.5 space-y-1">
          <div className="text-[11px] text-secondary font-medium font-mono flex items-center">
            Topics Studied
          </div>
          <div className="text-2xl font-bold font-mono text-orange-400 tracking-tight">
            {summary.topicsStudiedCount}
          </div>
        </div>

        <div className="bg-background border border-border rounded-sm p-3.5 space-y-1">
          <div className="text-[11px] text-secondary font-medium font-mono flex items-center">
            Topics Completed
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
            {summary.topicsCompletedCount}
          </div>
        </div>
      </div>

      {summary.subjectsStudied && summary.subjectsStudied.length > 0 && (
        <div className="pt-2 border-t border-border">
          <span className="text-[11px] text-secondary font-mono block mb-2">
            Subject Breakdown Today:
          </span>
          <div className="flex flex-wrap gap-2">
            {summary.subjectsStudied.map((sub) => {
              const subMins = Math.floor(sub.durationSeconds / 60);
              const subHrs = Math.floor(subMins / 60);
              const remMins = subMins % 60;
              const formattedDuration =
                subHrs > 0 ? `${subHrs}h ${remMins}m` : `${subMins}m`;

              return (
                <span
                  key={sub.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-background border border-border rounded-sm text-xs font-medium text-primary font-mono"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: sub.colorHex || '#F97316' }}
                  />
                  <span>{sub.name}</span>
                  <span className="text-secondary">({formattedDuration})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
