'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ResourceResponse, ExamResponse } from '@studyos/shared';
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
            <h1 className="text-2xl font-bold text-primary">
              {exam ? `${exam.title} Resources` : 'Exam Resources'}
            </h1>
            <span className="text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-mono font-semibold">
              {total} items
            </span>
          </div>
          <p className="text-xs text-secondary mt-1">
            Study resources associated with this exam and its subjects, chapters, and topics
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
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
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
        <div className="bg-surface p-6 rounded-xl text-center border border-red-500/20">
          <p className="text-xs font-medium text-red-500">{error}</p>
          <button
            onClick={fetchResources}
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
          <p className="text-xs text-secondary">Loading exam resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-surface p-12 rounded-xl text-center border border-dashed border-border space-y-3">
          <Bookmark className="w-10 h-10 text-secondary mx-auto opacity-50" />
          <div>
            <h3 className="text-base font-bold text-primary">No resources attached to this exam yet</h3>
            <p className="text-xs text-secondary mt-1">
              Add lectures, PYQ PDFs, articles, or bookmarks to keep your study material organized.
            </p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
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
