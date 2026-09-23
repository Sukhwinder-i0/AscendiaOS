'use client';

import React from 'react';
import { ConsistencyStatsResponse } from '@ascendiaos/shared';
import { Target } from 'lucide-react';

interface ConsistencyStatsCardProps {
  stats: ConsistencyStatsResponse | null;
  loading?: boolean;
}

export function ConsistencyStatsCard({ stats, loading }: ConsistencyStatsCardProps) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-sm p-6 animate-pulse space-y-4">
        <div className="h-4 bg-background rounded-sm w-1/3" />
        <div className="h-12 bg-background rounded-sm w-full" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
            Study Consistency Rate
          </h3>
        </div>
        <span className="text-[10px] text-secondary font-mono">
          Threshold: ≥15 mins/day
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-background border border-border rounded-sm p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>7-Day Consistency</span>
            <span className="text-emerald-400 font-semibold">{stats.activeDays7d} / 7 days</span>
          </div>
          <div className="text-2xl font-bold text-primary">{stats.consistency7d}%</div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-sm overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${stats.consistency7d}%` }}
            />
          </div>
        </div>

        <div className="bg-background border border-border rounded-sm p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>30-Day Consistency</span>
            <span className="text-emerald-400 font-semibold">{stats.activeDays30d} / 30 days</span>
          </div>
          <div className="text-2xl font-bold text-primary">{stats.consistency30d}%</div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-sm overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${stats.consistency30d}%` }}
            />
          </div>
        </div>

        <div className="bg-background border border-border rounded-sm p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>90-Day Consistency</span>
            <span className="text-emerald-400 font-semibold">{stats.activeDays90d} / 90 days</span>
          </div>
          <div className="text-2xl font-bold text-primary">{stats.consistency90d}%</div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-sm overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${stats.consistency90d}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
