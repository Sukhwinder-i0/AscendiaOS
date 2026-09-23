'use client';

import React, { useState, useEffect } from 'react';
import { SyllabusTreeResponse, ResourceLocationType } from '@ascendiaos/shared';
import { api } from '@/lib/api';
import { FolderTree, Inbox, ChevronRight, ChevronDown, BookOpen, Layers, Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface LocationSelection {
  locationType: ResourceLocationType;
  examId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  topicId?: string | null;
}

interface SyllabusTreePickerProps {
  selectedLocation: LocationSelection;
  onSelect: (location: LocationSelection) => void;
  examId?: string | null;
}

export function SyllabusTreePicker({ selectedLocation, onSelect, examId }: SyllabusTreePickerProps) {
  const [tree, setTree] = useState<SyllabusTreeResponse | null>(null);
  const [exams, setExams] = useState<Array<{ id: string; title: string }>>([]);
  const [activeExamId, setActiveExamId] = useState<string>(examId || '');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await api.getExams();
        setExams(data.map((e) => ({ id: e.id, title: e.title })));
        if (!activeExamId && data.length > 0) {
          setActiveExamId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load exams:', err);
      }
    }
    loadExams();
  }, [examId]);

  useEffect(() => {
    async function loadTree() {
      if (!activeExamId) return;
      try {
        setLoading(true);
        const data = await api.getSyllabusTree(activeExamId);
        setTree(data);
      } catch (err) {
        console.error('Failed to load syllabus tree:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTree();
  }, [activeExamId]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isSelected = (type: ResourceLocationType, id?: string | null) => {
    if (type === 'INBOX' && selectedLocation.locationType === 'INBOX') return true;
    if (type === 'EXAM' && selectedLocation.locationType === 'EXAM' && selectedLocation.examId === activeExamId) return true;
    if (type === 'SUBJECT' && selectedLocation.locationType === 'SUBJECT' && selectedLocation.subjectId === id) return true;
    if (type === 'CHAPTER' && selectedLocation.locationType === 'CHAPTER' && selectedLocation.chapterId === id) return true;
    if (type === 'TOPIC' && selectedLocation.locationType === 'TOPIC' && selectedLocation.topicId === id) return true;
    return false;
  };

  return (
    <div className="space-y-3 bg-surface p-4 rounded-sm border border-border">
      {/* Exam Selector if multiple exams exist */}
      {exams.length > 1 && (
        <div className="flex items-center space-x-2 pb-2 border-b border-border">
          <span className="text-xs font-semibold text-secondary uppercase font-mono">Select Exam:</span>
          <select
            value={activeExamId}
            onChange={(e) => setActiveExamId(e.target.value)}
            className="bg-background border border-border rounded-sm px-2.5 py-1 text-xs text-primary focus:outline-none focus:border-orange-500 font-mono"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Location Tree */}
      <div className="space-y-1 max-h-64 overflow-y-auto pr-1 font-mono">
        {/* Inbox Option */}
        <div
          onClick={() => onSelect({ locationType: 'INBOX' })}
          className={clsx(
            'flex items-center justify-between p-2 rounded-sm cursor-pointer text-xs font-semibold transition-colors border',
            isSelected('INBOX')
              ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
              : 'border-transparent text-primary hover:bg-background'
          )}
        >
          <div className="flex items-center space-x-2">
            <Inbox className="w-4 h-4 text-orange-500" />
            <span>Resource Inbox (Unassigned)</span>
          </div>
          {isSelected('INBOX') && <Check className="w-4 h-4 text-orange-400" />}
        </div>

        {/* Exam Level Option */}
        {activeExamId && (
          <div
            onClick={() => onSelect({ locationType: 'EXAM', examId: activeExamId })}
            className={clsx(
              'flex items-center justify-between p-2 rounded-sm cursor-pointer text-xs font-semibold transition-colors border ml-2',
              isSelected('EXAM')
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                : 'border-transparent text-primary hover:bg-background'
            )}
          >
            <div className="flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-orange-500" />
              <span>Full Exam Scope</span>
            </div>
            {isSelected('EXAM') && <Check className="w-4 h-4 text-orange-400" />}
          </div>
        )}

        {/* Syllabus Nodes */}
        {loading ? (
          <div className="p-4 text-center text-xs text-secondary font-mono">Loading syllabus structure...</div>
        ) : tree ? (
          tree.subjects.map((sub) => {
            const subExpanded = expandedNodes[sub.id];
            return (
              <div key={sub.id} className="ml-3 space-y-0.5">
                {/* Subject Node */}
                <div
                  onClick={() =>
                    onSelect({
                      locationType: 'SUBJECT',
                      examId: tree.examId,
                      subjectId: sub.id,
                    })
                  }
                  className={clsx(
                    'flex items-center justify-between p-2 rounded-sm cursor-pointer text-xs font-semibold transition-colors border',
                    isSelected('SUBJECT', sub.id)
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                      : 'border-transparent text-primary hover:bg-background'
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => toggleExpand(sub.id, e)}
                      className="p-0.5 hover:bg-zinc-800 rounded-sm"
                    >
                      {subExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                    <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                    <span>{sub.name}</span>
                  </div>
                  {isSelected('SUBJECT', sub.id) && <Check className="w-3.5 h-3.5 text-orange-400" />}
                </div>

                {/* Chapters */}
                {subExpanded &&
                  sub.chapters.map((chap) => {
                    const chapExpanded = expandedNodes[chap.id];
                    return (
                      <div key={chap.id} className="ml-4 space-y-0.5">
                        <div
                          onClick={() =>
                            onSelect({
                              locationType: 'CHAPTER',
                              examId: tree.examId,
                              subjectId: sub.id,
                              chapterId: chap.id,
                            })
                          }
                          className={clsx(
                            'flex items-center justify-between p-1.5 rounded-sm cursor-pointer text-xs transition-colors border',
                            isSelected('CHAPTER', chap.id)
                              ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-semibold'
                              : 'border-transparent text-secondary hover:bg-background'
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => toggleExpand(chap.id, e)}
                              className="p-0.5 hover:bg-zinc-800 rounded-sm"
                            >
                              {chapExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                            </button>
                            <Layers className="w-3.5 h-3.5" />
                            <span>{chap.name}</span>
                          </div>
                          {isSelected('CHAPTER', chap.id) && <Check className="w-3.5 h-3.5 text-orange-400" />}
                        </div>

                        {/* Topics */}
                        {chapExpanded &&
                          chap.topics.map((top) => (
                            <div
                              key={top.id}
                              onClick={() =>
                                onSelect({
                                  locationType: 'TOPIC',
                                  examId: tree.examId,
                                  subjectId: sub.id,
                                  chapterId: chap.id,
                                  topicId: top.id,
                                })
                              }
                              className={clsx(
                                'flex items-center justify-between p-1.5 pl-6 rounded-sm cursor-pointer text-xs transition-colors border ml-2',
                                isSelected('TOPIC', top.id)
                                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-semibold'
                                  : 'border-transparent text-secondary hover:bg-background'
                              )}
                            >
                              <span>{top.name}</span>
                              {isSelected('TOPIC', top.id) && <Check className="w-3.5 h-3.5 text-orange-400" />}
                            </div>
                          ))}
                      </div>
                    );
                  })}
              </div>
            );
          })
        ) : null}
      </div>
    </div>
  );
}
