'use client';

import React, { useState } from 'react';
import { ResourceResponse, ResourceType } from '@studyos/shared';
import {
  Youtube,
  FileText,
  Globe,
  FileCode,
  Image as ImageIcon,
  Bookmark,
  ExternalLink,
  Download,
  FolderTree,
  CheckCircle2,
  Trash2,
  MoreVertical,
  Inbox,
  Clock,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '@/lib/api';

interface ResourceCardProps {
  resource: ResourceResponse;
  onUpdate?: (updated: ResourceResponse) => void;
  onDelete?: (id: string) => void;
  onMove?: (resource: ResourceResponse) => void;
}

export function ResourceCard({ resource, onUpdate, onDelete, onMove }: ResourceCardProps) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTypeBadge = (type: ResourceType) => {
    switch (type) {
      case ResourceType.YOUTUBE_VIDEO:
        return { label: 'YouTube Video', bg: 'bg-red-500/10 text-red-500 border-red-500/20', icon: Youtube };
      case ResourceType.YOUTUBE_PLAYLIST:
        return { label: 'YouTube Playlist', bg: 'bg-red-500/10 text-red-500 border-red-500/20', icon: Youtube };
      case ResourceType.WEBSITE:
        return { label: 'Article / Web', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Globe };
      case ResourceType.PDF:
        return { label: 'PDF Document', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: FileText };
      case ResourceType.MARKDOWN:
        return { label: 'Markdown', bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', icon: FileText };
      case ResourceType.TXT:
        return { label: 'Text File', bg: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: FileText };
      case ResourceType.IMAGE:
        return { label: 'Image', bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: ImageIcon };
      case ResourceType.CODE:
        return { label: 'Code File', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: FileCode };
      default:
        return { label: 'Bookmark', bg: 'bg-slate-500/10 text-secondary border-border', icon: Bookmark };
    }
  };

  const badgeConfig = getTypeBadge(resource.type);
  const Icon = badgeConfig.icon;

  const handleOpen = async () => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (resource.id && resource.storageKey) {
      try {
        setLoading(true);
        const { downloadUrl } = await api.getDownloadUrl(resource.id);
        window.open(downloadUrl, '_blank');
      } catch (err) {
        console.error('Failed to open file:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const updated = await api.updateResource(resource.id, {
        isCompleted: !resource.isCompleted,
      });
      if (onUpdate) onUpdate(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete resource "${resource.title}"?`)) return;
    try {
      setLoading(true);
      await api.deleteResource(resource.id);
      if (onDelete) onDelete(resource.id);
    } catch (err) {
      console.error('Failed to delete resource:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLocationBreadcrumb = () => {
    if (resource.locationType === 'INBOX' || (!resource.exam && !resource.subject && !resource.chapter && !resource.topic)) {
      return (
        <span className="inline-flex items-center space-x-1 text-[11px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          <Inbox className="w-3 h-3" />
          <span>Resource Inbox (Unassigned)</span>
        </span>
      );
    }

    const parts = [
      resource.exam?.title,
      resource.subject?.name,
      resource.chapter?.name,
      resource.topic?.name,
    ].filter(Boolean);

    return (
      <span className="inline-flex items-center space-x-1 text-[11px] text-secondary truncate max-w-full">
        <FolderTree className="w-3 h-3 text-blue-500 shrink-0" />
        <span className="truncate">{parts.join(' / ')}</span>
      </span>
    );
  };

  return (
    <div className={clsx(
      'group relative bg-surface rounded-xl border border-border p-4 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-3',
      resource.isCompleted && 'opacity-75 bg-slate-500/5'
    )}>
      {/* Top Header: Badge, Location & Actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className={clsx('inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border', badgeConfig.bg)}>
            <Icon className="w-3.5 h-3.5" />
            <span>{badgeConfig.label}</span>
          </span>

          {resource.provider && (
            <span className="text-[11px] bg-background text-secondary px-2 py-0.5 rounded border border-border font-medium">
              {resource.provider}
            </span>
          )}
        </div>

        {/* Quick Buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            title={resource.isCompleted ? 'Mark as Unread' : 'Mark as Completed'}
            className={clsx(
              'p-1.5 rounded-lg border transition-colors',
              resource.isCompleted
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : 'text-secondary border-border hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>

          {onMove && (
            <button
              onClick={() => onMove(resource)}
              title="Assign / Move Resource"
              className="p-1.5 text-secondary border border-border hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/20 rounded-lg transition-colors"
            >
              <FolderTree className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              title="Delete Resource"
              className="p-1.5 text-secondary border border-border hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Thumbnail preview if applicable */}
      {resource.thumbnailUrl && (
        <div
          onClick={handleOpen}
          className="relative w-full h-36 bg-background rounded-lg overflow-hidden border border-border cursor-pointer group-hover:opacity-95 transition-opacity"
        >
          <img
            src={resource.thumbnailUrl}
            alt={resource.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2.5">
            <span className="text-[11px] text-white font-medium flex items-center space-x-1">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Click to view</span>
            </span>
          </div>
        </div>
      )}

      {/* Resource Title & Description */}
      <div className="space-y-1">
        <h3
          onClick={handleOpen}
          className="text-sm font-bold text-primary hover:text-blue-500 cursor-pointer transition-colors line-clamp-2"
        >
          {resource.title}
        </h3>

        {resource.description && (
          <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        )}
      </div>

      {/* Footer Info: Size, Location, Open Action */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {getLocationBreadcrumb()}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {resource.sizeBytes ? (
            <span className="text-[11px] text-secondary font-mono">
              {formatFileSize(resource.sizeBytes)}
            </span>
          ) : null}

          <button
            onClick={handleOpen}
            disabled={loading}
            className="flex items-center space-x-1 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
          >
            <span>Open</span>
            {resource.url ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
