'use client';

import React from 'react';
import Link from 'next/link';
import {
  ListFilter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import {
  ProgressStatus,
  TopicSortBy,
  TopicProgressSummaryItem,
  PaginatedTopicProgressResponse,
} from '@studyos/shared';
import { api } from '@/lib/api';

interface TopicProgressOverviewProps {
  examId?: string;
  timezone?: string;
}

export const TopicProgressOverview: React.FC<TopicProgressOverviewProps> = ({
  examId,
  timezone = 'UTC',
}) => {
  const [selectedStatus, setSelectedStatus] = React.useState<ProgressStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = React.useState<TopicSortBy>('RECENTLY_STUDIED');
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<PaginatedTopicProgressResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchTopics = React.useCallback(() => {
    setLoading(true);
    api
      .getTopicProgressOverview(
        {
          examId,
          status: selectedStatus === 'ALL' ? undefined : (selectedStatus as ProgressStatus),
          sortBy,
          page,
          limit: 8,
        },
        timezone,
      )
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [examId, selectedStatus, sortBy, page, timezone]);

  React.useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const statusFilters: Array<{ label: string; value: ProgressStatus | 'ALL' }> = [
    { label: 'All', value: 'ALL' },
    { label: 'Not Started', value: ProgressStatus.NOT_STARTED },
    { label: 'Learning', value: ProgressStatus.LEARNING },
    { label: 'Completed', value: ProgressStatus.COMPLETED },
    { label: 'Needs Revision', value: ProgressStatus.NEEDS_REVISION },
  ];

  const sortOptions: Array<{ label: string; value: TopicSortBy }> = [
    { label: 'Recently Studied', value: 'RECENTLY_STUDIED' },
    { label: 'Recently Completed', value: 'RECENTLY_COMPLETED' },
    { label: 'Least Studied', value: 'LEAST_STUDIED' },
    { label: 'Most Studied', value: 'MOST_STUDIED' },
    { label: 'Alphabetical', value: 'ALPHABETICAL' },
  ];

  const renderStatusIcon = (status: ProgressStatus) => {
    switch (status) {
      case ProgressStatus.COMPLETED:
      case ProgressStatus.MASTERED:
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case ProgressStatus.LEARNING:
        return <PlayCircle className="w-4 h-4 text-blue-400 shrink-0" />;
      case ProgressStatus.NEEDS_REVISION:
        return <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Circle className="w-4 h-4 text-secondary shrink-0" />;
    }
  };

  return (
    <div className="bg-surface p-6 rounded-sm border border-border space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-semibold font-mono text-secondary uppercase tracking-wider flex items-center">
            <ListFilter className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
            Topic Progress Overview
          </h3>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pills */}
          <div className="flex items-center space-x-1 bg-background p-1 rounded-sm border border-border">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setSelectedStatus(f.value);
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-xs transition-colors ${
                  selectedStatus === f.value
                    ? 'bg-orange-500 text-zinc-950 font-bold'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative inline-flex items-center space-x-1.5 bg-background px-2.5 py-1 rounded-sm border border-border text-xs font-mono text-secondary">
            <ArrowUpDown className="w-3 h-3 text-orange-500" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as TopicSortBy);
                setPage(1);
              }}
              className="bg-transparent text-primary text-xs font-mono focus:outline-none cursor-pointer"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value} className="bg-zinc-900 text-zinc-100">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Topic List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-secondary font-mono">
          Loading topic progress...
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="py-8 text-center text-xs text-secondary font-mono italic">
          No topics matching the selected filter.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.data.map((topic) => (
              <div
                key={topic.id}
                className="p-3 bg-background border border-border hover:border-orange-500/30 rounded-sm flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  {renderStatusIcon(topic.status)}
                  <div className="truncate">
                    <span className="text-primary font-medium block truncate">
                      {topic.name}
                    </span>
                    <span className="text-[10px] font-mono text-secondary block truncate">
                      {topic.subjectName} &bull; {topic.chapterName}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right font-mono text-[10px] text-secondary">
                  <span className="block capitalize font-semibold text-primary">
                    {topic.status.replace('_', ' ').toLowerCase()}
                  </span>
                  {topic.lastStudiedAt && <span>{topic.lastStudiedAt}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
            <span className="text-secondary">
              Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} topics total)
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1 rounded-sm border border-border text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1 rounded-sm border border-border text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
