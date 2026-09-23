'use client';

import { useState, useEffect } from 'react';
import { DailySummaryResponse } from '@ascendiaos/shared';
import { api } from '@/lib/api';

export function DailySummaryCard() {
  const [summary, setSummary] = useState<DailySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const res = await api.getDailySummary(undefined, userTz);
        setSummary(res);
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-sm p-5 animate-pulse">
        <div className="h-4 bg-background rounded-sm w-1/3 mb-4" />
        <div className="h-8 bg-background rounded-sm w-1/2" />
      </div>
    );
  }

  if (!summary) return null;

  const hours = Math.floor(summary.totalStudySeconds / 3600);
  const minutes = Math.floor((summary.totalStudySeconds % 3600) / 60);

  return (
    <div className="bg-surface border border-border rounded-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
          Today's Study Overview
        </h3>
        <span className="text-[10px] text-secondary font-mono">
          {summary.date}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background border border-border rounded-sm p-3">
          <div className="text-[11px] text-secondary font-medium mb-1 font-mono">Focused Time</div>
          <div className="text-xl font-bold font-mono text-orange-400">
            {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
          </div>
        </div>

        <div className="bg-background border border-border rounded-sm p-3">
          <div className="text-[11px] text-secondary font-medium mb-1 font-mono">Sessions</div>
          <div className="text-xl font-bold font-mono text-primary">
            {summary.sessionCount}
          </div>
        </div>

        <div className="bg-background border border-border rounded-sm p-3">
          <div className="text-[11px] text-secondary font-medium mb-1 font-mono">Topics Studied</div>
          <div className="text-xl font-bold font-mono text-orange-400">
            {summary.topicsStudiedCount}
          </div>
        </div>

        <div className="bg-background border border-border rounded-sm p-3">
          <div className="text-[11px] text-secondary font-medium mb-1 font-mono">Completed</div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {summary.topicsCompletedCount}
          </div>
        </div>
      </div>

      {summary.subjectsStudied.length > 0 && (
        <div className="pt-2">
          <div className="text-[11px] text-secondary font-medium mb-2 font-mono">
            Subjects Studied Today:
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.subjectsStudied.map((sub) => {
              const subMins = Math.floor(sub.durationSeconds / 60);
              return (
                <span
                  key={sub.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border rounded-sm text-xs font-medium text-primary font-mono"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: sub.colorHex || '#F97316' }}
                  />
                  {sub.name} ({subMins}m)
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
