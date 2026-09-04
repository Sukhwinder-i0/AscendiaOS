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
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 1 Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Welcome back, {user?.fullName || 'Student'}! 👋
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Track your syllabus progress, organize subjects and topics, and maintain your learning consistency in one workspace.
            </p>
          </div>

          {activeExam ? (
            <Link
              href={`/workspace/${activeExam.id}/syllabus`}
              className="flex items-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-2xl transition-all shadow-xl shadow-indigo-600/25 shrink-0"
            >
              <FolderTree className="w-4 h-4" />
              <span>Open Syllabus Editor</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          ) : (
            <Link
              href="/exams"
              className="flex items-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-2xl transition-all shadow-xl shadow-indigo-600/25 shrink-0"
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
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Goal
              </span>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full font-mono">
                {activeExam.code || 'EXAM'}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">{activeExam.title}</h3>
              {activeExam.daysRemaining !== null && (
                <p className="text-xs text-amber-400 mt-1 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {activeExam.daysRemaining} days remaining until exam
                </p>
              )}
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Daily Target:</span>
              <span className="font-bold text-slate-200">{activeExam.dailyGoalHours} hours/day</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Syllabus Completion
              </span>
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-3xl font-extrabold font-mono text-slate-100">
                {activeExam.overallProgressPercentage}%
              </p>
              <div className="h-2 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${activeExam.overallProgressPercentage}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Status:</span>
              <span className="font-semibold text-emerald-400">Active Learning</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Study Consistency
              </span>
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            </div>
            <div>
              <p className="text-3xl font-extrabold font-mono text-slate-100">0 Days</p>
              <p className="text-xs text-slate-400 mt-1">Current daily study streak</p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Longest Streak:</span>
              <span className="font-bold text-slate-200">0 Days</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 rounded-2xl text-center border border-dashed border-slate-800">
          <GraduationCap className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-200">No Exam Workspace Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Create an exam workspace like GATE DA 2027, UPSC, or JEE to start organizing your syllabus hierarchy.
          </p>
          <Link
            href="/exams"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
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
          className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <GraduationCap className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
            Exams & Learning Goals
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Manage your active exams, target scores, exam dates, and create new learning goals.
          </p>
        </Link>

        {activeExam ? (
          <Link
            href={`/workspace/${activeExam.id}/syllabus`}
            className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <FolderTree className="w-5 h-5" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
              Interactive Syllabus Spine
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add, edit, rename, move, and nest subjects, chapters, topics, and subtopics for {activeExam.title}.
            </p>
          </Link>
        ) : (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 opacity-60">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-300">Interactive Syllabus Spine</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create an exam first to unlock the syllabus editor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
