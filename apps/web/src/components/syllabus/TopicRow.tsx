'use client';

import React, { useState } from 'react';
import { TopicNode, ProgressStatus, StudySessionResponse } from '@studyos/shared';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  CornerDownRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Award,
  CircleDot,
  Bookmark,
  FileText,
  Play,
} from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import { TopicResourcesDrawer } from '../resources/TopicResourcesDrawer';
import { TopicNotesDrawer } from '../notes/TopicNotesDrawer';
import { StudyTimerModal } from '../study-session/StudyTimerModal';

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
      bg: 'bg-background text-secondary border-border',
      icon: CircleDot,
    },
    [ProgressStatus.LEARNING]: {
      label: 'Learning',
      bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      icon: Clock,
    },
    [ProgressStatus.COMPLETED]: {
      label: 'Completed',
      bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      icon: CheckCircle2,
    },
    [ProgressStatus.NEEDS_REVISION]: {
      label: 'Needs Revision',
      bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      icon: AlertCircle,
    },
    [ProgressStatus.MASTERED]: {
      label: 'Mastered',
      bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: Award,
    },
  };

  const currentStatus = statusConfig[topic.progress?.status || ProgressStatus.NOT_STARTED];
  const StatusIcon = currentStatus.icon;

  const [isResourceDrawerOpen, setIsResourceDrawerOpen] = useState(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [activeTimerSession, setActiveTimerSession] = useState<StudySessionResponse | null>(null);

  return (
    <div className="flex flex-col space-y-1">
      {activeTimerSession && (
        <StudyTimerModal
          session={activeTimerSession}
          onClose={() => setActiveTimerSession(null)}
          onSessionUpdated={() => {
            // Refetch progress
            onUpdateStatus(topic.id, topic.progress?.status || ProgressStatus.NOT_STARTED);
          }}
        />
      )}

      <TopicResourcesDrawer
        isOpen={isResourceDrawerOpen}
        onClose={() => setIsResourceDrawerOpen(false)}
        title={topic.name}
        locationType="TOPIC"
        topicId={topic.id}
        chapterId={topic.chapterId}
      />

      <TopicNotesDrawer
        isOpen={isNotesDrawerOpen}
        onClose={() => setIsNotesDrawerOpen(false)}
        title={topic.name}
        topicId={topic.id}
        chapterId={topic.chapterId}
      />

      <div
        className={clsx(
          'group flex items-center justify-between py-2 px-3 rounded-lg border border-transparent hover:border-border hover:bg-background/80 transition-all',
          isEditing && 'bg-surface border-blue-500 shadow-sm',
        )}
        style={{ paddingLeft: `${Math.max(0.75, depth * 1.5 + 0.75)}rem` }}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {hasSubtopics ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-secondary hover:text-primary rounded"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : depth > 0 ? (
            <CornerDownRight className="w-3.5 h-3.5 text-secondary shrink-0" />
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
                className="bg-background border border-border rounded px-2.5 py-1 text-xs text-primary focus:outline-none focus:border-blue-500 flex-1"
              />
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-sm font-medium text-primary truncate">{topic.name}</span>
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
                  <option key={key} value={key} className="bg-surface text-primary">
                    {config.label}
                  </option>
                ))}
              </select>
              <StatusIcon className="w-3 h-3 absolute right-2 top-2 pointer-events-none opacity-80" />
            </div>

            {/* Quick Actions */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
              <button
                onClick={async () => {
                  try {
                    const session = await api.createStudySession({ topicId: topic.id });
                    setActiveTimerSession(session);
                  } catch (err: any) {
                    if (err.data?.activeSession) {
                      setActiveTimerSession(err.data.activeSession);
                    } else {
                      alert(err.message || 'Failed to start study session');
                    }
                  }
                }}
                title="Start Study Session"
                className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsNotesDrawerOpen(true)}
                title="Topic Notes"
                className="p-1 text-secondary hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsResourceDrawerOpen(true)}
                title="Topic Resources"
                className="p-1 text-secondary hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsAddingSubtopic(!isAddingSubtopic)}
                title="Add Subtopic"
                className="p-1 text-secondary hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                title="Edit Topic"
                className="p-1 text-secondary hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteTopic(topic.id)}
                title="Delete Topic"
                className="p-1 text-secondary hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
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
            className="bg-background border border-border rounded-md px-3 py-1.5 text-xs text-primary focus:outline-none focus:border-blue-500 flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAddingSubtopic(false)}
            className="px-2 py-1.5 text-secondary hover:text-primary text-xs"
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
