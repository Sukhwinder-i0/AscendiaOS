'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Layers, Flame, Calendar, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { SubjectDetailAnalyticsResponse } from '@studyos/shared';

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const subjectId = resolvedParams.id;

  const [data, setData] = useState<SubjectDetailAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userTimezone = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    }
    return 'UTC';
  }, []);

  useEffect(() => {
    api
      .getSubjectAnalytics(subjectId, userTimezone)
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load subject analytics'))
      .finally(() => setLoading(false));
  }, [subjectId, userTimezone]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-surface border border-border rounded-sm w-1/4" />
        <div className="h-44 bg-surface border border-border rounded-sm w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="p-6 bg-surface border border-border rounded-sm text-center">
          <p className="text-xs text-rose-400 font-mono">{error || 'Subject not found'}</p>
        </div>
      </div>
    );
  }

  const { subject, sessionsCount, activeDaysCount, chapters } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-secondary hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: subject.colorHex || '#3B82F6' }}
          />
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            {subject.name}
          </h1>
          {subject.code && (
            <span className="text-xs font-mono px-2 py-0.5 bg-surface border border-border text-secondary rounded-xs">
              {subject.code}
            </span>
          )}
        </div>
      </div>

      {/* Main Subject Progress Banner */}
      <div className="bg-surface p-6 sm:p-8 rounded-sm border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-secondary block">
              Subject Progress
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold font-mono text-primary mt-1 block">
              {subject.progressPercentage}%
            </span>
          </div>

          <div className="w-full sm:w-64">
            <div className="flex justify-between text-xs font-mono text-secondary mb-1">
              <span>Completion</span>
              <span>{subject.completedTopicsCount} / {subject.totalTopicsCount} topics</span>
            </div>
            <div className="w-full h-2.5 bg-background rounded-xs overflow-hidden border border-border">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${subject.progressPercentage}%`,
                  backgroundColor: subject.colorHex || '#3B82F6',
                }}
              />
            </div>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs font-mono">
          <div className="p-3 bg-background border border-border rounded-sm space-y-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <BookOpen className="w-3 h-3 mr-1 text-orange-500" /> Topics
            </span>
            <span className="text-base font-bold text-primary">
              {subject.completedTopicsCount} / {subject.totalTopicsCount}
            </span>
          </div>

          <div className="p-3 bg-background border border-border rounded-sm space-y-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <Clock className="w-3 h-3 mr-1 text-blue-400" /> Study Time
            </span>
            <span className="text-base font-bold text-primary">
              {formatDuration(subject.studyTimeSeconds)}
            </span>
          </div>

          <div className="p-3 bg-background border border-border rounded-sm space-y-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <Layers className="w-3 h-3 mr-1 text-purple-400" /> Study Sessions
            </span>
            <span className="text-base font-bold text-primary">
              {sessionsCount}
            </span>
          </div>

          <div className="p-3 bg-background border border-border rounded-sm space-y-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <Flame className="w-3 h-3 mr-1 text-amber-400" /> Active Days
            </span>
            <span className="text-base font-bold text-primary">
              {activeDaysCount}
            </span>
          </div>

          <div className="p-3 bg-background border border-border rounded-sm space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-secondary uppercase flex items-center">
              <Calendar className="w-3 h-3 mr-1 text-emerald-400" /> Last Studied
            </span>
            <span className="text-base font-bold text-primary truncate block">
              {subject.lastStudiedAt || 'Never'}
            </span>
          </div>
        </div>
      </div>

      {/* Chapter Progress Breakdown */}
      <div className="bg-surface p-6 rounded-sm border border-border space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
            Chapter Progress
          </h3>
          <span className="text-xs font-mono text-secondary">
            {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
          </span>
        </div>

        {chapters.length === 0 ? (
          <p className="text-xs text-secondary italic">No chapters in this subject yet.</p>
        ) : (
          <div className="space-y-4">
            {chapters.map((chap) => (
              <div
                key={chap.id}
                className="p-4 bg-background border border-border rounded-sm space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-primary">{chap.name}</span>
                  <div className="flex items-center space-x-3 text-secondary">
                    <span>
                      {chap.completedTopicsCount} / {chap.totalTopicsCount} topics
                    </span>
                    <span className="font-bold text-primary text-sm">
                      {chap.progressPercentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-surface rounded-xs overflow-hidden border border-border">
                  <div
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${chap.progressPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
