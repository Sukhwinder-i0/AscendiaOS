'use client';

import React from 'react';
import { Flame, Award, Calendar } from 'lucide-react';
import { StreakResponse } from '@ascendiaos/shared';

interface StreakCardProps {
  streak: StreakResponse | null;
  loading?: boolean;
}

export function StreakCard({ streak, loading }: StreakCardProps) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-sm p-6 animate-pulse space-y-4">
        <div className="h-4 bg-background rounded-sm w-1/3" />
        <div className="h-8 bg-background rounded-sm w-1/2" />
        <div className="h-4 bg-background rounded-sm w-2/3" />
      </div>
    );
  }

  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const totalActiveDays = streak?.totalActiveDays || 0;
  const isTodayActive = streak?.isTodayActive || false;

  return (
    <div className="bg-surface border border-border rounded-sm p-6 space-y-4 relative overflow-hidden transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Flame
            className={`w-5 h-5 ${
              currentStreak > 0
                ? 'text-orange-500 fill-orange-500 animate-pulse'
                : 'text-zinc-600'
            }`}
          />
          <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
            Study Streak & Consistency
          </h3>
        </div>
        {isTodayActive ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            Active Today ✓
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium bg-background text-secondary border border-border font-mono">
            Pending Today
          </span>
        )}
      </div>

      <div className="flex items-baseline space-x-3">
        <span className="text-4xl font-extrabold font-mono text-primary tracking-tight">
          {currentStreak}
        </span>
        <span className="text-sm font-semibold text-secondary font-mono">
          {currentStreak === 1 ? 'day streak' : 'days streak'}
        </span>
      </div>

      <div className="pt-3 border-t border-border grid grid-cols-2 gap-4 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-orange-400 shrink-0" />
          <div>
            <span className="text-secondary text-[11px] block">Longest Streak</span>
            <span className="font-semibold text-primary">{longestStreak} days</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <span className="text-secondary text-[11px] block">Total Study Days</span>
            <span className="font-semibold text-primary">{totalActiveDays} days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
