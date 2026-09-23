'use client';

import React from 'react';
import { Calendar, Clock, CheckCircle2, Flame, Layers } from 'lucide-react';
import { SummaryPeriodMetric } from '@ascendiaos/shared';

interface SummaryCardsProps {
  weeklySummary: SummaryPeriodMetric;
  monthlySummary: SummaryPeriodMetric;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  weeklySummary,
  monthlySummary,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Weekly Summary */}
      <div className="bg-surface p-6 rounded-sm border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
            This Week Summary
          </h3>
          <span className="text-xs font-mono font-bold text-orange-400">
            {formatDuration(weeklySummary.studySeconds)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-background border border-border rounded-sm space-y-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <Flame className="w-3 h-3 mr-1 text-orange-500" /> Active Days
            </span>
            <span className="text-base font-bold text-primary">
              {weeklySummary.activeDays} / {weeklySummary.totalDays}
            </span>
          </div>

          <div className="p-3 bg-background border border-border rounded-sm space-y-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Topics Completed
            </span>
            <span className="text-base font-bold text-primary">
              {weeklySummary.topicsCompleted}
            </span>
          </div>

          <div className="p-3 bg-background border border-border rounded-sm space-y-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <Layers className="w-3 h-3 mr-1 text-blue-400" /> Sessions
            </span>
            <span className="text-base font-bold text-primary">
              {weeklySummary.sessionsCount}
            </span>
          </div>

          <div className="p-3 bg-background border border-border rounded-sm space-y-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <Clock className="w-3 h-3 mr-1 text-purple-400" /> Avg / Active Day
            </span>
            <span className="text-base font-bold text-primary">
              {formatDuration(weeklySummary.averageStudySecondsPerActiveDay)}
            </span>
          </div>
        </div>

        {weeklySummary.comparisonWithPrevious && (
          <div className="pt-2 border-t border-border text-[11px] font-mono text-secondary">
            {weeklySummary.comparisonWithPrevious.text}
          </div>
        )}
      </div>

      {/* Monthly Summary */}
      <div className="bg-surface p-6 rounded-sm border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
            This Month Summary
          </h3>
          <span className="text-xs font-mono font-bold text-orange-400">
            {formatDuration(monthlySummary.studySeconds)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-background border border-border rounded-sm space-y-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <Flame className="w-3 h-3 mr-1 text-orange-500" /> Active Days
            </span>
            <span className="text-base font-bold text-primary">
              {monthlySummary.activeDays} / {monthlySummary.totalDays}
            </span>
          </div>

          <div className="p-3 bg-background border border-border rounded-sm space-y-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Topics Completed
            </span>
            <span className="text-base font-bold text-primary">
              {monthlySummary.topicsCompleted}
            </span>
          </div>

          <div className="p-3 bg-background border border-border rounded-sm space-y-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <Layers className="w-3 h-3 mr-1 text-blue-400" /> Sessions
            </span>
            <span className="text-base font-bold text-primary">
              {monthlySummary.sessionsCount}
            </span>
          </div>

          <div className="p-3 bg-background border border-border rounded-sm space-y-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <Clock className="w-3 h-3 mr-1 text-purple-400" /> Avg / Active Day
            </span>
            <span className="text-base font-bold text-primary">
              {formatDuration(monthlySummary.averageStudySecondsPerActiveDay)}
            </span>
          </div>
        </div>

        {monthlySummary.comparisonWithPrevious && (
          <div className="pt-2 border-t border-border text-[11px] font-mono text-secondary">
            {monthlySummary.comparisonWithPrevious.text}
          </div>
        )}
      </div>
    </div>
  );
};
