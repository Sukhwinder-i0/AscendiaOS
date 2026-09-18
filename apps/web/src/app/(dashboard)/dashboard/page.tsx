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
  Sparkles,
  Target,
  BookOpen,
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
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Phase 1 Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.fullName || 'Student'}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
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
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Goal
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded border border-slate-200 font-mono">
                {activeExam.code || 'EXAM'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{activeExam.title}</h3>
              {activeExam.daysRemaining !== null && (
                <p className="text-xs text-amber-700 mt-1 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  {activeExam.daysRemaining} days remaining until exam
                </p>
              )}
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Daily Target:</span>
              <span className="font-semibold text-slate-800">{activeExam.dailyGoalHours} hours/day</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Syllabus Completion
              </span>
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-extrabold font-mono text-slate-900">
                {activeExam.overallProgressPercentage}%
              </p>
              <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${activeExam.overallProgressPercentage}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Status:</span>
              <span className="font-semibold text-emerald-600">Active Learning</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Study Consistency
              </span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <p className="text-3xl font-extrabold font-mono text-slate-900">0 Days</p>
              <p className="text-xs text-slate-500 mt-1">Current daily study streak</p>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Longest Streak:</span>
              <span className="font-semibold text-slate-800">0 Days</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl text-center border border-dashed border-slate-300">
          <GraduationCap className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Exam Workspace Selected</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
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
          className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            Exams & Learning Goals
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Manage your active exams, target scores, exam dates, and create new learning goals.
          </p>
        </Link>

        {activeExam ? (
          <Link
            href={`/workspace/${activeExam.id}/syllabus`}
            className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <FolderTree className="w-5 h-5" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Interactive Syllabus Spine
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add, edit, rename, move, and nest subjects, chapters, topics, and subtopics for {activeExam.title}.
            </p>
          </Link>
        ) : (
          <div className="bg-white p-6 rounded-xl border border-slate-200 opacity-60">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-700">Interactive Syllabus Spine</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create an exam first to unlock the syllabus editor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
