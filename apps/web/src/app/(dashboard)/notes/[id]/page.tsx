'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NoteResponse } from '@studyos/shared';
import { api } from '@/lib/api';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { Loader2 } from 'lucide-react';

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const [note, setNote] = useState<NoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadNote() {
      if (!noteId) return;
      try {
        setLoading(true);
        setError('');
        const data = await api.getNoteById(noteId);
        setNote(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load note');
      } finally {
        setLoading(false);
      }
    }
    loadNote();
  }, [noteId]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
        <p className="text-xs text-zinc-500">Opening study note workspace...</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="bg-surface p-8 rounded-sm text-center border border-red-500/20 max-w-lg mx-auto my-12 space-y-3">
        <p className="text-xs font-semibold text-red-400">{error || 'Note not found or access denied.'}</p>
        <button
          onClick={() => router.push('/notes')}
          className="px-4 py-2 bg-background text-primary text-xs font-medium rounded-sm border border-zinc-800 hover:bg-zinc-800"
        >
          Return to Notes
        </button>
      </div>
    );
  }

  return <NoteEditor initialNote={note} />;
}
