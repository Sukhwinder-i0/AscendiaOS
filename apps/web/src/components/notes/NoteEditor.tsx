'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NoteResponse, ResourceResponse } from '@ascendiaos/shared';
import { MathRenderer } from './MathRenderer';
import { AttachResourceModal } from './AttachResourceModal';
import { ResourceCard } from '../resources/ResourceCard';
import { api } from '@/lib/api';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Sigma,
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  Edit3,
  Columns,
  Paperclip,
  ArrowLeft,
  FolderTree,
  Pin,
  Archive,
  Trash2,
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NoteEditorProps {
  initialNote: NoteResponse;
}

export function NoteEditor({ initialNote }: NoteEditorProps) {
  const router = useRouter();
  const [note, setNote] = useState<NoteResponse>(initialNote);
  const [title, setTitle] = useState(initialNote.title);
  const [content, setContent] = useState(initialNote.content);

  const [mode, setMode] = useState<'SPLIT' | 'WRITE' | 'PREVIEW'>('SPLIT');
  const [saveStatus, setSaveStatus] = useState<'SAVED' | 'SAVING' | 'FAILED' | 'LOCAL_DRAFT'>('SAVED');
  const [localDraftFound, setLocalDraftFound] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const draftKey = `ascendiaos_note_draft_${note.id}`;

  // Check for local draft on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft && savedDraft !== note.content) {
        setLocalDraftFound(true);
      }
    }
  }, [draftKey, note.content]);

  const saveToServer = useCallback(
    async (updatedTitle: string, updatedContent: string) => {
      try {
        setSaveStatus('SAVING');
        const updated = await api.updateNote(note.id, {
          title: updatedTitle,
          content: updatedContent,
        });
        setNote(updated);
        setSaveStatus('SAVED');
        if (typeof window !== 'undefined') {
          localStorage.removeItem(draftKey);
        }
      } catch (err) {
        console.error('Autosave failed:', err);
        setSaveStatus('FAILED');
        if (typeof window !== 'undefined') {
          localStorage.setItem(draftKey, updatedContent);
        }
      }
    },
    [draftKey, note.id],
  );

  // Debounced autosave
  useEffect(() => {
    if (title === note.title && content === note.content) {
      return;
    }

    setSaveStatus('SAVING');
    if (typeof window !== 'undefined') {
      localStorage.setItem(draftKey, content);
    }

    const timer = setTimeout(() => {
      saveToServer(title, content);
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, note.title, note.content, saveToServer, draftKey]);

  // Keyboard Shortcuts (Ctrl+S, Ctrl+B, Ctrl+I, Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveToServer(title, content);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveToServer, title, content]);

  const restoreDraft = () => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        setContent(savedDraft);
        setLocalDraftFound(false);
        saveToServer(title, savedDraft);
      }
    }
  };

  const discardDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(draftKey);
      setLocalDraftFound(false);
    }
  };

  // Helper to insert formatting into textarea
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText ? selectedText.length : 4));
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    try {
      setSaveStatus('SAVING');
      const uploadedRes = await api.uploadFileResource(file, { title: file.name });
      const imgMarkdown = `\n![${file.name}](${uploadedRes.url || `/api/resources/${uploadedRes.id}/file`})\n`;
      insertFormatting(imgMarkdown, '');
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
  };

  const togglePin = async () => {
    const updated = note.isPinned ? await api.unpinNote(note.id) : await api.pinNote(note.id);
    setNote(updated);
  };

  const toggleArchive = async () => {
    const updated = note.isArchived ? await api.unarchiveNote(note.id) : await api.archiveNote(note.id);
    setNote(updated);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete note "${note.title}"?`)) return;
    await api.deleteNote(note.id);
    router.push('/notes');
  };

  const getBreadcrumbs = () => {
    const parts = [
      note.exam ? { label: note.exam.title, href: `/workspace/${note.examId}/syllabus` } : null,
      note.subject ? { label: note.subject.name, href: `#` } : null,
      note.chapter ? { label: note.chapter.name, href: `#` } : null,
      note.topic ? { label: note.topic.name, href: `#` } : null,
    ].filter(Boolean) as Array<{ label: string; href: string }>;

    if (parts.length === 0) return <span className="text-xs text-secondary">General Note</span>;

    return (
      <nav className="flex items-center space-x-1 text-xs text-secondary font-mono">
        <FolderTree className="w-3.5 h-3.5 text-orange-500 shrink-0" />
        {parts.map((p, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span>/</span>}
            <span className="hover:text-primary transition-colors">{p.label}</span>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <AttachResourceModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        noteId={note.id}
        attachedResourceIds={(note.resources || []).map((r) => r.id)}
        onSuccess={async () => {
          const reloaded = await api.getNoteById(note.id);
          setNote(reloaded);
        }}
      />

      {/* Draft Conflict Banner */}
      {localDraftFound && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm p-3 flex items-center justify-between text-xs text-amber-400 font-medium">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>An unsaved local draft was found from an offline session.</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={restoreDraft}
              className="px-3 py-1 bg-amber-500 text-zinc-950 rounded-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              Restore Draft
            </button>
            <button
              onClick={discardDraft}
              className="px-2 py-1 text-secondary hover:text-primary transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface p-4 rounded-sm border border-border">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.back()}
              className="p-1 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {getBreadcrumbs()}
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full text-xl font-bold bg-transparent text-primary focus:outline-none placeholder:text-secondary tracking-tight"
          />
        </div>

        {/* Right Actions & Autosave Indicator */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Autosave Status Badge */}
          <div className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-sm border border-border bg-background font-mono">
            {saveStatus === 'SAVING' && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                <span className="text-orange-400">Saving...</span>
              </>
            )}
            {saveStatus === 'SAVED' && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-secondary">Saved</span>
              </>
            )}
            {saveStatus === 'FAILED' && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400">Failed to save</span>
              </>
            )}
          </div>

          <button
            onClick={togglePin}
            className={clsx(
              'p-2 rounded-sm border transition-colors',
              note.isPinned
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'text-secondary border-border hover:text-amber-400 hover:bg-zinc-800'
            )}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="w-4 h-4" />
          </button>

          <button
            onClick={toggleArchive}
            className={clsx(
              'p-2 rounded-sm border transition-colors',
              note.isArchived
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'text-secondary border-border hover:text-purple-400 hover:bg-zinc-800'
            )}
            title={note.isArchived ? 'Unarchive' : 'Archive'}
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2 text-secondary border border-border hover:text-red-400 hover:bg-zinc-800 rounded-sm transition-colors"
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Toolbar & View Mode Switcher */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto bg-surface px-4 py-2 rounded-sm border border-border text-xs min-w-0">
        {/* Formatting Buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => insertFormatting('# ', '')}
            className="p-1.5 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('## ', '')}
            className="p-1.5 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => insertFormatting('**', '**')}
            className="p-1.5 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('*', '*')}
            className="p-1.5 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => insertFormatting('- ', '')}
            className="p-1.5 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
            title="Unordered List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('1. ', '')}
            className="p-1.5 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('- [ ] ', '')}
            className="p-1.5 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
            title="Checklist"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => insertFormatting('`', '`')}
            className="p-1.5 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('\n$$\n', '\n$$\n')}
            className="p-1.5 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 rounded-sm transition-colors font-bold"
            title="LaTeX KaTeX Math Formula"
          >
            <Sigma className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('[', '](https://)')}
            className="p-1.5 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
            title="Link (Ctrl+K)"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {/* Image Upload Button */}
          <label className="p-1.5 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors cursor-pointer" title="Upload Image">
            <ImageIcon className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        {/* View Mode Toggle: Split / Write / Preview */}
        <div className="flex rounded-sm bg-background p-1 border border-border">
          <button
            onClick={() => setMode('WRITE')}
            className={clsx(
              'flex items-center space-x-1 px-2.5 py-1 rounded-sm text-xs font-semibold transition-colors',
              mode === 'WRITE' ? 'bg-surface text-orange-400 shadow-none' : 'text-secondary'
            )}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            onClick={() => setMode('SPLIT')}
            className={clsx(
              'flex items-center space-x-1 px-2.5 py-1 rounded-sm text-xs font-semibold transition-colors',
              mode === 'SPLIT' ? 'bg-surface text-orange-400 shadow-none' : 'text-secondary'
            )}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>
          <button
            onClick={() => setMode('PREVIEW')}
            className={clsx(
              'flex items-center space-x-1 px-2.5 py-1 rounded-sm text-xs font-semibold transition-colors',
              mode === 'PREVIEW' ? 'bg-surface text-orange-400 shadow-none' : 'text-secondary'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Workspace Editor Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[500px]">
        {/* Write Pane */}
        {(mode === 'WRITE' || mode === 'SPLIT') && (
          <div className={clsx('bg-surface p-4 rounded-sm border border-border flex flex-col', mode === 'WRITE' && 'md:col-span-2')}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your study notes here using Markdown and KaTeX math formulas ($P(A|B)$ or $$...$$)..."
              className="w-full h-full min-h-[500px] bg-transparent text-sm text-primary font-mono focus:outline-none resize-y leading-relaxed"
            />
          </div>
        )}

        {/* Live KaTeX & Markdown Preview Pane */}
        {(mode === 'PREVIEW' || mode === 'SPLIT') && (
          <div className={clsx('bg-surface p-6 rounded-sm border border-border overflow-y-auto min-h-[500px]', mode === 'PREVIEW' && 'md:col-span-2')}>
            <div className="prose dark:prose-invert max-w-none text-primary text-sm leading-relaxed space-y-3">
              <MathRenderer content={content} />
            </div>
          </div>
        )}
      </div>

      {/* Sources & Referenced Study Materials */}
      <div className="bg-surface p-5 rounded-sm border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <Paperclip className="w-4 h-4 text-orange-500" />
            <h4 className="text-sm font-bold text-primary tracking-tight">Sources & Referenced Materials</h4>
            <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-sm font-mono font-semibold">
              {(note.resources || []).length}
            </span>
          </div>

          <button
            onClick={() => setIsAttachModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface hover:bg-zinc-800 text-primary border border-border rounded-sm text-xs font-semibold transition-colors"
          >
            <Paperclip className="w-3.5 h-3.5 text-orange-500" />
            <span>Attach Resource</span>
          </button>
        </div>

        {(note.resources || []).length === 0 ? (
          <p className="text-xs text-secondary italic">
            No external resources linked to this note yet. Click "Attach Resource" to link YouTube lectures, PDFs, or articles.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(note.resources || []).map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                onDelete={async (resId) => {
                  const reloaded = await api.detachResourceFromNote(note.id, resId);
                  setNote(reloaded);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
