'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ActivityHistoryItemResponse } from '@studyos/shared';
import { api } from '@/lib/api';
import { History, Clock, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export function ActivityHistory() {
  const [history, setHistory] = useState<ActivityHistoryItemResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const res = await api.getActivityHistory({ page, limit: 15, timezone: userTz });
        setHistory(res.data);
        setTotalPages(res.meta.totalPages || 1);
      } catch (err) {
        console.error('Failed to load activity history', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDateGroup = (isoString: string | null) => {
    if (!isoString) return 'Earlier';
    try {
      const date = new Date(isoString);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Earlier';
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
    }
    return `${mins} min`;
  };

  // Group history items by date string
  const groupedHistory: { [group: string]: ActivityHistoryItemResponse[] } = {};
  history.forEach((item) => {
    const groupKey = formatDateGroup(item.endedAt || item.startedAt);
    if (!groupedHistory[groupKey]) {
      groupedHistory[groupKey] = [];
    }
    groupedHistory[groupKey].push(item);
  });

  if (loading && history.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-sm p-6 animate-pulse space-y-4">
        <div className="h-4 bg-background rounded-sm w-1/3" />
        <div className="h-24 bg-background rounded-sm w-full" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-orange-500" />
          <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono">
            Activity History
          </h3>
        </div>
        <span className="text-xs text-secondary font-mono">
          Page {page} of {totalPages}
        </span>
      </div>

      {Object.keys(groupedHistory).length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-sm text-secondary text-xs font-mono">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          No study activity logged yet. Complete study sessions to populate your activity log.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([groupLabel, items]) => (
            <div key={groupLabel} className="space-y-3 font-mono">
              <div className="text-xs font-bold text-orange-400 border-b border-border/60 pb-1 flex items-center justify-between">
                <span>{groupLabel}</span>
                <span className="text-[10px] text-secondary font-normal">
                  {items.length} {items.length === 1 ? 'session' : 'sessions'}
                </span>
              </div>

              <div className="space-y-2">
                {items.map((item) => {
                  const targetUrl = item.examId
                    ? `/workspace/${item.examId}/syllabus`
                    : '/dashboard';

                  return (
                    <Link
                      key={item.id}
                      href={targetUrl}
                      className="flex items-center justify-between p-3 bg-background border border-border rounded-sm hover:border-orange-500/40 transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-secondary w-12 shrink-0">
                          {formatTime(item.endedAt || item.startedAt)}
                        </span>

                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: item.subjectColorHex || '#F97316',
                          }}
                        />

                        <div>
                          <h4 className="text-xs font-semibold text-primary group-hover:text-orange-400 transition-colors">
                            {item.topicName}
                          </h4>
                          <div className="flex items-center space-x-2 text-[10px] text-secondary mt-0.5">
                            {item.subjectName && <span>{item.subjectName}</span>}
                            <span>•</span>
                            <span className="uppercase text-orange-400">
                              {item.sessionType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-xs shrink-0">
                        <span className="font-semibold text-primary bg-zinc-900 border border-border px-2.5 py-1 rounded-sm">
                          {formatDuration(item.durationSeconds)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border font-mono text-xs">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center space-x-1 px-3 py-1.5 bg-background border border-border rounded-sm disabled:opacity-40 hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-secondary">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center space-x-1 px-3 py-1.5 bg-background border border-border rounded-sm disabled:opacity-40 hover:bg-zinc-800 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
