'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ResourceResponse, ResourceLocationType } from '@ascendiaos/shared';
import { ResourceCard } from './ResourceCard';
import { AddResourceModal } from './AddResourceModal';
import { MoveResourceModal } from './MoveResourceModal';
import { api } from '@/lib/api';
import { X, Plus, Bookmark, FolderTree, Loader2 } from 'lucide-react';

interface TopicResourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  locationType: ResourceLocationType;
  examId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
}

export function TopicResourcesDrawer({
  isOpen,
  onClose,
  title,
  locationType,
  examId,
  subjectId,
  chapterId,
  topicId,
}: TopicResourcesDrawerProps) {
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [movingResource, setMovingResource] = useState<ResourceResponse | null>(null);

  const fetchResources = useCallback(async () => {
    if (!isOpen) return;
    try {
      setLoading(true);
      const res = await api.getResources({
        locationType,
        examId,
        subjectId,
        chapterId,
        topicId,
        limit: 50,
      });
      setResources(res.items);
    } catch (err) {
      console.error('Failed to load topic resources:', err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, locationType, examId, subjectId, chapterId, topicId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in">
      <AddResourceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchResources}
        initialLocation={{
          locationType,
          examId,
          subjectId,
          chapterId,
          topicId,
        }}
      />

      <MoveResourceModal
        isOpen={Boolean(movingResource)}
        onClose={() => setMovingResource(null)}
        resource={movingResource}
        onSuccess={fetchResources}
      />

      <div className="bg-surface border-l border-border max-w-full sm:max-w-2xl w-full h-full flex flex-col justify-between p-4 sm:p-6 space-y-6 overflow-y-auto shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-sm border border-orange-500/20 uppercase font-mono">
                  {locationType}
                </span>
                <span className="text-xs text-secondary font-mono">{resources.length} resources</span>
              </div>
              <h3 className="text-lg font-bold text-primary truncate max-w-md tracking-tight">{title}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-zinc-950 rounded-sm text-xs font-semibold transition-all duration-150 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resource</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resources Content List */}
        <div className="flex-1 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-secondary font-mono">Loading study material...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-background/50 border border-dashed border-border rounded-sm p-8 text-center space-y-3">
              <Bookmark className="w-10 h-10 text-secondary mx-auto opacity-50" />
              <div>
                <h4 className="text-sm font-bold text-primary">No resources attached yet</h4>
                <p className="text-xs text-secondary mt-1">
                  Keep your study material close to the topic you are learning. Attach YouTube lectures, PDFs, articles, code files, or bookmarks.
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 rounded-sm text-xs font-semibold transition-all duration-150 active:scale-[0.98]"
              >
                + Add First Resource
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {resources.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  onUpdate={(updated) => {
                    setResources((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                  }}
                  onDelete={(id) => {
                    setResources((prev) => prev.filter((item) => item.id !== id));
                  }}
                  onMove={(resToMove) => setMovingResource(resToMove)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
