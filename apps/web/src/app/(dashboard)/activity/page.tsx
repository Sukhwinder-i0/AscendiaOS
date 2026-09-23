'use client';

import React, { useEffect, useState } from 'react';
import { ActivitySummaryResponse, ActivityHeatmapResponse } from '@ascendiaos/shared';
import { api } from '@/lib/api';

import { StreakCard } from '@/components/activity/StreakCard';
import { DailyActivityCard } from '@/components/activity/DailyActivityCard';
import { WeeklyActivity } from '@/components/activity/WeeklyActivity';
import { ConsistencyStatsCard } from '@/components/activity/ConsistencyStatsCard';
import { StudyHeatmap } from '@/components/activity/StudyHeatmap';
import { ActivityHistory } from '@/components/activity/ActivityHistory';

export default function ActivityPage() {
  const [summary, setSummary] = useState<ActivitySummaryResponse | null>(null);
  const [heatmap, setHeatmap] = useState<ActivityHeatmapResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const [sumRes, heatRes] = await Promise.all([
          api.getActivitySummary(userTz),
          api.getActivityHeatmap(undefined, undefined, userTz),
        ]);
        setSummary(sumRes);
        setHeatmap(heatRes);
      } catch (err) {
        console.error('Failed to load activity summary', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-surface p-6 sm:p-8 rounded-sm border border-border">
        <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
          Activity, Streaks & Study Consistency
        </h1>
        <p className="text-secondary text-xs sm:text-sm mt-1 max-w-2xl font-mono">
          Track daily study time, contribution heatmap, streak progression, and active study days calculated strictly from completed study sessions.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StreakCard streak={summary?.streak || null} loading={loading} />
        <DailyActivityCard summary={summary?.today || null} loading={loading} />
      </div>

      {/* Weekly Breakdown & Consistency Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyActivity weekly={summary?.weekly || null} loading={loading} />
        <ConsistencyStatsCard stats={summary?.consistency || null} loading={loading} />
      </div>

      {/* 365-Day Contribution Heatmap */}
      <StudyHeatmap
        days={heatmap?.days || []}
        totalActiveDays={heatmap?.totalActiveDays || 0}
        totalStudySeconds={heatmap?.totalStudySeconds || 0}
        loading={loading}
      />

      {/* Activity History Log */}
      <ActivityHistory />
    </div>
  );
}
