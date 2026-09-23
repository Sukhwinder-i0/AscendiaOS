'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import {
  DocumentResponse,
  ExtractedSubject,
} from '@ascendiaos/shared';
import { SyllabusReviewTree } from './SyllabusReviewTree';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';

interface SyllabusImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetExamId?: string;
  onImportSuccess?: (examId: string) => void;
}

export function SyllabusImportDialog({
  isOpen,
  onClose,
  targetExamId,
  onImportSuccess,
}: SyllabusImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [documentResult, setDocumentResult] = useState<DocumentResponse | null>(null);
  const [subjects, setSubjects] = useState<ExtractedSubject[]>([]);
  const [examTitle, setExamTitle] = useState<string>('');

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type === 'application/pdf') {
        setFile(selected);
        setError(null);
      } else {
        setError('Only PDF files are supported.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type === 'application/pdf') {
        setFile(selected);
        setError(null);
      } else {
        setError('Only PDF files are supported.');
      }
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const doc = await api.uploadSyllabus(file, targetExamId);
      setDocumentResult(doc);

      if (doc.status === 'FAILED') {
        setError(doc.errorMessage || 'PDF extraction failed. Scanned/image PDF detected.');
      } else if (doc.extractedHierarchy) {
        setSubjects(doc.extractedHierarchy.subjects || []);
        setExamTitle(doc.extractedHierarchy.title || file.name.replace(/\.pdf$/i, ''));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process syllabus PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!documentResult) return;

    setApproving(true);
    setError(null);

    try {
      const result = await api.approveSyllabusImport(documentResult.id, {
        targetExamId,
        examTitle: examTitle.trim(),
        subjects,
      });

      if (onImportSuccess) {
        onImportSuccess(result.examId);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to approve and save syllabus hierarchy');
    } finally {
      setApproving(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setLoading(false);
    setApproving(false);
    setError(null);
    setDocumentResult(null);
    setSubjects([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-surface border border-border rounded-sm shadow-none overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-base font-bold text-primary tracking-tight">AI Syllabus PDF Import</h2>
              <p className="text-xs text-secondary mt-0.5">Upload a syllabus PDF to automatically extract hierarchy</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="p-1.5 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-sm text-red-400 text-xs font-mono">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!documentResult || documentResult.status === 'FAILED' ? (
            /* Upload & Analyze Step */
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-border hover:border-orange-500/50 rounded-sm p-8 text-center bg-background/50 transition-colors flex flex-col items-center justify-center min-h-[220px]"
              >
                <UploadCloud className="w-12 h-12 text-secondary mb-3" />
                <p className="text-sm font-medium text-primary mb-1">
                  Drag and drop your syllabus PDF here
                </p>
                <p className="text-xs text-secondary mb-4 font-mono">PDF documents up to 25MB supported</p>

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-surface hover:bg-zinc-800 text-primary text-xs font-semibold border border-border transition-colors">
                  <span>Browse Files</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {file && (
                <div className="flex items-center justify-between p-3.5 bg-background border border-border rounded-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs font-medium text-primary">{file.name}</p>
                      <p className="text-[11px] text-secondary font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={handleUploadAndAnalyze}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-zinc-950 text-xs font-semibold rounded-sm transition-all duration-150 active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing AI...</span>
                      </>
                    ) : (
                      <>
                        <span>Process Syllabus</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Review & Edit Preview Step */
            <div className="space-y-4">
              {/* Classification Badges */}
              <div className="flex items-center justify-between p-3.5 bg-background border border-border rounded-sm font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-secondary">Classification:</span>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-sm bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    {documentResult.documentType || 'FULL_EXAM_SYLLABUS'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-secondary">AI Confidence:</span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {((documentResult.aiConfidence || 0.9) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Exam Title Field if creating new exam */}
              {!targetExamId && (
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full bg-background text-primary text-sm px-3 py-2 rounded-sm border border-border focus:outline-none focus:border-orange-500"
                    placeholder="e.g., GATE / UGC / UPSC 2027"
                  />
                </div>
              )}

              {/* Warnings alert if any */}
              {documentResult.warnings && documentResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-sm text-amber-400 text-xs space-y-1 font-mono">
                  <span className="font-semibold block text-amber-400">AI Extraction Warnings:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {documentResult.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Review Tree */}
              <SyllabusReviewTree subjects={subjects} onChange={setSubjects} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-background/50">
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-secondary hover:text-primary rounded-sm transition-colors"
          >
            Cancel
          </button>

          {documentResult && documentResult.status === 'READY_FOR_REVIEW' && (
            <button
              onClick={handleApprove}
              disabled={approving || subjects.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-sm transition-colors"
            >
              {approving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Import Syllabus</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
