'use client';

import React from 'react';
import Link from 'next/link';
import { Info, Play, ArrowRight } from 'lucide-react';
import { OverallProgressResponse, QuickActionsContextResponse } from '@studyos/shared';

interface OverallProgressCardProps {
  examTitle: string | null;
  overallProgress: OverallProgressResponse;
  quickActions: QuickActionsContextResponse;
  daysRemaining?: number | null;
}

export const OverallProgressCard: React.FC<OverallProgressCardProps> = ({
  examTitle,
  overallProgress,
  quickActions,
  daysRemaining,
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="bg-surface p-6 sm:p-8 rounded-sm border border-border relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-secondary">
              {examTitle ? `${examTitle} — Overall Preparation` : 'Overall Preparation'}
            </span>

            <div className="relative inline-block">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-secondary hover:text-primary transition-colors focus:outline-none"
                aria-label="Progress calculation methodology"
              >
                <Info className="w-3.5 h-3.5" />
              </button>

              {showTooltip && (
                <div className="absolute left-0 mt-2 w-64 p-3 bg-zinc-900 text-zinc-200 border border-zinc-700 text-xs rounded-sm shadow-xl z-30 font-mono space-y-1">
                  <p className="font-semibold text-orange-400">Canonical Calculation:</p>
                  <p className="text-[11px] text-zinc-300">{overallProgress.methodology}</p>
                  <p className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
                    Topics marked Completed or Mastered count towards total completion.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-baseline space-x-4">
            <span className="text-4xl sm:text-5xl font-extrabold font-mono text-primary tracking-tight">
              {overallProgress.percentage}%
            </span>
            <span className="text-sm font-mono text-secondary">
              {overallProgress.completedTopics} / {overallProgress.totalTopics} topics completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xl h-2 bg-background rounded-sm overflow-hidden border border-border">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${overallProgress.percentage}%` }}
            />
          </div>

          {daysRemaining !== undefined && daysRemaining !== null && (
            <p className="text-xs font-mono text-orange-400 pt-1">
              ⏱ {daysRemaining} days remaining until exam
            </p>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col items-start md:items-end justify-center shrink-0 border-t md:border-t-0 border-border pt-4 md:pt-0">
          {quickActions.activeSessionId ? (
            <Link
              href={`/workspace/session/${quickActions.activeSessionId}`}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-sm font-semibold rounded-sm transition-all duration-150 active:scale-[0.98] shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Active Session</span>
            </Link>
          ) : quickActions.lastStudiedTopic ? (
            <div className="space-y-1.5 text-left md:text-right">
              <span className="text-[11px] font-mono text-secondary block">
                Last Studied: <strong className="text-primary">{quickActions.lastStudiedTopic.name}</strong>
              </span>
              <Link
                href="/workspace"
                className="inline-flex items-center space-x-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-sm font-semibold rounded-sm transition-all duration-150 active:scale-[0.98] shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Continue Studying</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ) : (
            <Link
              href="/workspace"
              className="inline-flex items-center space-x-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-sm font-semibold rounded-sm transition-all duration-150 active:scale-[0.98] shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Studying</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
