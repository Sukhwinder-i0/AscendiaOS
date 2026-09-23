'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ResourceResponse, ExamResponse } from '@ascendiaos/shared';
import { api } from '@/lib/api';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceFilterBar, ResourceFilterState } from '@/components/resources/ResourceFilterBar';
import { AddResourceModal } from '@/components/resources/AddResourceModal';
import { MoveResourceModal } from '@/components/resources/MoveResourceModal';
import { Plus, Bookmark, GraduationCap, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ExamWorkspaceResourcesPage() {
  const params = useParams();
  const examId = params.examId as string;

  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState<ResourceFilterState>({ search: '', examId });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [movingResource, setMovingResource] = useState<ResourceResponse | null>(null);

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

  const fetchResources = useCallback(async () => {
    if (!examId) return;
    try {
      setLoading(true);
      setError('');
      const data = await api.getResources({
        examId,
        search: filters.search || undefined,
        type: filters.type || undefined,
        isAssigned: filters.isAssigned,
        isCompleted: filters.isCompleted,
        limit: 50,
      });
      setResources(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load exam resources');
    } finally {
      setLoading(false);
    }
  }, [examId, filters]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AddResourceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchResources}
        initialLocation={{ locationType: 'EXAM', examId }}
      />

      <MoveResourceModal
        isOpen={Boolean(movingResource)}
        onClose={() => setMovingResource(null)}
        resource={movingResource}
        onSuccess={fetchResources}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-primary tracking-tight">
              {exam ? `${exam.title} Resources` : 'Exam Resources'}
            </h1>
            <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded-sm font-mono font-medium">
              {total} items
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Study resources associated with this exam and its subjects, chapters, and topics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/workspace/${examId}/syllabus`}
            className="flex items-center space-x-2 px-3.5 py-2 bg-surface hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium rounded-sm transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-orange-400" />
            <span>View Syllabus Spine</span>
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
      <ResourceFilterBar filters={filters} onChange={setFilters} />

      {/* Error state */}
      {error && (
        <div className="bg-surface p-6 rounded-sm text-center border border-red-500/20">
          <p className="text-xs font-medium text-red-400">{error}</p>
          <button
            onClick={fetchResources}
            className="mt-3 px-4 py-1.5 bg-background text-primary text-xs font-medium rounded-sm border border-zinc-800 hover:bg-zinc-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-zinc-500">Loading exam resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-surface p-12 rounded-sm text-center border border-dashed border-zinc-800 space-y-3">
          <Bookmark className="w-10 h-10 text-zinc-600 mx-auto opacity-50" />
          <div>
            <h3 className="text-base font-bold text-primary">No resources attached to this exam yet</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Add lectures, PYQ PDFs, articles, or bookmarks to keep your study material organized.
            </p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98]"
          >
            + Add Exam Resource
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
