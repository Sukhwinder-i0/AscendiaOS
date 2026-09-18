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
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-2.5">
      {/* Chapter Header */}
      <div className="p-3 bg-slate-50/70 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center space-x-3 flex-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />

          {isEditing ? (
            <div className="flex items-center space-x-2 flex-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-500 flex-1"
              />
              <button
                onClick={handleSaveChapter}
                disabled={loading}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="font-semibold text-xs text-slate-900">{chapter.name}</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Progress Bar & Percent */}
          <div className="hidden sm:flex items-center space-x-3 w-40">
            <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${chapter.progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700 w-9 text-right">
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
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              title="Edit Chapter"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteChapter(chapter.id)}
              title="Delete Chapter"
              className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Topic Form */}
      {isAddingTopic && (
        <form onSubmit={handleCreateTopic} className="p-3 bg-slate-50 border-b border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Topic title (e.g. Bayes Theorem)..."
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            autoFocus
            className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Add Topic
          </button>
          <button
            type="button"
            onClick={() => setIsAddingTopic(false)}
            className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-xs"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Topic List */}
      {expanded && (
        <div className="p-2 space-y-1">
          {chapter.topics.length === 0 ? (
            <p className="text-xs text-slate-400 italic px-3 py-2">No topics added yet.</p>
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
