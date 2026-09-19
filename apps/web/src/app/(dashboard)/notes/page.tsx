'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { NoteResponse, ExamResponse } from '@studyos/shared';
import { api } from '@/lib/api';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteTemplateSelector, NoteTemplateType } from '@/components/notes/NoteTemplateSelector';
import { MoveResourceModal } from '@/components/resources/MoveResourceModal';
import { SyllabusTreePicker, LocationSelection } from '@/components/resources/SyllabusTreePicker';
import { Plus, FileText, Search, Pin, Archive, FolderTree, Loader2, Sparkles, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

export default function GlobalNotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'ALL' | 'PINNED' | 'ARCHIVED'>('ALL');
  const [search, setSearch] = useState('');
  const [exams, setExams] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [movingNote, setMovingNote] = useState<NoteResponse | null>(null);

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await api.getExams();
        setExams(data.map((e) => ({ id: e.id, title: e.title })));
      } catch (err) {
        console.error('Failed to load exams:', err);
      }
    }
    loadExams();
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getNotes({
        search: search || undefined,
        examId: selectedExamId || undefined,
        isPinned: activeTab === 'PINNED' ? true : undefined,
        isArchived: activeTab === 'ARCHIVED' ? true : false,
        limit: 50,
      });
      setNotes(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [search, selectedExamId, activeTab]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async (template?: NoteTemplateType) => {
    try {
      setCreating(true);
      const newNote = await api.createNote({
        title: 'Untitled Study Note',
        examId: selectedExamId || undefined,
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
    <div className="max-w-7xl mx-auto space-y-6">
      <NoteTemplateSelector
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        onSelectTemplate={(tpl) => handleCreateNote(tpl)}
      />

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-primary tracking-tight">Notes & Knowledge Workspace</h1>
            <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded-sm font-mono font-medium">
              {total} notes
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Personal study notes, formula sheets, summaries, and mistake logs connected to your syllabus
          </p>
        </div>

        <button
          onClick={() => setIsTemplateOpen(true)}
          disabled={creating}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>+ New Note</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface p-4 rounded-sm border border-zinc-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Tabs: All vs Pinned vs Archived */}
          <div className="flex rounded-sm bg-background p-1 border border-zinc-800">
            <button
              onClick={() => setActiveTab('ALL')}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-sm transition-colors',
                activeTab === 'ALL' ? 'bg-surface text-orange-400 border border-orange-500/20 shadow-none' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              All Notes
            </button>
            <button
              onClick={() => setActiveTab('PINNED')}
              className={clsx(
                'flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors',
                activeTab === 'PINNED' ? 'bg-surface text-amber-400 border border-amber-500/20 shadow-none' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>Pinned</span>
            </button>
            <button
              onClick={() => setActiveTab('ARCHIVED')}
              className={clsx(
                'flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors',
                activeTab === 'ARCHIVED' ? 'bg-surface text-purple-400 border border-purple-500/20 shadow-none' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archived</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notes by title or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-zinc-800 rounded-sm pl-9 pr-3 py-2 text-xs text-primary focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Exam Filter */}
          {exams.length > 0 && (
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="bg-background border border-zinc-800 rounded-sm px-3 py-2 text-xs text-primary focus:outline-none focus:border-orange-500"
            >
              <option value="">All Exams</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-surface p-6 rounded-sm text-center border border-red-500/20">
          <p className="text-xs font-medium text-red-400">{error}</p>
          <button
            onClick={fetchNotes}
            className="mt-3 px-4 py-1.5 bg-background text-primary text-xs font-medium rounded-sm border border-zinc-800 hover:bg-zinc-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-zinc-500">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-surface p-12 rounded-sm text-center border border-dashed border-zinc-800 space-y-3">
          <FileText className="w-10 h-10 text-zinc-600 mx-auto opacity-50" />
          <div>
            <h3 className="text-base font-bold text-primary">No Notes Found</h3>
            <p className="text-xs text-zinc-400 mt-1">
              {search
                ? 'No notes match your search query.'
                : activeTab === 'PINNED'
                  ? 'No pinned notes yet. Click the pin icon on any note to keep it at the top.'
                  : 'Start writing study notes for your exam preparation.'}
            </p>
          </div>
          <button
            onClick={() => setIsTemplateOpen(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98]"
          >
            + Create First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onUpdate={(updated) => {
                setNotes((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
              }}
              onDelete={(id) => {
                setNotes((prev) => prev.filter((item) => item.id !== id));
                setTotal((t) => Math.max(0, t - 1));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
