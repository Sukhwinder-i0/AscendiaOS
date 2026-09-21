'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, Clock } from 'lucide-react';
import { SubjectAnalyticsItem } from '@studyos/shared';

interface SubjectProgressListProps {
  subjects: SubjectAnalyticsItem[];
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

export const SubjectProgressList: React.FC<SubjectProgressListProps> = ({ subjects }) => {
  if (subjects.length === 0) {
    return (
      <div className="bg-surface p-6 rounded-sm border border-border text-center space-y-2">
        <BookOpen className="w-8 h-8 text-secondary mx-auto" />
        <h4 className="text-sm font-semibold text-primary">No Subjects Found</h4>
        <p className="text-xs text-secondary max-w-sm mx-auto">
          Add subjects to your exam syllabus to track progress per subject.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface p-6 rounded-sm border border-border space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
          <BookOpen className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
          Subject Progress
        </h3>
        <span className="text-xs font-mono text-secondary">
          {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
        </span>
      </div>

      <div className="space-y-4">
        {subjects.map((sub) => (
          <Link
            key={sub.id}
            href={`/subjects/${sub.id}`}
            className="block p-4 bg-background border border-border hover:border-orange-500/40 rounded-sm transition-colors group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: sub.colorHex || '#3B82F6' }}
                />
                <span className="text-sm font-bold text-primary group-hover:text-orange-400 transition-colors">
                  {sub.name}
                </span>
                {sub.code && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-surface border border-border text-secondary rounded-xs">
                    {sub.code}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono text-secondary shrink-0">
                <span>
                  {sub.completedTopicsCount} / {sub.totalTopicsCount} topics
                </span>
                <span className="flex items-center text-primary font-semibold">
                  <Clock className="w-3 h-3 mr-1 text-secondary" />
                  {formatDuration(sub.studyTimeSeconds)}
                </span>
                <span className="text-orange-400 font-bold text-sm">
                  {sub.progressPercentage}%
                </span>
                <ChevronRight className="w-4 h-4 text-secondary group-hover:text-orange-400 transition-colors" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-surface rounded-xs overflow-hidden border border-border">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${sub.progressPercentage}%`,
                  backgroundColor: sub.colorHex || '#3B82F6',
                }}
              />
            </div>

            {sub.lastStudiedAt && (
              <div className="mt-2 text-[10px] font-mono text-secondary flex items-center justify-end">
                <span>Last studied: {sub.lastStudiedAt}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};
