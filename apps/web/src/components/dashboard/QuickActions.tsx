'use client';

import React from 'react';
import Link from 'next/link';
import { Play, FolderTree, FilePlus, BookmarkPlus } from 'lucide-react';
import { QuickActionsContextResponse } from '@ascendiaos/shared';

interface QuickActionsProps {
  quickActions: QuickActionsContextResponse;
  activeExamId?: string | null;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  quickActions,
  activeExamId,
}) => {
  const syllabusLink = activeExamId
    ? `/workspace/${activeExamId}/syllabus`
    : '/exams';

  return (
    <div className="bg-surface p-6 rounded-sm border border-border space-y-4">
      <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Continue / Resume Studying */}
        {quickActions.activeSessionId ? (
          <Link
            href={`/workspace/session/${quickActions.activeSessionId}`}
            className="flex flex-col items-center justify-center p-4 bg-orange-500 hover:bg-orange-600 text-zinc-950 rounded-sm transition-all duration-150 active:scale-[0.98] group text-center space-y-2 font-semibold"
          >
            <Play className="w-5 h-5 fill-current" />
            <span className="text-xs">Resume Session</span>
          </Link>
        ) : (
          <Link
            href="/workspace"
            className="flex flex-col items-center justify-center p-4 bg-orange-500 hover:bg-orange-600 text-zinc-950 rounded-sm transition-all duration-150 active:scale-[0.98] group text-center space-y-2 font-semibold"
          >
            <Play className="w-5 h-5 fill-current" />
            <span className="text-xs">Continue Studying</span>
          </Link>
        )}

        {/* View Syllabus */}
        <Link
          href={syllabusLink}
          className="flex flex-col items-center justify-center p-4 bg-background hover:bg-surface border border-border hover:border-orange-500/40 text-primary rounded-sm transition-all duration-150 active:scale-[0.98] group text-center space-y-2"
        >
          <FolderTree className="w-5 h-5 text-orange-500 group-hover:scale-105 transition-transform" />
          <span className="text-xs font-medium">View Syllabus</span>
        </Link>

        {/* Add Resource */}
        <Link
          href="/resources"
          className="flex flex-col items-center justify-center p-4 bg-background hover:bg-surface border border-border hover:border-orange-500/40 text-primary rounded-sm transition-all duration-150 active:scale-[0.98] group text-center space-y-2"
        >
          <BookmarkPlus className="w-5 h-5 text-blue-400 group-hover:scale-105 transition-transform" />
          <span className="text-xs font-medium">Add Resource</span>
        </Link>

        {/* New Note */}
        <Link
          href="/notes"
          className="flex flex-col items-center justify-center p-4 bg-background hover:bg-surface border border-border hover:border-orange-500/40 text-primary rounded-sm transition-all duration-150 active:scale-[0.98] group text-center space-y-2"
        >
          <FilePlus className="w-5 h-5 text-purple-400 group-hover:scale-105 transition-transform" />
          <span className="text-xs font-medium">New Note</span>
        </Link>
      </div>
    </div>
  );
};
