'use client';

import { useState, useEffect } from 'react';
import { DailySummaryResponse } from '@studyos/shared';
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
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-gray-800 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-800 rounded w-1/2"></div>
      </div>
    );
  }

  if (!summary) return null;

  const hours = Math.floor(summary.totalStudySeconds / 3600);
  const minutes = Math.floor((summary.totalStudySeconds % 3600) / 60);

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Today's Study Overview
        </h3>
        <span className="text-[10px] text-gray-500 font-mono">
          {summary.date}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-800 rounded-xl p-3">
          <div className="text-xs text-gray-400 font-medium mb-1">Focused Time</div>
          <div className="text-xl font-bold text-blue-400">
            {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-800 rounded-xl p-3">
          <div className="text-xs text-gray-400 font-medium mb-1">Sessions</div>
          <div className="text-xl font-bold text-purple-400">
            {summary.sessionCount}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-800 rounded-xl p-3">
          <div className="text-xs text-gray-400 font-medium mb-1">Topics Studied</div>
          <div className="text-xl font-bold text-emerald-400">
            {summary.topicsStudiedCount}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-800 rounded-xl p-3">
          <div className="text-xs text-gray-400 font-medium mb-1">Completed</div>
          <div className="text-xl font-bold text-green-400">
            {summary.topicsCompletedCount}
          </div>
        </div>
      </div>

      {summary.subjectsStudied.length > 0 && (
        <div className="pt-2">
          <div className="text-[11px] text-gray-400 font-medium mb-2">
            Subjects Studied Today:
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.subjectsStudied.map((sub) => {
              const subMins = Math.floor(sub.durationSeconds / 60);
              return (
                <span
                  key={sub.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 border border-gray-700/60 rounded-lg text-xs font-medium text-gray-200"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: sub.colorHex || '#3B82F6' }}
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
