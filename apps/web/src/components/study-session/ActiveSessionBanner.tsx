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
      <div className="fixed bottom-4 right-4 z-40 bg-gray-900/95 border border-blue-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-center gap-3">
          <span
            className={`w-3 h-3 rounded-full ${
              activeSession.status === 'ACTIVE'
                ? 'bg-green-500 animate-ping'
                : 'bg-amber-500'
            }`}
          />
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {activeSession.status === 'ACTIVE' ? 'Active Session' : 'Paused Session'}
            </div>
            <div className="text-sm font-bold text-white truncate max-w-[180px]">
              {activeSession.topic?.name || 'Study Session'}
            </div>
          </div>
        </div>

        <div className="text-lg font-mono font-bold text-blue-400">
          {formatTimer(elapsed)}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20"
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
