'use client';

import { useState } from 'react';
import { StudySessionResponse } from '@ascendiaos/shared';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-lg w-full p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-sm text-xs font-semibold uppercase tracking-wider font-mono">
            ✓ Session Complete
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {session.topic?.name || 'Study Session'}
          </h2>
          {session.subject?.name && (
            <p className="text-xs text-zinc-400 font-mono">
              {session.exam?.title} • {session.subject.name}
            </p>
          )}

          <div className="pt-3 pb-1">
            <div className="text-4xl font-extrabold font-mono text-orange-400 tracking-tight">
              {durationMinutes}m {durationSeconds}s
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-1">Total Focused Time</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Reflection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono mb-2">
              Reflection / Notes (Optional)
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you accomplish during this session?"
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-sm p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Confidence Score */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono mb-2">
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
                  className={`py-2 px-1 rounded-sm text-center border transition-all font-mono ${
                    confidence === score
                      ? 'bg-orange-600 border-orange-500 text-white font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-base">{score}</div>
                  <div className="text-[9px] truncate opacity-80">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono mb-2">
              Perceived Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono">
              {(['EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 text-xs font-semibold rounded-sm border transition-all ${
                    difficulty === d
                      ? 'bg-orange-600 border-orange-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Mark topic completed toggle */}
          <label className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-sm cursor-pointer hover:bg-zinc-850 transition-colors">
            <input
              type="checkbox"
              checked={markTopicCompleted}
              onChange={(e) => setMarkTopicCompleted(e.target.checked)}
              className="w-4 h-4 rounded-sm border-zinc-700 bg-zinc-900 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-xs font-medium text-zinc-200">
              Mark topic as <span className="text-emerald-400 font-semibold">Completed</span>
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-mono"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold text-xs rounded-sm transition-all uppercase tracking-wider font-mono"
          >
            {saving ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
