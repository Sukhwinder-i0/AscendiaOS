'use client';

import React, { useState } from 'react';
import { SyllabusTreeResponse, ProgressStatus } from '@studyos/shared';
import { SubjectAccordion } from './SubjectAccordion';
import { Plus, CheckCircle2, BookOpen, Layers, Target, Sparkles } from 'lucide-react';

interface SyllabusTreeProps {
  tree: SyllabusTreeResponse;
  onRefresh: () => Promise<void>;
  onAddSubject: (name: string, colorHex?: string) => Promise<void>;
  onUpdateSubject: (subjectId: string, name: string, colorHex?: string) => Promise<void>;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  onAddChapter: (subjectId: string, name: string) => Promise<void>;
  onUpdateChapter: (chapterId: string, name: string) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onAddTopic: (chapterId: string, name: string) => Promise<void>;
  onUpdateTopic: (topicId: string, name: string) => Promise<void>;
  onDeleteTopic: (topicId: string) => Promise<void>;
  onAddSubtopic: (parentId: string, name: string) => Promise<void>;
  onUpdateStatus: (topicId: string, status: ProgressStatus) => Promise<void>;
}

export function SyllabusTree({
  tree,
  onRefresh,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onAddChapter,
  onUpdateChapter,
  onDeleteChapter,
  onAddTopic,
  onUpdateTopic,
  onDeleteTopic,
  onAddSubtopic,
  onUpdateStatus,
}: SyllabusTreeProps) {
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#6366F1');
  const [loading, setLoading] = useState(false);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    setLoading(true);
    try {
      await onAddSubject(newSubjectName.trim(), newSubjectColor);
      setNewSubjectName('');
      setIsAddingSubject(false);
    } finally {
      setLoading(false);
    }
  };

  const presetColors = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Top Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Overall Progress</p>
            <p className="text-xl font-bold font-mono text-slate-100">{tree.overallProgressPercentage}%</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Subjects</p>
            <p className="text-xl font-bold font-mono text-slate-100">{tree.totalSubjects}</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Chapters</p>
            <p className="text-xl font-bold font-mono text-slate-100">{tree.totalChapters}</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Topics Completed</p>
            <p className="text-xl font-bold font-mono text-slate-100">
              {tree.completedTopics} / {tree.totalTopics}
            </p>
          </div>
        </div>
      </div>

      {/* Main Header & Add Subject Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Syllabus Spine</h2>
          <p className="text-xs text-slate-400">
            Interactive hierarchy: Subject → Chapter → Topic → Subtopic
          </p>
        </div>

        <button
          onClick={() => setIsAddingSubject(!isAddingSubject)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Add Subject Modal / Inline Form */}
      {isAddingSubject && (
        <form onSubmit={handleCreateSubject} className="glass-card p-4 rounded-2xl border border-indigo-500/30 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">New Subject</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              placeholder="Subject name (e.g. Machine Learning)..."
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              autoFocus
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 flex-1"
            />

            {/* Color Palette Selector */}
            <div className="flex items-center space-x-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewSubjectColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    newSubjectColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500"
              >
                Create Subject
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSubject(false)}
                className="px-3 py-2 text-slate-400 hover:text-slate-200 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Subject Tree */}
      {tree.subjects.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center border border-dashed border-slate-800">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">Your Syllabus is Empty</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Start building your exam syllabus by adding your first subject.
          </p>
          <button
            onClick={() => setIsAddingSubject(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500"
          >
            + Create First Subject
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tree.subjects.map((sub) => (
            <SubjectAccordion
              key={sub.id}
              subject={sub}
              onUpdateSubject={onUpdateSubject}
              onDeleteSubject={onDeleteSubject}
              onAddChapter={onAddChapter}
              onUpdateChapter={onUpdateChapter}
              onDeleteChapter={onDeleteChapter}
              onAddTopic={onAddTopic}
              onUpdateTopic={onUpdateTopic}
              onDeleteTopic={onDeleteTopic}
              onAddSubtopic={onAddSubtopic}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
