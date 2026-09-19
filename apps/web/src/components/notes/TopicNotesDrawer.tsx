'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { NoteResponse } from '@studyos/shared';
import { NoteCard } from './NoteCard';
import { NoteTemplateSelector, NoteTemplateType } from './NoteTemplateSelector';
import { MoveResourceModal } from '../resources/MoveResourceModal';
import { api } from '@/lib/api';
import { X, Plus, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopicNotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  examId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
}

export function TopicNotesDrawer({
  isOpen,
  onClose,
  title,
  examId,
  subjectId,
  chapterId,
  topicId,
}: TopicNotesDrawerProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!isOpen) return;
    try {
      setLoading(true);
      const res = await api.getNotes({
        examId,
        subjectId,
        chapterId,
        topicId,
        limit: 50,
      });
      setNotes(res.items);
    } catch (err) {
      console.error('Failed to load topic notes:', err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, examId, subjectId, chapterId, topicId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  if (!isOpen) return null;

  const handleCreateNote = async (template?: NoteTemplateType) => {
    try {
      setCreating(true);
      const newNote = await api.createNote({
        title: `${title} Notes`,
        examId,
        subjectId,
        chapterId,
        topicId,
        template,
      });
      router.push(`/notes/${newNote.id}`);
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in">
      <NoteTemplateSelector
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        onSelectTemplate={(tpl) => handleCreateNote(tpl)}
      />

      <div className="bg-surface border-l border-border max-w-2xl w-full h-full flex flex-col justify-between p-6 space-y-6 overflow-y-auto shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase">
                  Notes
                </span>
                <span className="text-xs text-secondary">{notes.length} notes</span>
              </div>
              <h3 className="text-lg font-bold text-primary truncate max-w-md">{title}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsTemplateOpen(true)}
              disabled={creating}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>New Note</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-secondary hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notes Content List */}
        <div className="flex-1 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-secondary">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-background/50 border border-dashed border-border rounded-xl p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-secondary mx-auto opacity-50" />
              <div>
                <h4 className="text-sm font-bold text-primary">No notes written for this topic yet</h4>
                <p className="text-xs text-secondary mt-1">
                  Create your first study note, formula sheet, or mistake log for {title}.
                </p>
              </div>
              <button
                onClick={() => setIsTemplateOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                + Create First Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {notes.map((n) => (
                <NoteCard
                  key={n.id}
                  note={n}
                  onUpdate={(updated) => {
                    setNotes((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                  }}
                  onDelete={(id) => {
                    setNotes((prev) => prev.filter((item) => item.id !== id));
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
