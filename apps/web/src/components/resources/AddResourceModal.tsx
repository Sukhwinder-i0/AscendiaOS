'use client';

import React, { useState, useEffect } from 'react';
import { ResourceLocationType, ResourceType, UrlMetadataResponse } from '@studyos/shared';
import { SyllabusTreePicker, LocationSelection } from './SyllabusTreePicker';
import { api } from '@/lib/api';
import {
  X,
  Plus,
  Link as LinkIcon,
  Upload,
  Youtube,
  Globe,
  FileText,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialLocation?: LocationSelection;
}

export function AddResourceModal({
  isOpen,
  onClose,
  onSuccess,
  initialLocation,
}: AddResourceModalProps) {
  const [tab, setTab] = useState<'URL' | 'FILE'>('URL');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [location, setLocation] = useState<LocationSelection>(
    initialLocation || { locationType: 'INBOX' },
  );

  const [metadata, setMetadata] = useState<UrlMetadataResponse | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update location if initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  // Auto-detect URL metadata on blur or debounced paste
  useEffect(() => {
    if (!url.trim() || tab !== 'URL') {
      setMetadata(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setDetecting(true);
        const meta = await api.detectUrlMetadata(url.trim());
        setMetadata(meta);
        if (!title && meta.title) {
          setTitle(meta.title);
        }
        if (!description && meta.description) {
          setDescription(meta.description);
        }
      } catch (err) {
        console.warn('URL auto-detect failed:', err);
      } finally {
        setDetecting(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [url, tab]);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!title) setTitle(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) setTitle(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (tab === 'URL') {
        if (!url.trim()) {
          throw new Error('Please enter a valid URL');
        }
        await api.createUrlResource({
          url: url.trim(),
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          locationType: location.locationType,
          examId: location.examId || undefined,
          subjectId: location.subjectId || undefined,
          chapterId: location.chapterId || undefined,
          topicId: location.topicId || undefined,
        });
      } else {
        if (!selectedFile) {
          throw new Error('Please select a file to upload');
        }
        await api.uploadFileResource(selectedFile, {
          title: title.trim() || selectedFile.name,
          description: description.trim() || undefined,
          locationType: location.locationType,
          examId: location.examId || undefined,
          subjectId: location.subjectId || undefined,
          chapterId: location.chapterId || undefined,
          topicId: location.topicId || undefined,
        });
      }

      onSuccess();
      onClose();
      // Reset form
      setUrl('');
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setMetadata(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-sm max-w-xl w-full p-6 space-y-5 shadow-none max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary tracking-tight">Add Study Resource</h3>
              <p className="text-xs text-secondary mt-0.5">
                Attach lectures, PDFs, articles, code, or bookmarks to your syllabus
              </p>
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
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-xs text-red-400 font-medium flex items-center space-x-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Switcher: URL vs Upload */}
        <div className="flex rounded-sm bg-background p-1 border border-border">
          <button
            type="button"
            onClick={() => setTab('URL')}
            className={clsx(
              'flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-sm transition-colors',
              tab === 'URL'
                ? 'bg-surface text-orange-400 shadow-none border border-border'
                : 'text-secondary hover:text-primary'
            )}
          >
            <LinkIcon className="w-4 h-4" />
            <span>URL / Link (YouTube, Article, Bookmark)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('FILE')}
            className={clsx(
              'flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold rounded-sm transition-colors',
              tab === 'FILE'
                ? 'bg-surface text-orange-400 shadow-none border border-border'
                : 'text-secondary hover:text-primary'
            )}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File (PDF, Code, Image, MD)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'URL' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Resource URL <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=... or https://arxiv.org/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="w-full bg-background border border-border rounded-sm px-3.5 py-2 text-xs text-primary focus:outline-none focus:border-orange-500 pr-10"
                  />
                  {detecting && (
                    <Loader2 className="w-4 h-4 text-orange-500 animate-spin absolute right-3 top-2.5" />
                  )}
                </div>
              </div>

              {/* Detected Metadata Card Preview */}
              {metadata && (
                <div className="p-3 bg-background border border-border rounded-sm flex items-start space-x-3">
                  {metadata.thumbnailUrl ? (
                    <img
                      src={metadata.thumbnailUrl}
                      alt="Preview"
                      className="w-16 h-12 rounded-sm object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-sm border border-orange-500/20 uppercase">
                        {metadata.type}
                      </span>
                      {metadata.provider && (
                        <span className="text-[10px] text-secondary font-medium">
                          {metadata.provider}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-primary truncate mt-0.5 tracking-tight">
                      {metadata.title}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Select File (Max 50MB) <span className="text-red-400">*</span>
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-border hover:border-orange-500 rounded-sm p-6 text-center bg-background/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-secondary mx-auto mb-2" />
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-orange-400">{selectedFile.name}</p>
                      <p className="text-[11px] text-secondary font-mono mt-0.5">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-primary">
                        Drag and drop file here, or <span className="text-orange-400 font-semibold">browse</span>
                      </p>
                      <p className="text-[11px] text-secondary mt-1 font-mono">
                        PDF, Markdown (.md), Text (.txt), Images, Code files, Generic documents
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Title & Description Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Title</label>
              <input
                type="text"
                placeholder={tab === 'URL' ? 'Resource title (auto-detected if blank)...' : 'File title...'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background border border-border rounded-sm px-3.5 py-2 text-xs text-primary focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Description (Optional)</label>
              <textarea
                placeholder="Brief summary or study notes about this resource..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-background border border-border rounded-sm px-3.5 py-2 text-xs text-primary focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>

          {/* Target Syllabus Location */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2 font-mono">
              Assign Location
            </label>
            <SyllabusTreePicker selectedLocation={location} onSelect={setLocation} />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-secondary hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-zinc-950 rounded-sm text-xs font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Resource</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
