'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NoteResponse, ExamResponse } from '@studyos/shared';
import { api } from '@/lib/api';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteTemplateSelector, NoteTemplateType } from '@/components/notes/NoteTemplateSelector';
import { Plus, FileText, Search, GraduationCap, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ExamWorkspaceNotesPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadExam() {
      if (!examId) return;
      try {
        const ex = await api.getExam(examId);
        setExam(ex);
      } catch (err) {
        console.error('Failed to load exam details:', err);
      }
    }
    loadExam();
  }, [examId]);

  const fetchNotes = useCallback(async () => {
    if (!examId) return;
    try {
      setLoading(true);
      setError('');
      const data = await api.getNotes({
        examId,
        search: search || undefined,
        limit: 50,
      });
      setNotes(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load exam notes');
    } finally {
      setLoading(false);
    }
  }, [examId, search]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async (template?: NoteTemplateType) => {
    try {
      setCreating(true);
      const newNote = await api.createNote({
        title: `${exam?.title || 'Exam'} Note`,
        examId,
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary">
              {exam ? `${exam.title} Notes` : 'Exam Notes Workspace'}
            </h1>
            <span className="text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-mono font-semibold">
              {total} notes
            </span>
          </div>
          <p className="text-xs text-secondary mt-1">
            Personal study notes, formula sheets, summaries, and mistake logs for this exam
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/workspace/${examId}/syllabus`}
            className="flex items-center space-x-2 px-3.5 py-2 bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-primary border border-border text-xs font-semibold rounded-lg transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-blue-500" />
            <span>View Syllabus Spine</span>
          </Link>

          <button
            onClick={() => setIsTemplateOpen(true)}
            disabled={creating}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>+ New Note</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-surface p-4 rounded-xl border border-border">
        <div className="relative">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search exam notes by title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-primary focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-surface p-6 rounded-xl text-center border border-red-500/20">
          <p className="text-xs font-medium text-red-500">{error}</p>
          <button
            onClick={fetchNotes}
            className="mt-3 px-4 py-1.5 bg-background text-primary text-xs font-semibold rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-secondary">Loading exam notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-surface p-12 rounded-xl text-center border border-dashed border-border space-y-3">
          <FileText className="w-10 h-10 text-secondary mx-auto opacity-50" />
          <div>
            <h3 className="text-base font-bold text-primary">No notes written for this exam yet</h3>
            <p className="text-xs text-secondary mt-1">
              Create your first study note, formula sheet, or mistake log for this exam.
            </p>
          </div>
          <button
            onClick={() => setIsTemplateOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
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
