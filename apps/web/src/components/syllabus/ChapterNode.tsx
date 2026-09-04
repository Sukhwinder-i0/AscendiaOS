'use client';

import React, { useState } from 'react';
import { ChapterNode as ChapterNodeType, ProgressStatus } from '@studyos/shared';
import { TopicRow } from './TopicRow';
import { ChevronRight, ChevronDown, Plus, Trash2, Edit2, Check, X, BookOpen } from 'lucide-react';

interface ChapterNodeProps {
  chapter: ChapterNodeType;
  onUpdateChapter: (chapterId: string, name: string) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onAddTopic: (chapterId: string, name: string) => Promise<void>;
  onUpdateTopic: (topicId: string, name: string) => Promise<void>;
  onDeleteTopic: (topicId: string) => Promise<void>;
  onAddSubtopic: (parentId: string, name: string) => Promise<void>;
  onUpdateStatus: (topicId: string, status: ProgressStatus) => Promise<void>;
}

export function ChapterNode({
  chapter,
  onUpdateChapter,
  onDeleteChapter,
  onAddTopic,
  onUpdateTopic,
  onDeleteTopic,
  onAddSubtopic,
  onUpdateStatus,
}: ChapterNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(chapter.name);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveChapter = async () => {
    if (!editName.trim() || editName === chapter.name) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      await onUpdateChapter(chapter.id, editName.trim());
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    setLoading(true);
    try {
      await onAddTopic(chapter.id, newTopicName.trim());
      setNewTopicName('');
      setIsAddingTopic(false);
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden mb-3">
      {/* Chapter Header */}
      <div className="p-3.5 bg-slate-900/40 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />

          {isEditing ? (
            <div className="flex items-center space-x-2 flex-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 flex-1"
              />
              <button
                onClick={handleSaveChapter}
                disabled={loading}
                className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:bg-slate-800 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="font-semibold text-sm text-slate-200">{chapter.name}</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Progress Bar & Percent */}
          <div className="hidden sm:flex items-center space-x-3 w-40">
            <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${chapter.progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-mono font-medium text-slate-400 w-9 text-right">
              {chapter.progressPercentage}%
            </span>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            {chapter.completedTopicsCount}/{chapter.totalTopicsCount} topics
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsAddingTopic(!isAddingTopic)}
              title="Add Topic"
              className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              title="Edit Chapter"
              className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteChapter(chapter.id)}
              title="Delete Chapter"
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Topic Form */}
      {isAddingTopic && (
        <form onSubmit={handleCreateTopic} className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Topic title (e.g. Bayes Theorem)..."
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            autoFocus
            className="bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-500"
          >
            Add Topic
          </button>
          <button
            type="button"
            onClick={() => setIsAddingTopic(false)}
            className="px-2 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Topic List */}
      {expanded && (
        <div className="p-2 space-y-1">
          {chapter.topics.length === 0 ? (
            <p className="text-xs text-slate-500 italic px-3 py-2">No topics added yet.</p>
          ) : (
            chapter.topics.map((t) => (
              <TopicRow
                key={t.id}
                topic={t}
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
