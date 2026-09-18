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
    <div className="bg-white rounded-xl overflow-hidden mb-4 border border-slate-200">
      {/* Subject Top Header */}
      <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
          >
            {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-200"
            style={{ backgroundColor: subject.colorHex || '#3B82F6' }}
          />

          {isEditing ? (
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 flex-1"
              />
              <button
                onClick={handleSaveSubject}
                disabled={loading}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-slate-900">{subject.name}</h3>
              {subject.code && (
                <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded border border-slate-200">
                  {subject.code}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-5">
          {/* Progress Bar */}
          <div className="hidden sm:flex items-center space-x-3 w-48">
            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${subject.progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-semibold font-mono text-slate-700 w-10 text-right">
              {subject.progressPercentage}%
            </span>
          </div>

          <div className="text-xs text-slate-500 font-mono flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <span>
              {subject.completedTopicsCount}/{subject.totalTopicsCount} completed
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsAddingChapter(!isAddingChapter)}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Chapter</span>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              title="Edit Subject"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteSubject(subject.id)}
              title="Delete Subject"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Chapter Form */}
      {isAddingChapter && (
        <form onSubmit={handleCreateChapter} className="p-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Chapter title (e.g. Probability)..."
            value={newChapterName}
            onChange={(e) => setNewChapterName(e.target.value)}
            autoFocus
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Add Chapter
          </button>
          <button
            type="button"
            onClick={() => setIsAddingChapter(false)}
            className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-xs"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Chapter Nodes */}
      {expanded && (
        <div className="p-4 space-y-3 bg-slate-50/50">
          {subject.chapters.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs italic bg-white rounded-lg border border-dashed border-slate-300">
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
