'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { DashboardAnalyticsResponse, TrendPeriod } from '@studyos/shared';

import { ExamSelector } from '@/components/dashboard/ExamSelector';
import { OverallProgressCard } from '@/components/dashboard/OverallProgressCard';
import { StudyTimeBreakdown } from '@/components/dashboard/StudyTimeBreakdown';
import { SubjectProgressList } from '@/components/dashboard/SubjectProgressList';
import { StudyTrendChart } from '@/components/dashboard/StudyTrendChart';
import { SubjectDistributionChart } from '@/components/dashboard/SubjectDistributionChart';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { TopicProgressOverview } from '@/components/dashboard/TopicProgressOverview';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { CompactTopicLists } from '@/components/dashboard/CompactTopicLists';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { EmptyDashboardState } from '@/components/dashboard/EmptyDashboardState';
import { StudyHeatmap } from '@/components/activity/StudyHeatmap';
import { Flame } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState<string | undefined>(undefined);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('30d');

  const userTimezone = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    }
    return 'UTC';
  }, []);

  const loadDashboard = useCallback(() => {
    setLoading(true);
    api
      .getDashboardAnalytics({
        examId: selectedExamId,
        timezone: userTimezone,
        trendPeriod,
      })
      .then((res) => {
        setData(res);
        if (!selectedExamId && res.exam) {
          setSelectedExamId(res.exam.id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedExamId, userTimezone, trendPeriod]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-surface border border-border rounded-sm w-1/3" />
        <div className="h-44 bg-surface border border-border rounded-sm w-full" />
        <div className="h-32 bg-surface border border-border rounded-sm w-full" />
      </div>
    );
  }

  if (!data || data.isEmpty) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight">
              Progress & Analytics Dashboard
            </h1>
            <p className="text-xs text-secondary mt-0.5">
              Welcome, {user?.fullName || 'Student'}. Track your study progress and consistency.
            </p>
          </div>
          {data?.availableExams && (
            <ExamSelector
              currentExam={data.exam}
              availableExams={data.availableExams}
              onSelectExam={(id) => setSelectedExamId(id)}
            />
          )}
        </div>
        <EmptyDashboardState />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Dashboard Top Header with Exam Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
            Progress & Analytics Dashboard
          </h1>
          <p className="text-xs text-secondary mt-0.5">
            Factual study stats and syllabus preparation overview for {user?.fullName || 'Student'}
          </p>
        </div>

        <ExamSelector
          currentExam={data.exam}
          availableExams={data.availableExams}
          onSelectExam={(id) => setSelectedExamId(id)}
        />
      </div>

      {/* Priority 1: Overall Progress & Primary Action */}
      <OverallProgressCard
        examTitle={data.exam?.title || null}
        overallProgress={data.overallProgress}
        quickActions={data.quickActions}
        daysRemaining={data.exam?.daysRemaining}
      />

      {/* Priority 2: Study Time Breakdown & Streak Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StudyTimeBreakdown studyTime={data.studyTime} />
        </div>

        <div className="bg-surface p-6 rounded-sm border border-border flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
              Study Consistency
            </span>
            <Flame
              className={`w-4 h-4 ${
                data.streak.currentStreak > 0
                  ? 'text-orange-500 fill-orange-500 animate-pulse'
                  : 'text-secondary'
              }`}
            />
          </div>

          <div>
            <p className="text-3xl font-extrabold font-mono text-primary">
              {data.streak.currentStreak} {data.streak.currentStreak === 1 ? 'Day' : 'Days'}
            </p>
            <p className="text-xs text-secondary mt-1">Current daily study streak</p>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-secondary font-mono">
            <span>Longest Streak:</span>
            <span className="font-semibold text-primary">{data.streak.longestStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Priority 3: Quick Actions */}
      <QuickActions
        quickActions={data.quickActions}
        activeExamId={data.exam?.id}
      />

      {/* Priority 4: Subject Progress & Subject Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SubjectProgressList subjects={data.subjects} />
        </div>
        <div>
          <SubjectDistributionChart distribution={data.subjectDistribution} />
        </div>
      </div>

      {/* Priority 5: Study Trend Chart & Activity Heatmap */}
      <StudyTrendChart
        trend={data.studyTrend}
        onPeriodChange={(period) => setTrendPeriod(period)}
      />

      <StudyHeatmap
        days={data.heatmap.days}
        totalActiveDays={data.heatmap.totalActiveDays}
        totalStudySeconds={data.heatmap.totalStudySeconds}
      />

      {/* Priority 6: Weekly & Monthly Summaries with Neutral Comparisons */}
      <SummaryCards
        weeklySummary={data.weeklySummary}
        monthlySummary={data.monthlySummary}
      />

      {/* Priority 7: Recent Activity Timeline */}
      <RecentActivityList activities={data.recentActivity} />

      {/* Priority 8: Topic Progress Overview */}
      <TopicProgressOverview
        examId={data.exam?.id}
        timezone={userTimezone}
      />

      {/* Priority 9: Compact Topic Lists (Not Started, Recently Completed, Needs Revision) */}
      <CompactTopicLists topicSummaries={data.topicSummaries} />
    </div>
  );
}
