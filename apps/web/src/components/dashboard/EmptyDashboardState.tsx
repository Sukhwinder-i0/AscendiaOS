'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Play, FolderTree } from 'lucide-react';

interface EmptyDashboardStateProps {
  onSelectExam?: (examId: string) => void;
}

export const EmptyDashboardState: React.FC<EmptyDashboardStateProps> = () => {
  return (
    <div className="bg-surface p-8 sm:p-12 rounded-sm border border-dashed border-border text-center space-y-6 max-w-3xl mx-auto my-8">
      <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto text-orange-500">
        <GraduationCap className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
          Your preparation starts here.
        </h2>
        <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto">
          Track your syllabus progress, organize subjects and topics, and build daily study habits in one workspace.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto p-4 bg-background rounded-sm border border-border text-xs font-mono">
        <div>
          <span className="text-xl font-bold text-primary block">0h</span>
          <span className="text-secondary text-[10px] uppercase">Studied</span>
        </div>
        <div>
          <span className="text-xl font-bold text-primary block">0</span>
          <span className="text-secondary text-[10px] uppercase">Topics Done</span>
        </div>
        <div>
          <span className="text-xl font-bold text-primary block">0</span>
          <span className="text-secondary text-[10px] uppercase">Active Days</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/workspace"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98] w-full sm:w-auto justify-center"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Studying</span>
        </Link>
        <Link
          href="/exams"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-background hover:bg-surface border border-border text-primary text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98] w-full sm:w-auto justify-center"
        >
          <FolderTree className="w-4 h-4 text-orange-500" />
          <span>Create Exam Syllabus</span>
        </Link>
      </div>
    </div>
  );
};
