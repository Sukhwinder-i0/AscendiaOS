'use client';

import React, { useState } from 'react';
import { ResourceResponse } from '@studyos/shared';
import { SyllabusTreePicker, LocationSelection } from './SyllabusTreePicker';
import { api } from '@/lib/api';
import { FolderTree, X, Check } from 'lucide-react';

interface MoveResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceResponse | null;
  onSuccess: () => void;
}

export function MoveResourceModal({ isOpen, onClose, resource, onSuccess }: MoveResourceModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationSelection>({
    locationType: resource?.locationType || 'INBOX',
    examId: resource?.examId,
    subjectId: resource?.subjectId,
    chapterId: resource?.chapterId,
    topicId: resource?.topicId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !resource) return null;

  const handleMove = async () => {
    try {
      setLoading(true);
      setError('');
      await api.moveResource(resource.id, selectedLocation);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to move resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-sm max-w-lg w-full p-6 space-y-5 shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary tracking-tight">Assign / Move Resource</h3>
              <p className="text-xs text-secondary truncate max-w-xs">{resource.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-xs text-red-400 font-medium font-mono">
            {error}
          </div>
        )}

        {/* Tree Picker */}
        <div>
          <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2 font-mono">
            Target Location
          </label>
          <SyllabusTreePicker
            selectedLocation={selectedLocation}
            onSelect={setSelectedLocation}
            examId={resource.examId}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-secondary hover:text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMove}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 rounded-sm text-xs font-semibold transition-all duration-150 active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>Save Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
