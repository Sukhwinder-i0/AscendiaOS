'use client';

import React from 'react';
import { Circle, CheckCircle2, AlertCircle } from 'lucide-react';
import { TopicSummariesResponse } from '@ascendiaos/shared';

interface CompactTopicListsProps {
  topicSummaries: TopicSummariesResponse;
}

export const CompactTopicLists: React.FC<CompactTopicListsProps> = ({
  topicSummaries,
}) => {
  const { notStarted, recentlyCompleted, needsRevision, counts } = topicSummaries;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Unstarted Topics */}
      <div className="bg-surface p-6 rounded-sm border border-border space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
            <Circle className="w-3.5 h-3.5 mr-1.5 text-secondary" />
            Not Started
          </h3>
          <span className="text-xs font-mono font-bold text-secondary">
            {counts.notStarted} topics
          </span>
        </div>

        {notStarted.length === 0 ? (
          <p className="text-xs text-secondary italic py-2">No untouched topics.</p>
        ) : (
          <div className="space-y-1.5">
            {notStarted.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between text-xs py-1.5 px-2 bg-background border border-border rounded-xs"
              >
                <span className="text-primary truncate font-medium">{topic.name}</span>
                <span className="text-[10px] font-mono text-secondary truncate ml-2">
                  {topic.subjectName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Completed Topics */}
      <div className="bg-surface p-6 rounded-sm border border-border space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Recently Completed
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {counts.completed} topics
          </span>
        </div>

        {recentlyCompleted.length === 0 ? (
          <p className="text-xs text-secondary italic py-2">No completed topics yet.</p>
        ) : (
          <div className="space-y-1.5">
            {recentlyCompleted.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between text-xs py-1.5 px-2 bg-background border border-border rounded-xs"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-primary truncate font-medium">{topic.name}</span>
                </div>
                {topic.completedAt && (
                  <span className="text-[10px] font-mono text-secondary shrink-0 ml-2">
                    {topic.completedAt}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Needs Revision Topics */}
      <div className="bg-surface p-6 rounded-sm border border-border space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Needs Revision
          </h3>
          <span className="text-xs font-mono font-bold text-amber-400">
            {counts.needsRevision} topics
          </span>
        </div>

        {needsRevision.length === 0 ? (
          <p className="text-xs text-secondary italic py-2">
            No topics flagged for revision.
          </p>
        ) : (
          <div className="space-y-1.5">
            {needsRevision.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between text-xs py-1.5 px-2 bg-background border border-border rounded-xs"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-primary truncate font-medium">{topic.name}</span>
                </div>
                <span className="text-[10px] font-mono text-secondary truncate ml-2">
                  {topic.subjectName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
