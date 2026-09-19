'use client';

import { useState } from 'react';
import { StudySessionResponse } from '@studyos/shared';

interface SessionFinishModalProps {
  session: StudySessionResponse;
  onSave: (data: {
    reflection?: string;
    confidence?: number;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    markTopicCompleted?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

export function SessionFinishModal({
  session,
  onSave,
  onCancel,
}: SessionFinishModalProps) {
  const [reflection, setReflection] = useState('');
  const [confidence, setConfidence] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [markTopicCompleted, setMarkTopicCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const durationMinutes = Math.floor((session.activeDurationSeconds || session.durationSeconds || 0) / 60);
  const durationSeconds = (session.activeDurationSeconds || session.durationSeconds || 0) % 60;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        reflection: reflection.trim() || undefined,
        confidence,
        difficulty,
        markTopicCompleted,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            ✓ Session Complete
          </div>
          <h2 className="text-2xl font-bold text-white">
            {session.topic?.name || 'Study Session'}
          </h2>
          {session.subject?.name && (
            <p className="text-sm text-gray-400">
              {session.exam?.title} • {session.subject.name}
            </p>
          )}

          <div className="pt-3 pb-1">
            <div className="text-4xl font-extrabold text-blue-400 tracking-tight">
              {durationMinutes}m {durationSeconds}s
            </div>
            <p className="text-xs text-gray-500 mt-1">Total Focused Time</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Reflection */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Reflection / Notes (Optional)
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you accomplish during this session?"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Confidence Score */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Confidence Level (1 - 5)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { score: 1, label: 'Very Weak' },
                { score: 2, label: 'Weak' },
                { score: 3, label: 'Moderate' },
                { score: 4, label: 'Strong' },
                { score: 5, label: 'Mastered' },
              ].map(({ score, label }) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setConfidence(score)}
                  className={`py-2 px-1 rounded-xl text-center border transition-all ${
                    confidence === score
                      ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-lg shadow-blue-500/20'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                  }`}
                >
                  <div className="text-base">{score}</div>
                  <div className="text-[10px] truncate opacity-80">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Perceived Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    difficulty === d
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Mark topic completed toggle */}
          <label className="flex items-center gap-3 p-3 bg-gray-800/60 border border-gray-700/60 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors">
            <input
              type="checkbox"
              checked={markTopicCompleted}
              onChange={(e) => setMarkTopicCompleted(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-200">
              Mark topic as <span className="text-green-400 font-semibold">Completed</span>
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            {saving ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
