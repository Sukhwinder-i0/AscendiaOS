'use client';

import React, { useState } from 'react';
import { TopicNode, ProgressStatus } from '@studyos/shared';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  CornerDownRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  CircleDot,
} from 'lucide-react';
import { clsx } from 'clsx';

interface TopicRowProps {
  topic: TopicNode;
  depth?: number;
  onUpdateTopic: (topicId: string, name: string) => Promise<void>;
  onDeleteTopic: (topicId: string) => Promise<void>;
  onAddSubtopic: (parentId: string, name: string) => Promise<void>;
  onUpdateStatus: (topicId: string, status: ProgressStatus) => Promise<void>;
}

export function TopicRow({
  topic,
  depth = 0,
  onUpdateTopic,
  onDeleteTopic,
  onAddSubtopic,
  onUpdateStatus,
}: TopicRowProps) {
  const [expanded, setExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(topic.name);
  const [isAddingSubtopic, setIsAddingSubtopic] = useState(false);
  const [newSubtopicName, setNewSubtopicName] = useState('');
  const [loading, setLoading] = useState(false);

  const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;

  const handleSaveEdit = async () => {
    if (!editName.trim() || editName === topic.name) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      await onUpdateTopic(topic.id, editName.trim());
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubtopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtopicName.trim()) return;
    setLoading(true);
    try {
      await onAddSubtopic(topic.id, newSubtopicName.trim());
      setNewSubtopicName('');
      setIsAddingSubtopic(false);
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    [ProgressStatus.NOT_STARTED]: {
      label: 'Not Started',
      bg: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: CircleDot,
    },
    [ProgressStatus.LEARNING]: {
      label: 'Learning',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: Clock,
    },
    [ProgressStatus.COMPLETED]: {
      label: 'Completed',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
    },
    [ProgressStatus.NEEDS_REVISION]: {
      label: 'Needs Revision',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: AlertCircle,
    },
    [ProgressStatus.MASTERED]: {
      label: 'Mastered',
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      icon: Award,
    },
  };

  const currentStatus = statusConfig[topic.progress?.status || ProgressStatus.NOT_STARTED];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="flex flex-col space-y-1">
      <div
        className={clsx(
          'group flex items-center justify-between py-2 px-3 rounded-lg border border-transparent hover:border-slate-800 hover:bg-slate-900/60 transition-all',
          isEditing && 'bg-slate-900 border-indigo-500/50',
        )}
        style={{ paddingLeft: `${Math.max(0.75, depth * 1.5 + 0.75)}rem` }}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {hasSubtopics ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-slate-500 hover:text-slate-300 rounded"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : depth > 0 ? (
            <CornerDownRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          ) : (
            <div className="w-4 h-4" />
          )}

          {isEditing ? (
            <div className="flex items-center space-x-2 flex-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 flex-1"
              />
              <button
                onClick={handleSaveEdit}
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
            <span className="text-sm font-medium text-slate-200 truncate">{topic.name}</span>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center space-x-3 shrink-0">
            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={topic.progress?.status || ProgressStatus.NOT_STARTED}
                onChange={(e) => onUpdateStatus(topic.id, e.target.value as ProgressStatus)}
                className={clsx(
                  'appearance-none text-xs font-semibold px-2.5 py-1 rounded-md border cursor-pointer focus:outline-none transition-colors pr-6',
                  currentStatus.bg,
                )}
              >
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key} className="bg-slate-900 text-slate-200">
                    {config.label}
                  </option>
                ))}
              </select>
              <StatusIcon className="w-3 h-3 absolute right-2 top-1.2 top-2 pointer-events-none opacity-80" />
            </div>

            {/* Quick Actions */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
              <button
                onClick={() => setIsAddingSubtopic(!isAddingSubtopic)}
                title="Add Subtopic"
                className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                title="Edit Topic"
                className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteTopic(topic.id)}
                title="Delete Topic"
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form for adding subtopic */}
      {isAddingSubtopic && (
        <form
          onSubmit={handleCreateSubtopic}
          className="flex items-center space-x-2 my-1 pl-8 pr-3"
          style={{ paddingLeft: `${(depth + 1) * 1.5 + 0.75}rem` }}
        >
          <input
            type="text"
            placeholder="Subtopic name..."
            value={newSubtopicName}
            onChange={(e) => setNewSubtopicName(e.target.value)}
            autoFocus
            className="bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-500"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAddingSubtopic(false)}
            className="px-2 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Recursive Render of Subtopics */}
      {expanded && hasSubtopics && (
        <div className="space-y-0.5">
          {topic.subtopics.map((sub) => (
            <TopicRow
              key={sub.id}
              topic={sub}
              depth={depth + 1}
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
