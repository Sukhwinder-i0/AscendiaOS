'use client';

import React, { useState } from 'react';
import { CreateExamDto } from '@studyos/shared';
import { X, GraduationCap } from 'lucide-react';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateExamDto) => Promise<void>;
}

export function CreateExamModal({ isOpen, onClose, onSubmit }: CreateExamModalProps) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetScore, setTargetScore] = useState('');
  const [targetRank, setTargetRank] = useState('');
  const [dailyGoalHours, setDailyGoalHours] = useState('4.0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Exam title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        title: title.trim(),
        code: code.trim() || undefined,
        targetDate: targetDate || undefined,
        targetScore: targetScore ? parseFloat(targetScore) : undefined,
        targetRank: targetRank ? parseInt(targetRank, 10) : undefined,
        dailyGoalHours: parseFloat(dailyGoalHours) || 4.0,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-surface w-full max-w-lg rounded-xl border border-border p-6 shadow-elevation space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-primary">Create Learning Goal / Exam</h2>
              <p className="text-xs text-secondary">Add an exam workspace (e.g. GATE DA, UPSC, JEE, AWS)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">Exam Title *</label>
            <input
              type="text"
              placeholder="e.g. GATE DA 2027"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-sm text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">Short Code</label>
              <input
                type="text"
                placeholder="e.g. GATE-DA"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-sm text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">Target Exam Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-sm text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">Target Score</label>
              <input
                type="number"
                placeholder="85"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">Target Rank</label>
              <input
                type="number"
                placeholder="100"
                value={targetRank}
                onChange={(e) => setTargetRank(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1.5">Daily Goal (hrs)</label>
              <input
                type="number"
                step="0.5"
                value={dailyGoalHours}
                onChange={(e) => setDailyGoalHours(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-secondary hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Creating...' : 'Create Exam Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
