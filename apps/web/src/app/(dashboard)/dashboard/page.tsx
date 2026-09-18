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
      <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border relative transition-colors">
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
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
            >
              <FolderTree className="w-4 h-4" />
              <span>Open Syllabus Editor</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          ) : (
            <Link
              href="/exams"
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Exam</span>
            </Link>
          )}
        </div>
      </div>

      {/* Active Exam Overview */}
      {activeExam ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-6 rounded-xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Active Goal
              </span>
              <span className="text-xs bg-background text-secondary px-2.5 py-0.5 rounded border border-border font-mono">
                {activeExam.code || 'EXAM'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">{activeExam.title}</h3>
              {activeExam.daysRemaining !== null && (
                <p className="text-xs text-amber-500 mt-1 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  {activeExam.daysRemaining} days remaining until exam
                </p>
              )}
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-secondary">
              <span>Daily Target:</span>
              <span className="font-semibold text-primary">{activeExam.dailyGoalHours} hours/day</span>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Syllabus Completion
              </span>
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-3xl font-extrabold font-mono text-primary">
                {activeExam.overallProgressPercentage}%
              </p>
              <div className="h-2 w-full bg-background rounded-full mt-3 overflow-hidden border border-border">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${activeExam.overallProgressPercentage}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-secondary">
              <span>Status:</span>
              <span className="font-semibold text-emerald-500">Active Learning</span>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Study Consistency
              </span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <p className="text-3xl font-extrabold font-mono text-primary">0 Days</p>
              <p className="text-xs text-secondary mt-1">Current daily study streak</p>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-secondary">
              <span>Longest Streak:</span>
              <span className="font-semibold text-primary">0 Days</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface p-8 rounded-xl text-center border border-dashed border-border">
          <GraduationCap className="w-10 h-10 text-blue-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-primary">No Exam Workspace Selected</h3>
          <p className="text-xs text-secondary max-w-md mx-auto mt-1 mb-4">
            Create an exam workspace like GATE DA 2027, UPSC, or JEE to start organizing your syllabus hierarchy.
          </p>
          <Link
            href="/exams"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
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
          className="bg-surface p-6 rounded-xl border border-border hover:border-blue-500/50 transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <GraduationCap className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-secondary group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-primary group-hover:text-blue-500 transition-colors">
            Exams & Learning Goals
          </h3>
          <p className="text-xs text-secondary mt-1">
            Manage your active exams, target scores, exam dates, and create new learning goals.
          </p>
        </Link>

        {activeExam ? (
          <Link
            href={`/workspace/${activeExam.id}/syllabus`}
            className="bg-surface p-6 rounded-xl border border-border hover:border-blue-500/50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <FolderTree className="w-5 h-5" />
              </div>
              <ArrowRight className="w-5 h-5 text-secondary group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-primary group-hover:text-blue-500 transition-colors">
              Interactive Syllabus Spine
            </h3>
            <p className="text-xs text-secondary mt-1">
              Add, edit, rename, move, and nest subjects, chapters, topics, and subtopics for {activeExam.title}.
            </p>
          </Link>
        ) : (
          <div className="bg-surface p-6 rounded-xl border border-border opacity-60">
            <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center text-secondary mb-4">
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
