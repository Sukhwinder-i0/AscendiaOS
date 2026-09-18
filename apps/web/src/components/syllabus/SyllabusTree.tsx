'use client';

import React, { useState } from 'react';
import { SyllabusTreeResponse, ProgressStatus } from '@studyos/shared';
import { SubjectAccordion } from './SubjectAccordion';
import { Plus, CheckCircle2, BookOpen, Layers, Target } from 'lucide-react';
import { SyllabusImportDialog } from '../syllabus-import/SyllabusImportDialog';

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
  const [isImportOpen, setIsImportOpen] = useState(false);
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
      <SyllabusImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        targetExamId={tree.examId}
        onImportSuccess={() => onRefresh()}
      />

      {/* Top Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-secondary font-medium">Overall Progress</p>
            <p className="text-xl font-bold font-mono text-primary">{tree.overallProgressPercentage}%</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-secondary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-secondary font-medium">Subjects</p>
            <p className="text-xl font-bold font-mono text-primary">{tree.totalSubjects}</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-secondary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-secondary font-medium">Chapters</p>
            <p className="text-xl font-bold font-mono text-primary">{tree.totalChapters}</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-secondary font-medium">Topics Completed</p>
            <p className="text-xl font-bold font-mono text-primary">
              {tree.completedTopics} / {tree.totalTopics}
            </p>
          </div>
        </div>
      </div>

      {/* Main Header & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Syllabus Spine</h2>
          <p className="text-xs text-secondary">
            Interactive hierarchy: Subject → Chapter → Topic → Subtopic
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-primary border border-border text-xs font-semibold rounded-lg transition-colors"
          >
            <span>Import PDF Syllabus</span>
          </button>

          <button
            onClick={() => setIsAddingSubject(!isAddingSubject)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Add Subject Form */}
      {isAddingSubject && (
        <form onSubmit={handleCreateSubject} className="bg-surface p-4 rounded-xl border border-border space-y-3">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">New Subject</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              placeholder="Subject name (e.g. Machine Learning)..."
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              autoFocus
              className="bg-background border border-border rounded-lg px-3.5 py-2 text-sm text-primary focus:outline-none focus:border-blue-500 flex-1"
            />

            {/* Color Palette Selector */}
            <div className="flex items-center space-x-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewSubjectColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${newSubjectColor === c ? 'scale-125 ring-2 ring-blue-500 ring-offset-2' : 'opacity-70 hover:opacity-100'
                    }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Create Subject
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSubject(false)}
                className="px-3 py-2 text-secondary hover:text-primary text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Subject Tree */}
      {tree.subjects.length === 0 ? (
        <div className="bg-surface p-12 rounded-xl text-center border border-dashed border-border">
          <h3 className="text-base font-bold text-primary">Your Syllabus is Empty</h3>
          <p className="text-xs text-secondary mt-1 mb-4">
            Start building your exam syllabus by adding your first subject.
          </p>
          <button
            onClick={() => setIsAddingSubject(true)}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
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
