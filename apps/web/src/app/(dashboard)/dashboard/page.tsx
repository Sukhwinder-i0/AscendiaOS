'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ExamResponse } from '@studyos/shared';
import { api } from '@/lib/api';
import {
  GraduationCap,
  FolderTree,
  Flame,
  Clock,
  ArrowRight,
  Plus,
  Target,
} from 'lucide-react';

import { DailySummaryCard } from '@/components/analytics/DailySummaryCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getExams()
      .then((res) => setExams(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeExam = exams.length > 0 ? exams[0] : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-surface p-6 sm:p-8 rounded-sm border border-border relative transition-colors shadow-none">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
              Welcome back, {user?.fullName || 'Student'}
            </h1>
            <p className="text-secondary text-xs sm:text-sm mt-1 max-w-xl">
              Track your syllabus progress, organize subjects and topics, and maintain your learning consistency in one workspace.
            </p>
          </div>

          {activeExam ? (
            <Link
              href={`/workspace/${activeExam.id}/syllabus`}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98] shrink-0"
            >
              <FolderTree className="w-4 h-4" />
              <span>Open Syllabus Editor</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          ) : (
            <Link
              href="/exams"
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Exam</span>
            </Link>
          )}
        </div>
      </div>

      {/* Daily Summary Card */}
      <DailySummaryCard />

      {/* Active Exam Overview */}
      {activeExam ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-6 rounded-sm border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
                Active Goal
              </span>
              <span className="text-xs bg-background text-orange-400 px-2.5 py-0.5 rounded-sm border border-orange-500/20 font-mono">
                {activeExam.code || 'EXAM'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary tracking-tight">{activeExam.title}</h3>
              {activeExam.daysRemaining !== null && (
                <p className="text-xs text-orange-400 mt-1 flex items-center font-mono">
                  <Clock className="w-3.5 h-3.5 mr-1 text-orange-400" />
                  {activeExam.daysRemaining} days remaining until exam
                </p>
              )}
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-secondary font-mono">
              <span>Daily Target:</span>
              <span className="font-semibold text-primary">{activeExam.dailyGoalHours} hours/day</span>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-sm border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
                Syllabus Completion
              </span>
              <Target className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-3xl font-extrabold font-mono text-primary">
                {activeExam.overallProgressPercentage}%
              </p>
              <div className="h-2 w-full bg-background rounded-sm mt-3 overflow-hidden border border-border">
                <div
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${activeExam.overallProgressPercentage}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-secondary font-mono">
              <span>Status:</span>
              <span className="font-semibold text-emerald-400">Active Learning</span>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-sm border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
                Study Consistency
              </span>
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            </div>
            <div>
              <p className="text-3xl font-extrabold font-mono text-primary">0 Days</p>
              <p className="text-xs text-secondary mt-1">Current daily study streak</p>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-secondary font-mono">
              <span>Longest Streak:</span>
              <span className="font-semibold text-primary">0 Days</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface p-8 rounded-sm text-center border border-dashed border-border">
          <GraduationCap className="w-10 h-10 text-orange-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-primary">No Exam Workspace Selected</h3>
          <p className="text-xs text-secondary max-w-md mx-auto mt-1 mb-4">
            Create an exam workspace like GATE DA 2027, UPSC, or JEE to start organizing your syllabus hierarchy.
          </p>
          <Link
            href="/exams"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Exam Workspace</span>
          </Link>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/exams"
          className="bg-surface p-6 rounded-sm border border-border hover:border-orange-500/40 transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <GraduationCap className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-secondary group-hover:text-orange-500 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-primary group-hover:text-orange-400 transition-colors">
            Exams & Learning Goals
          </h3>
          <p className="text-xs text-secondary mt-1">
            Manage your active exams, target scores, exam dates, and create new learning goals.
          </p>
        </Link>

        {activeExam ? (
          <Link
            href={`/workspace/${activeExam.id}/syllabus`}
            className="bg-surface p-6 rounded-sm border border-border hover:border-orange-500/40 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                <FolderTree className="w-5 h-5" />
              </div>
              <ArrowRight className="w-5 h-5 text-secondary group-hover:text-orange-500 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-primary group-hover:text-orange-400 transition-colors">
              Interactive Syllabus Spine
            </h3>
            <p className="text-xs text-secondary mt-1">
              Add, edit, rename, move, and nest subjects, chapters, topics, and subtopics for {activeExam.title}.
            </p>
          </Link>
        ) : (
          <div className="bg-surface p-6 rounded-sm border border-border opacity-60">
            <div className="w-9 h-9 rounded-sm bg-background flex items-center justify-center text-secondary mb-4">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-secondary">Interactive Syllabus Spine</h3>
            <p className="text-xs text-secondary mt-1">
              Create an exam first to unlock the syllabus editor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
