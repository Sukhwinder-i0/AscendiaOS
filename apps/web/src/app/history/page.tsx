'use client';

import { useState, useEffect } from 'react';
import { StudySessionResponse } from '@ascendiaos/shared';
import { api } from '@/lib/api';
import { ActiveSessionBanner } from '@/components/study-session/ActiveSessionBanner';

export default function StudyHistoryPage() {
  const [sessions, setSessions] = useState<StudySessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await api.getStudySessions({ status: 'COMPLETED', limit: 50 });
        setSessions(res.data);
      } catch (err) {
        console.error('Failed to load study history', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // Group sessions by day
  const groupedSessions = sessions.reduce((acc, s) => {
    const dateKey = s.endedAt
      ? new Date(s.endedAt).toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'Unknown Date';

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(s);
    return acc;
  }, {} as Record<string, StudySessionResponse[]>);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = (mins / 60).toFixed(1);
      return `${hrs}h`;
    }
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-background text-primary p-6 md:p-10 space-y-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary">Study History</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track your past study sessions, duration, reflections, and confidence progress.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-surface border border-zinc-800 rounded-sm animate-pulse"
              />
            ))}
          </div>
        ) : Object.keys(groupedSessions).length === 0 ? (
          <div className="text-center py-16 bg-surface/50 border border-dashed border-zinc-800 rounded-sm space-y-3">
            <div className="text-3xl">⏱️</div>
            <h3 className="text-sm font-semibold text-zinc-200">No Study Sessions Yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Start a study session from any topic in your syllabus tree to record focused study time.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSessions).map(([dayLabel, daySessions]) => (
              <div key={dayLabel} className="space-y-3">
                <div className="text-[11px] font-mono font-medium text-orange-400 uppercase tracking-wider sticky top-0 bg-background/90 backdrop-blur-sm py-2 z-10">
                  {dayLabel}
                </div>

                <div className="space-y-3">
                  {daySessions.map((s) => (
                    <div
                      key={s.id}
                      className="bg-surface border border-zinc-800 hover:border-orange-500/30 rounded-sm p-5 transition-colors space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-sm text-[10px] font-mono font-medium uppercase">
                              {s.sessionType}
                            </span>
                            <h3 className="text-sm font-bold text-zinc-100">
                              {s.topic?.name || 'Topic Session'}
                            </h3>
                          </div>
                          {s.subject?.name && (
                            <p className="text-xs text-zinc-400 mt-1">
                              {s.exam?.title} • {s.subject.name} • {s.chapter?.name}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-base font-bold text-orange-400 font-mono">
                            {formatDuration(s.durationSeconds)}
                          </div>
                          {s.endedAt && (
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {new Date(s.endedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {s.reflection && (
                        <div className="bg-background border border-zinc-800 rounded-sm p-3 text-xs text-zinc-300 italic">
                          "{s.reflection}"
                        </div>
                      )}

                      {(s.confidence !== null && s.confidence !== undefined) && (
                        <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1 font-mono">
                          <span>Confidence:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={
                                  star <= (s.confidence || 0)
                                    ? 'text-orange-400 font-bold'
                                    : 'text-zinc-700'
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ActiveSessionBanner />
    </div>
  );
}
