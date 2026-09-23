'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { SyllabusTreeResponse, ProgressStatus } from '@ascendiaos/shared';
import { api } from '@/lib/api';
import { SyllabusTree } from '@/components/syllabus/SyllabusTree';

export default function SyllabusWorkspacePage() {
  const params = useParams();
  const examId = params.examId as string;

  const [tree, setTree] = useState<SyllabusTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTree = useCallback(async () => {
    if (!examId) return;
    try {
      const data = await api.getSyllabusTree(examId);
      setTree(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load syllabus tree');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // Subject Handlers
  const handleAddSubject = async (name: string, colorHex?: string) => {
    await api.createSubject(examId, { name, colorHex });
    await fetchTree();
  };

  const handleUpdateSubject = async (subjectId: string, name: string, colorHex?: string) => {
    await api.updateSubject(subjectId, { name, colorHex });
    await fetchTree();
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (confirm('Are you sure you want to delete this subject and all its chapters and topics?')) {
      await api.deleteSubject(subjectId);
      await fetchTree();
    }
  };

  // Chapter Handlers
  const handleAddChapter = async (subjectId: string, name: string) => {
    await api.createChapter(subjectId, { name });
    await fetchTree();
  };

  const handleUpdateChapter = async (chapterId: string, name: string) => {
    await api.updateChapter(chapterId, { name });
    await fetchTree();
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (confirm('Are you sure you want to delete this chapter and all its topics?')) {
      await api.deleteChapter(chapterId);
      await fetchTree();
    }
  };

  // Topic & Subtopic Handlers
  const handleAddTopic = async (chapterId: string, name: string) => {
    await api.createTopic(chapterId, { name });
    await fetchTree();
  };

  const handleAddSubtopic = async (parentId: string, name: string) => {
    // Find parent topic to get chapterId
    let chapterId = '';
    if (tree) {
      for (const s of tree.subjects) {
        for (const c of s.chapters) {
          for (const t of c.topics) {
            if (t.id === parentId) chapterId = c.id;
          }
        }
      }
    }
    await api.createTopic(chapterId, { name, parentId });
    await fetchTree();
  };

  const handleUpdateTopic = async (topicId: string, name: string) => {
    await api.updateTopic(topicId, { name });
    await fetchTree();
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (confirm('Delete this topic and any subtopics?')) {
      await api.deleteTopic(topicId);
      await fetchTree();
    }
  };

  const handleUpdateStatus = async (topicId: string, status: ProgressStatus) => {
    await api.updateTopicProgress(topicId, { status });
    await fetchTree();
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-zinc-500">Loading syllabus hierarchy...</p>
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="bg-surface p-8 rounded-sm text-center border border-red-500/20">
        <p className="text-xs font-medium text-red-400">{error || 'Syllabus tree not found.'}</p>
        <button
          onClick={fetchTree}
          className="mt-4 px-4 py-2 bg-background text-primary text-xs font-medium rounded-sm border border-zinc-800 hover:bg-zinc-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SyllabusTree
        tree={tree}
        onRefresh={fetchTree}
        onAddSubject={handleAddSubject}
        onUpdateSubject={handleUpdateSubject}
        onDeleteSubject={handleDeleteSubject}
        onAddChapter={handleAddChapter}
        onUpdateChapter={handleUpdateChapter}
        onDeleteChapter={handleDeleteChapter}
        onAddTopic={handleAddTopic}
        onUpdateTopic={handleUpdateTopic}
        onDeleteTopic={handleDeleteTopic}
        onAddSubtopic={handleAddSubtopic}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
