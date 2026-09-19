'use client';

import React, { useState } from 'react';
import { NoteResponse } from '@studyos/shared';
import { Pin, Archive, Trash2, FolderTree, FileText, Clock, ExternalLink, Paperclip } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';
import Link from 'next/link';

interface NoteCardProps {
  note: NoteResponse;
  onUpdate?: (updated: NoteResponse) => void;
  onDelete?: (id: string) => void;
  onMove?: (note: NoteResponse) => void;
}

export function NoteCard({ note, onUpdate, onDelete, onMove }: NoteCardProps) {
  const [loading, setLoading] = useState(false);

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      const updated = note.isPinned
        ? await api.unpinNote(note.id)
        : await api.pinNote(note.id);
      if (onUpdate) onUpdate(updated);
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      const updated = note.isArchived
        ? await api.unarchiveNote(note.id)
        : await api.archiveNote(note.id);
      if (onUpdate) onUpdate(updated);
    } catch (err) {
      console.error('Failed to toggle archive:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete note "${note.title}"?`)) return;
    try {
      setLoading(true);
      await api.deleteNote(note.id);
      if (onDelete) onDelete(note.id);
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLocationBreadcrumb = () => {
    const parts = [
      note.exam?.title,
      note.subject?.name,
      note.chapter?.name,
      note.topic?.name,
    ].filter(Boolean);

    if (parts.length === 0) {
      return (
        <span className="text-[11px] text-secondary">General Note</span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1 text-[11px] text-secondary truncate max-w-full">
        <FolderTree className="w-3 h-3 text-blue-500 shrink-0" />
        <span className="truncate">{parts.join(' / ')}</span>
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link
      href={`/notes/${note.id}`}
      className={clsx(
        'group relative bg-surface rounded-xl border border-border p-4 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-3',
        note.isPinned && 'border-amber-500/30 bg-amber-500/5',
        note.isArchived && 'opacity-70 bg-slate-500/5'
      )}
    >
      {/* Top Bar: Title & Actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-primary hover:text-blue-500 truncate transition-colors">
            {note.title}
          </h3>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={handleTogglePin}
            disabled={loading}
            title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
            className={clsx(
              'p-1.5 rounded-lg border transition-colors',
              note.isPinned
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : 'text-secondary border-border hover:text-amber-500 hover:bg-amber-500/10'
            )}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleToggleArchive}
            disabled={loading}
            title={note.isArchived ? 'Unarchive Note' : 'Archive Note'}
            className={clsx(
              'p-1.5 rounded-lg border transition-colors',
              note.isArchived
                ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                : 'text-secondary border-border hover:text-purple-500 hover:bg-purple-500/10'
            )}
          >
            <Archive className="w-3.5 h-3.5" />
          </button>

          {onMove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMove(note);
              }}
              title="Move Note Location"
              className="p-1.5 text-secondary border border-border hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
            >
              <FolderTree className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={loading}
              title="Delete Note"
              className="p-1.5 text-secondary border border-border hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Snippet Preview */}
      <p className="text-xs text-secondary line-clamp-3 leading-relaxed font-sans">
        {note.snippet || 'Empty note content...'}
      </p>

      {/* Footer Info */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {getLocationBreadcrumb()}
        </div>

        <div className="flex items-center space-x-3 shrink-0 text-secondary text-[11px]">
          {note.resources && note.resources.length > 0 && (
            <span className="flex items-center space-x-1 text-blue-500 font-semibold">
              <Paperclip className="w-3 h-3" />
              <span>{note.resources.length}</span>
            </span>
          )}

          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(note.updatedAt)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
