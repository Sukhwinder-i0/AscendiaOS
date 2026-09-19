'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ResourceResponse } from '@studyos/shared';
import { api } from '@/lib/api';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { AddResourceModal } from '@/components/resources/AddResourceModal';
import { MoveResourceModal } from '@/components/resources/MoveResourceModal';
import { Inbox, Plus, CheckCircle2, Bookmark, FolderTree, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ResourceInboxPage() {
  const [inboxItems, setInboxItems] = useState<ResourceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [assigningResource, setAssigningResource] = useState<ResourceResponse | null>(null);

  const fetchInbox = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const items = await api.getInbox();
      setInboxItems(items);
    } catch (err: any) {
      setError(err.message || 'Failed to load resource inbox');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AddResourceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchInbox}
        initialLocation={{ locationType: 'INBOX' }}
      />

      <MoveResourceModal
        isOpen={Boolean(assigningResource)}
        onClose={() => setAssigningResource(null)}
        resource={assigningResource}
        onSuccess={fetchInbox}
      />

      {/* Inbox Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Inbox className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-primary tracking-tight">Resource Inbox</h1>
            <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded-sm font-mono font-medium">
              {inboxItems.length} unassigned
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Quickly save videos, articles, PDFs, and bookmarks here before assigning them to a syllabus topic
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/resources"
            className="flex items-center space-x-2 px-3.5 py-2 bg-surface hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium rounded-sm transition-colors"
          >
            <Bookmark className="w-4 h-4 text-orange-400" />
            <span>Global Library</span>
          </Link>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Inbox</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-surface p-6 rounded-sm text-center border border-red-500/20">
          <p className="text-xs font-medium text-red-400">{error}</p>
          <button
            onClick={fetchInbox}
            className="mt-3 px-4 py-1.5 bg-background text-primary text-xs font-medium rounded-sm border border-zinc-800 hover:bg-zinc-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-zinc-500">Loading inbox resources...</p>
        </div>
      ) : inboxItems.length === 0 ? (
        <div className="bg-surface p-12 rounded-sm text-center border border-dashed border-zinc-800 space-y-3">
          <div className="w-12 h-12 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary">You're all caught up.</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Your Resource Inbox is empty. All saved materials have been assigned to syllabus topics!
            </p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98]"
          >
            + Quick Save Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inboxItems.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onUpdate={(updated) => {
                setInboxItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
              }}
              onDelete={(id) => {
                setInboxItems((prev) => prev.filter((item) => item.id !== id));
              }}
              onMove={(resToAssign) => setAssigningResource(resToAssign)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
