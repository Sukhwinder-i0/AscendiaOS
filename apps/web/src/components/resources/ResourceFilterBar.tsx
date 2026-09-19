'use client';

import React from 'react';
import { ResourceType, ResourceLocationType } from '@studyos/shared';
import { Search, Filter, X, CheckCircle2, Bookmark } from 'lucide-react';
import { clsx } from 'clsx';

export interface ResourceFilterState {
  search: string;
  type?: ResourceType;
  examId?: string;
  isAssigned?: boolean;
  isCompleted?: boolean;
}

interface ResourceFilterBarProps {
  filters: ResourceFilterState;
  onChange: (filters: ResourceFilterState) => void;
  exams?: Array<{ id: string; title: string }>;
}

export function ResourceFilterBar({ filters, onChange, exams = [] }: ResourceFilterBarProps) {
  const resourceTypes: Array<{ label: string; value: ResourceType }> = [
    { label: 'YouTube Video', value: ResourceType.YOUTUBE_VIDEO },
    { label: 'YouTube Playlist', value: ResourceType.YOUTUBE_PLAYLIST },
    { label: 'Article / Website', value: ResourceType.WEBSITE },
    { label: 'PDF Document', value: ResourceType.PDF },
    { label: 'Markdown', value: ResourceType.MARKDOWN },
    { label: 'Text File', value: ResourceType.TXT },
    { label: 'Image', value: ResourceType.IMAGE },
    { label: 'Code File', value: ResourceType.CODE },
    { label: 'Bookmark', value: ResourceType.BOOKMARK },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as ResourceType | '';
    onChange({ ...filters, type: val ? val : undefined });
  };

  const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange({ ...filters, examId: val ? val : undefined });
  };

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange({
      ...filters,
      isAssigned: val === 'assigned' ? true : val === 'unassigned' ? false : undefined,
    });
  };

  const handleCompletedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange({
      ...filters,
      isCompleted: val === 'completed' ? true : val === 'unread' ? false : undefined,
    });
  };

  const hasActiveFilters =
    filters.search || filters.type || filters.examId || filters.isAssigned !== undefined || filters.isCompleted !== undefined;

  const handleClearFilters = () => {
    onChange({ search: '' });
  };

  return (
    <div className="bg-surface p-4 rounded-xl border border-border space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search resources by title, description, filename, or URL..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-primary focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={filters.type || ''}
            onChange={handleTypeChange}
            className="bg-background border border-border rounded-lg px-3 py-2 text-xs text-primary focus:outline-none focus:border-blue-500"
          >
            <option value="">All Resource Types</option>
            {resourceTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Exam Filter */}
          {exams.length > 0 && (
            <select
              value={filters.examId || ''}
              onChange={handleExamChange}
              className="bg-background border border-border rounded-lg px-3 py-2 text-xs text-primary focus:outline-none focus:border-blue-500"
            >
              <option value="">All Exams</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          )}

          {/* Assignment Filter */}
          <select
            value={
              filters.isAssigned === true ? 'assigned' : filters.isAssigned === false ? 'unassigned' : ''
            }
            onChange={handleAssignmentChange}
            className="bg-background border border-border rounded-lg px-3 py-2 text-xs text-primary focus:outline-none focus:border-blue-500"
          >
            <option value="">All Locations</option>
            <option value="assigned">Assigned to Syllabus</option>
            <option value="unassigned">Inbox (Unassigned)</option>
          </select>

          {/* Progress Status Filter */}
          <select
            value={
              filters.isCompleted === true ? 'completed' : filters.isCompleted === false ? 'unread' : ''
            }
            onChange={handleCompletedChange}
            className="bg-background border border-border rounded-lg px-3 py-2 text-xs text-primary focus:outline-none focus:border-blue-500"
          >
            <option value="">All Progress States</option>
            <option value="unread font-bold">Unread / In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Clear Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center space-x-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-secondary hover:text-primary rounded-lg text-xs font-semibold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
