'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ResourceResponse } from '@studyos/shared';
import { api } from '@/lib/api';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceFilterBar, ResourceFilterState } from '@/components/resources/ResourceFilterBar';
import { AddResourceModal } from '@/components/resources/AddResourceModal';
import { MoveResourceModal } from '@/components/resources/MoveResourceModal';
import { Plus, Bookmark, Inbox, FolderTree, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function GlobalResourceLibraryPage() {
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [exams, setExams] = useState<Array<{ id: string; title: string }>>([]);
  const [filters, setFilters] = useState<ResourceFilterState>({ search: '' });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [movingResource, setMovingResource] = useState<ResourceResponse | null>(null);

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await api.getExams();
        setExams(data.map((e) => ({ id: e.id, title: e.title })));
      } catch (err) {
        console.error('Failed to fetch exams:', err);
      }
    }
    loadExams();
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getResources({
        search: filters.search || undefined,
        type: filters.type || undefined,
        examId: filters.examId || undefined,
        isAssigned: filters.isAssigned,
        isCompleted: filters.isCompleted,
        page,
        limit: 20,
      });
      setResources(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AddResourceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchResources}
      />

      <MoveResourceModal
        isOpen={Boolean(movingResource)}
        onClose={() => setMovingResource(null)}
        resource={movingResource}
        onSuccess={fetchResources}
      />

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary tracking-tight">Resource Library</h1>
            <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded-sm font-mono font-semibold">
              {total} items
            </span>
          </div>
          <p className="text-xs text-secondary mt-1">
            Central repository of all lectures, PDFs, articles, code, and bookmarks across your exams
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/resources/inbox"
            className="flex items-center space-x-2 px-3.5 py-2 bg-surface hover:bg-zinc-800 text-primary border border-border text-xs font-semibold rounded-sm transition-colors"
          >
            <Inbox className="w-4 h-4 text-orange-400" />
            <span>Resource Inbox</span>
          </Link>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <ResourceFilterBar filters={filters} onChange={setFilters} exams={exams} />

      {/* Error state */}
      {error && (
        <div className="bg-surface p-6 rounded-sm text-center border border-red-500/20">
          <p className="text-xs font-medium text-red-400 font-mono">{error}</p>
          <button
            onClick={fetchResources}
            className="mt-3 px-4 py-1.5 bg-background text-primary text-xs font-semibold rounded-sm border border-border hover:bg-zinc-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-16 font-mono">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-secondary">Loading study resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-surface p-12 rounded-sm text-center border border-dashed border-border space-y-3">
          <Bookmark className="w-10 h-10 text-secondary mx-auto opacity-50" />
          <div>
            <h3 className="text-base font-bold text-primary">No Resources Found</h3>
            <p className="text-xs text-secondary mt-1">
              {filters.search || filters.type
                ? 'No resources match your search criteria. Try resetting filters.'
                : 'Keep your study material close to the topic you are learning.'}
            </p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-orange-500 text-zinc-950 text-xs font-semibold rounded-sm hover:bg-orange-600 transition-colors"
          >
            + Add First Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onUpdate={(updated) => {
                setResources((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
              }}
              onDelete={(id) => {
                setResources((prev) => prev.filter((item) => item.id !== id));
                setTotal((t) => Math.max(0, t - 1));
              }}
              onMove={(resToMove) => setMovingResource(resToMove)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
