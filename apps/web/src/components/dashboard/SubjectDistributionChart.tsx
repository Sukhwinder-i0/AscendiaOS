'use client';

import React from 'react';
import { PieChart } from 'lucide-react';
import { SubjectDistributionResponse } from '@studyos/shared';

interface SubjectDistributionChartProps {
  distribution: SubjectDistributionResponse;
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

export const SubjectDistributionChart: React.FC<SubjectDistributionChartProps> = ({
  distribution,
}) => {
  if (distribution.items.length === 0 || distribution.totalStudySeconds === 0) {
    return (
      <div className="bg-surface p-6 rounded-sm border border-border space-y-3">
        <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
          <PieChart className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
          Subject Time Distribution
        </h3>
        <p className="text-xs text-secondary italic">
          No study session time logged for this period yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface p-6 rounded-sm border border-border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
          <PieChart className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
          Subject Time Distribution
        </h3>
        <span className="text-xs font-mono text-secondary">
          Last {distribution.periodDays} days — Total {formatDuration(distribution.totalStudySeconds)}
        </span>
      </div>

      {/* Stacked Percentage Bar */}
      <div className="w-full h-3 bg-background rounded-xs overflow-hidden flex border border-border">
        {distribution.items.map((item) => (
          <div
            key={item.subjectId}
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.colorHex || '#3B82F6',
            }}
            title={`${item.subjectName}: ${item.percentage}% (${formatDuration(
              item.studyTimeSeconds,
            )})`}
            className="h-full border-r border-background/20 last:border-r-0 transition-all duration-300"
          />
        ))}
      </div>

      {/* Subject Distribution Items Breakdown */}
      <div className="space-y-2.5 pt-1">
        {distribution.items.map((item) => (
          <div
            key={item.subjectId}
            className="flex items-center justify-between text-xs font-mono"
          >
            <div className="flex items-center space-x-2 truncate pr-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.colorHex || '#3B82F6' }}
              />
              <span className="text-primary truncate">{item.subjectName}</span>
            </div>
            <div className="flex items-center space-x-3 shrink-0 text-secondary">
              <span>{formatDuration(item.studyTimeSeconds)}</span>
              <span className="font-bold text-primary w-10 text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
