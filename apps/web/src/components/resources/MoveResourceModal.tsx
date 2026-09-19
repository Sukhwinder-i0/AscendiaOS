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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-surface border border-border rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary">Assign / Move Resource</h3>
              <p className="text-xs text-secondary truncate max-w-xs">{resource.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-secondary hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-500 font-medium">
            {error}
          </div>
        )}

        {/* Tree Picker */}
        <div>
          <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
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
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Save Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
