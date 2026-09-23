'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { StudyTimeBreakdownResponse } from '@ascendiaos/shared';

interface StudyTimeBreakdownProps {
  studyTime: StudyTimeBreakdownResponse;
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

export const StudyTimeBreakdown: React.FC<StudyTimeBreakdownProps> = ({ studyTime }) => {
  const periods = [
    { label: 'Today', value: formatDuration(studyTime.todaySeconds), highlight: true },
    { label: 'This Week', value: formatDuration(studyTime.weekSeconds) },
    { label: 'This Month', value: formatDuration(studyTime.monthSeconds) },
    { label: 'Last 30 Days', value: formatDuration(studyTime.last30DaysSeconds) },
  ];

  return (
    <div className="bg-surface p-6 rounded-sm border border-border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
          Study Time
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {periods.map((p) => (
          <div
            key={p.label}
            className={`p-3.5 rounded-sm border ${
              p.highlight
                ? 'bg-orange-500/5 border-orange-500/30'
                : 'bg-background border-border'
            }`}
          >
            <span className="text-[11px] font-mono text-secondary block uppercase tracking-wider">
              {p.label}
            </span>
            <span
              className={`text-xl sm:text-2xl font-bold font-mono ${
                p.highlight ? 'text-orange-400' : 'text-primary'
              }`}
            >
              {p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
