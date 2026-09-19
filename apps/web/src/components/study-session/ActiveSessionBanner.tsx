'use client';

import { useState, useEffect } from 'react';
import { StudySessionResponse } from '@studyos/shared';
import { api } from '@/lib/api';
import { StudyTimerModal } from './StudyTimerModal';

export function ActiveSessionBanner() {
  const [activeSession, setActiveSession] = useState<StudySessionResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const fetchActive = async () => {
    try {
      const res = await api.getActiveStudySession();
      setActiveSession(res);
      if (res?.activeDurationSeconds !== undefined) {
        setElapsed(res.activeDurationSeconds);
      }
    } catch {
      // Ignore network errors on polling
    }
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 10000); // Poll active session state every 10s
    return () => clearInterval(interval);
  }, []);

  // Local timer tick
  useEffect(() => {
    let tick: NodeJS.Timeout | null = null;
    if (activeSession && activeSession.status === 'ACTIVE') {
      tick = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    }
    return () => {
      if (tick) clearInterval(tick);
    };
  }, [activeSession?.status]);

  if (!activeSession) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 bg-zinc-900/95 border border-orange-500/40 rounded-sm p-4 backdrop-blur-md flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-center gap-3">
          <span
            className={`w-3 h-3 rounded-full ${
              activeSession.status === 'ACTIVE'
                ? 'bg-emerald-500 animate-ping'
                : 'bg-amber-500'
            }`}
          />
          <div>
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              {activeSession.status === 'ACTIVE' ? 'Active Session' : 'Paused Session'}
            </div>
            <div className="text-xs font-bold text-white truncate max-w-[180px]">
              {activeSession.topic?.name || 'Study Session'}
            </div>
          </div>
        </div>

        <div className="text-base font-mono font-bold text-orange-400">
          {formatTimer(elapsed)}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-sm transition-all"
        >
          Open Timer
        </button>
      </div>

      {showModal && (
        <StudyTimerModal
          session={activeSession}
          onClose={() => setShowModal(false)}
          onSessionUpdated={fetchActive}
        />
      )}
    </>
  );
}
