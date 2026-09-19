'use client';

import React, { useState, useEffect } from 'react';
import { ResourceResponse } from '@studyos/shared';
import { api } from '@/lib/api';
import { Paperclip, Search, X, Check, Bookmark, Youtube, FileText, Globe, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface AttachResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  attachedResourceIds?: string[];
  onSuccess: () => void;
}

export function AttachResourceModal({
  isOpen,
  onClose,
  noteId,
  attachedResourceIds = [],
  onSuccess,
}: AttachResourceModalProps) {
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachingId, setAttachingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadResources() {
      if (!isOpen) return;
      try {
        setLoading(true);
        const data = await api.getResources({ search: search || undefined, limit: 50 });
        setResources(data.items);
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, [isOpen, search]);

  if (!isOpen) return null;

  const handleToggleAttach = async (resource: ResourceResponse) => {
    const isAttached = attachedResourceIds.includes(resource.id);
    try {
      setAttachingId(resource.id);
      if (isAttached) {
        await api.detachResourceFromNote(noteId, resource.id);
      } else {
        await api.attachResourceToNote(noteId, resource.id);
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to toggle resource attachment:', err);
    } finally {
      setAttachingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-sm max-w-lg w-full p-6 space-y-4 shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Paperclip className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary tracking-tight">Attach Study Resources</h3>
              <p className="text-xs text-secondary mt-0.5">Link external materials, YouTube videos, and PDFs to this note</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search study resources to attach..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-sm pl-9 pr-3 py-2 text-xs text-primary focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Resource List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-secondary font-mono">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin mx-auto mb-1" />
              <span>Loading resources...</span>
            </div>
          ) : resources.length === 0 ? (
            <div className="py-8 text-center text-xs text-secondary font-mono">No study resources found.</div>
          ) : (
            resources.map((res) => {
              const isAttached = attachedResourceIds.includes(res.id);
              const isBusy = attachingId === res.id;
              return (
                <div
                  key={res.id}
                  onClick={() => !isBusy && handleToggleAttach(res)}
                  className={clsx(
                    'flex items-center justify-between p-3 rounded-sm border cursor-pointer transition-colors',
                    isAttached
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-semibold'
                      : 'border-border bg-background/50 hover:bg-background text-primary'
                  )}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-xs font-bold truncate block">{res.title}</span>
                    <span className="text-[10px] text-secondary capitalize font-mono">{res.type.replace('_', ' ')} • {res.provider || 'Resource'}</span>
                  </div>

                  <button
                    type="button"
                    disabled={isBusy}
                    className={clsx(
                      'px-3 py-1 rounded-sm text-xs font-semibold flex items-center space-x-1 shrink-0 transition-colors',
                      isAttached
                        ? 'bg-orange-500 text-zinc-950'
                        : 'bg-surface border border-border text-secondary hover:text-primary'
                    )}
                  >
                    {isBusy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isAttached ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Attached</span>
                      </>
                    ) : (
                      <span>+ Attach</span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
