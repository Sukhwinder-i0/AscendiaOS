'use client';

import { useState, useEffect, useRef } from 'react';
import { StudySessionResponse } from '@studyos/shared';
import { api } from '@/lib/api';
import { SessionFinishModal } from './SessionFinishModal';

interface StudyTimerModalProps {
  session: StudySessionResponse;
  onClose: () => void;
  onSessionUpdated: () => void;
}

export function StudyTimerModal({
  session: initialSession,
  onClose,
  onSessionUpdated,
}: StudyTimerModalProps) {
  const [session, setSession] = useState<StudySessionResponse>(initialSession);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(
    initialSession.activeDurationSeconds || 0,
  );
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Timer interval hook
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (session.status === 'ACTIVE') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session.status]);

  // Recalculate elapsed seconds if session updates
  useEffect(() => {
    if (session.activeDurationSeconds !== undefined) {
      setElapsedSeconds(session.activeDurationSeconds);
    }
  }, [session.updatedAt, session.activeDurationSeconds]);

  const handleStart = async () => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.startStudySession(session.id);
      setSession(res);
      onSessionUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start session');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.pauseStudySession(session.id);
      setSession(res);
      onSessionUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to pause session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.resumeStudySession(session.id);
      setSession(res);
      onSessionUpdated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resume session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishSave = async (data: {
    reflection?: string;
    confidence?: number;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    markTopicCompleted?: boolean;
  }) => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      await api.finishStudySession(session.id, data);
      onSessionUpdated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to finish session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDiscard = async () => {
    if (!confirm('Are you sure you want to discard this study session?')) return;
    setActionLoading(true);
    try {
      await api.discardStudySession(session.id);
      onSessionUpdated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to discard session');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-8 text-center relative overflow-hidden">
          {/* Header & Context */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-blue-400">
                {session.sessionType} SESSION
              </span>
              <button
                onClick={onClose}
                className="hover:text-white transition-colors"
                title="Minimize timer"
              >
                ✕ Minimize
              </button>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              {session.topic?.name || 'Study Session'}
            </h1>
            {session.subject?.name && (
              <p className="text-sm text-gray-400">
                {session.subject.name} • {session.chapter?.name}
              </p>
            )}
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Big Timer Counter */}
          <div className="py-6 space-y-3">
            <div className="text-6xl font-black font-mono tracking-wider text-white drop-shadow-lg">
              {formatTimer(elapsedSeconds)}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  session.status === 'ACTIVE'
                    ? 'bg-green-500 animate-pulse'
                    : session.status === 'PAUSED'
                    ? 'bg-amber-500'
                    : 'bg-gray-500'
                }`}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {session.status}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {session.status === 'CREATED' && (
              <button
                onClick={handleStart}
                disabled={actionLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-blue-600/25"
              >
                {actionLoading ? 'Starting...' : 'Start Timer'}
              </button>
            )}

            {session.status === 'ACTIVE' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="py-3.5 bg-gray-800 hover:bg-gray-700 text-amber-400 border border-amber-500/30 font-semibold text-sm rounded-2xl transition-all"
                >
                  ⏸ Pause
                </button>
                <button
                  onClick={() => setShowFinishModal(true)}
                  disabled={actionLoading}
                  className="py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-green-600/20"
                >
                  ✓ Finish Session
                </button>
              </div>
            )}

            {session.status === 'PAUSED' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-blue-600/20"
                >
                  ▶ Resume
                </button>
                <button
                  onClick={() => setShowFinishModal(true)}
                  disabled={actionLoading}
                  className="py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-green-600/20"
                >
                  ✓ Finish Session
                </button>
              </div>
            )}

            <button
              onClick={handleDiscard}
              disabled={actionLoading}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors pt-2"
            >
              Discard Session
            </button>
          </div>
        </div>
      </div>

      {showFinishModal && (
        <SessionFinishModal
          session={session}
          onSave={handleFinishSave}
          onCancel={() => setShowFinishModal(false)}
        />
      )}
    </>
  );
}
