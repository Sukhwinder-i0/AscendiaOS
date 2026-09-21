'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, CheckCircle2, Clock } from 'lucide-react';
import { GroupedRecentActivity } from '@studyos/shared';

interface RecentActivityListProps {
  activities: GroupedRecentActivity[];
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="bg-surface p-6 rounded-sm border border-border space-y-3">
        <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
          <Activity className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
          Recent Activity
        </h3>
        <p className="text-xs text-secondary italic">No recent activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface p-6 rounded-sm border border-border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
          <Activity className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
          Recent Activity
        </h3>
      </div>

      <div className="space-y-4">
        {activities.map((group) => (
          <div key={group.date} className="space-y-2">
            <div className="text-xs font-mono font-semibold text-secondary uppercase tracking-wider border-b border-border pb-1">
              {group.label}
            </div>

            <div className="space-y-1.5 pl-1">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1.5 px-2 hover:bg-background rounded-xs text-xs transition-colors group"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    {item.type === 'TOPIC_COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                    )}

                    <div className="truncate">
                      {item.type === 'TOPIC_COMPLETED' ? (
                        <span className="text-emerald-400 font-mono text-[11px] font-semibold mr-1.5">
                          Topic completed —
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] font-semibold text-primary mr-1.5">
                          {formatDuration(item.durationSeconds)} —
                        </span>
                      )}
                      <span className="text-primary font-medium group-hover:text-orange-400 transition-colors">
                        {item.topicName}
                      </span>
                    </div>
                  </div>

                  {item.subjectName && (
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-xs shrink-0 border border-border"
                      style={{
                        backgroundColor: `${item.subjectColorHex || '#3B82F6'}10`,
                        color: item.subjectColorHex || '#3B82F6',
                      }}
                    >
                      {item.subjectName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
