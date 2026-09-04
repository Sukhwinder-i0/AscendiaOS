'use client';

import React, { useState } from 'react';
import { SubjectNode as SubjectNodeType, ProgressStatus } from '@studyos/shared';
import { ChapterNode } from './ChapterNode';
import { ChevronRight, ChevronDown, Plus, Trash2, Edit2, Check, X, Layers } from 'lucide-react';

interface SubjectAccordionProps {
  subject: SubjectNodeType;
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

export function SubjectAccordion({
  subject,
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
}: SubjectAccordionProps) {
  const [expanded, setExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(subject.name);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveSubject = async () => {
    if (!editName.trim() || editName === subject.name) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      await onUpdateSubject(subject.id, editName.trim());
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterName.trim()) return;
    setLoading(true);
    try {
      await onAddChapter(subject.id, newChapterName.trim());
      setNewChapterName('');
      setIsAddingChapter(false);
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-5 border border-slate-800 shadow-lg">
      {/* Subject Top Header */}
      <div className="p-4 bg-slate-900/80 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800"
          >
            {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: subject.colorHex || '#3B82F6' }}
          />

          {isEditing ? (
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 flex-1"
              />
              <button
                onClick={handleSaveSubject}
                disabled={loading}
                className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-slate-100">{subject.name}</h3>
              {subject.code && (
                <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-700">
                  {subject.code}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-5">
          {/* Progress Bar */}
          <div className="hidden sm:flex items-center space-x-3 w-48">
            <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${subject.progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold font-mono text-slate-300 w-10 text-right">
              {subject.progressPercentage}%
            </span>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <span>
              {subject.completedTopicsCount}/{subject.totalTopicsCount} completed
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsAddingChapter(!isAddingChapter)}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-500/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Chapter</span>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              title="Edit Subject"
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteSubject(subject.id)}
              title="Delete Subject"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Chapter Form */}
      {isAddingChapter && (
        <form onSubmit={handleCreateChapter} className="p-3 bg-slate-900 border-b border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Chapter title (e.g. Probability)..."
            value={newChapterName}
            onChange={(e) => setNewChapterName(e.target.value)}
            autoFocus
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500"
          >
            Add Chapter
          </button>
          <button
            type="button"
            onClick={() => setIsAddingChapter(false)}
            className="px-2 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Chapter Nodes */}
      {expanded && (
        <div className="p-4 space-y-3 bg-slate-950/40">
          {subject.chapters.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs italic bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
              No chapters in this subject. Click "+ Chapter" to create your first chapter.
            </div>
          ) : (
            subject.chapters.map((chap) => (
              <ChapterNode
                key={chap.id}
                chapter={chap}
                onUpdateChapter={onUpdateChapter}
                onDeleteChapter={onDeleteChapter}
                onAddTopic={onAddTopic}
                onUpdateTopic={onUpdateTopic}
                onDeleteTopic={onDeleteTopic}
                onAddSubtopic={onAddSubtopic}
                onUpdateStatus={onUpdateStatus}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
