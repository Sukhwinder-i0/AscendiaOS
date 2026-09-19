'use client';

import React, { useState } from 'react';
import { ExtractedSubject, ExtractedChapter, ExtractedTopic } from '@studyos/shared';
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit2,
  Plus,
  Check,
  X,
  Layers,
  FileText,
} from 'lucide-react';

interface SyllabusReviewTreeProps {
  subjects: ExtractedSubject[];
  onChange: (updatedSubjects: ExtractedSubject[]) => void;
}

export function SyllabusReviewTree({ subjects, onChange }: SyllabusReviewTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: prev[id] === undefined ? false : !prev[id] }));
  };

  const startRename = (id: string, currentName: string) => {
    setEditingNodeId(id);
    setEditingName(currentName);
  };

  const saveRename = (path: number[]) => {
    if (!editingName.trim()) return;

    const newSubjects = JSON.parse(JSON.stringify(subjects)) as ExtractedSubject[];
    const [sIdx, cIdx, tIdx, stIdx] = path;

    if (stIdx !== undefined) {
      newSubjects[sIdx].chapters[cIdx].topics[tIdx].subtopics[stIdx].name = editingName.trim();
    } else if (tIdx !== undefined) {
      newSubjects[sIdx].chapters[cIdx].topics[tIdx].name = editingName.trim();
    } else if (cIdx !== undefined) {
      newSubjects[sIdx].chapters[cIdx].name = editingName.trim();
    } else if (sIdx !== undefined) {
      newSubjects[sIdx].name = editingName.trim();
    }

    onChange(newSubjects);
    setEditingNodeId(null);
  };

  const deleteNode = (path: number[]) => {
    const newSubjects = JSON.parse(JSON.stringify(subjects)) as ExtractedSubject[];
    const [sIdx, cIdx, tIdx, stIdx] = path;

    if (stIdx !== undefined) {
      newSubjects[sIdx].chapters[cIdx].topics[tIdx].subtopics.splice(stIdx, 1);
    } else if (tIdx !== undefined) {
      newSubjects[sIdx].chapters[cIdx].topics.splice(tIdx, 1);
    } else if (cIdx !== undefined) {
      newSubjects[sIdx].chapters.splice(cIdx, 1);
    } else if (sIdx !== undefined) {
      newSubjects.splice(sIdx, 1);
    }

    onChange(newSubjects);
  };

  const addNode = (path: number[], type: 'subject' | 'chapter' | 'topic' | 'subtopic') => {
    const newSubjects = JSON.parse(JSON.stringify(subjects)) as ExtractedSubject[];
    const [sIdx, cIdx, tIdx] = path;

    if (type === 'subject') {
      newSubjects.push({ name: 'New Subject', chapters: [] });
    } else if (type === 'chapter' && sIdx !== undefined) {
      newSubjects[sIdx].chapters.push({ name: 'New Chapter', topics: [] });
    } else if (type === 'topic' && sIdx !== undefined && cIdx !== undefined) {
      newSubjects[sIdx].chapters[cIdx].topics.push({ name: 'New Topic', subtopics: [] });
    } else if (type === 'subtopic' && sIdx !== undefined && cIdx !== undefined && tIdx !== undefined) {
      if (!newSubjects[sIdx].chapters[cIdx].topics[tIdx].subtopics) {
        newSubjects[sIdx].chapters[cIdx].topics[tIdx].subtopics = [];
      }
      newSubjects[sIdx].chapters[cIdx].topics[tIdx].subtopics.push({ name: 'New Subtopic' });
    }

    onChange(newSubjects);
  };

  return (
    <div className="space-y-3 bg-background/50 border border-border rounded-lg p-4 max-h-[480px] overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Proposed Syllabus Structure ({subjects.length} Subjects)
        </span>
        <button
          onClick={() => addNode([], 'subject')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-sm bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-8 text-secondary text-sm font-mono">
          No subjects extracted. Click "Add Subject" to create one manually.
        </div>
      ) : (
        subjects.map((sub: ExtractedSubject, sIdx: number) => {
          const subKey = `s-${sIdx}`;
          const isSubExpanded = expandedNodes[subKey] !== false;

          return (
            <div key={subKey} className="border border-border rounded-sm bg-surface overflow-hidden">
              {/* Subject Row */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-background/50 hover:bg-zinc-800/50 transition-colors border-b border-border">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    onClick={() => toggleExpand(subKey)}
                    className="p-1 hover:bg-zinc-800 rounded-sm text-secondary"
                  >
                    {isSubExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <BookOpen className="w-4 h-4 text-orange-500 flex-shrink-0" />

                  {editingNodeId === subKey ? (
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-background text-primary text-sm px-2 py-1 rounded-sm border border-orange-500 focus:outline-none w-full"
                        autoFocus
                      />
                      <button onClick={() => saveRename([sIdx])} className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingNodeId(null)} className="p-1 text-secondary hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold text-primary text-sm truncate">{sub.name}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => addNode([sIdx], 'chapter')}
                    title="Add Chapter"
                    className="p-1 text-secondary hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => startRename(subKey, sub.name)}
                    title="Rename Subject"
                    className="p-1 text-secondary hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteNode([sIdx])}
                    title="Delete Subject"
                    className="p-1 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chapters List */}
              {isSubExpanded && (
                <div className="pl-6 pr-2 py-2 space-y-2">
                  {sub.chapters.length === 0 ? (
                    <div className="text-xs text-secondary py-1 pl-2">No chapters in this subject.</div>
                  ) : (
                    sub.chapters.map((chap: ExtractedChapter, cIdx: number) => {
                      const chapKey = `s-${sIdx}-c-${cIdx}`;
                      const isChapExpanded = expandedNodes[chapKey] !== false;

                      return (
                        <div key={chapKey} className="border border-border rounded-md bg-surface">
                          {/* Chapter Header */}
                          <div className="flex items-center justify-between px-2.5 py-2 hover:bg-background/50 transition-colors">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <button
                                onClick={() => toggleExpand(chapKey)}
                                className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-secondary"
                              >
                                {isChapExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                              <Layers className="w-3.5 h-3.5 text-secondary flex-shrink-0" />

                              {editingNodeId === chapKey ? (
                                <div className="flex items-center gap-1 flex-1">
                                  <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="bg-background text-primary text-xs px-2 py-0.5 rounded border border-blue-500 focus:outline-none w-full"
                                    autoFocus
                                  />
                                  <button onClick={() => saveRename([sIdx, cIdx])} className="p-0.5 text-emerald-500 hover:bg-emerald-500/10 rounded">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setEditingNodeId(null)} className="p-0.5 text-secondary hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="font-medium text-primary text-xs truncate">{chap.name}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => addNode([sIdx, cIdx], 'topic')}
                                title="Add Topic"
                                className="p-1 text-secondary hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => startRename(chapKey, chap.name)}
                                title="Rename Chapter"
                                className="p-1 text-secondary hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteNode([sIdx, cIdx])}
                                title="Delete Chapter"
                                className="p-1 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Topics List */}
                          {isChapExpanded && (
                            <div className="pl-5 pr-2 py-1.5 space-y-1 border-t border-border">
                              {chap.topics.length === 0 ? (
                                <div className="text-[11px] text-secondary py-0.5 pl-2">No topics.</div>
                              ) : (
                                chap.topics.map((top: ExtractedTopic, tIdx: number) => {
                                  const topKey = `s-${sIdx}-c-${cIdx}-t-${tIdx}`;
                                  const isTopExpanded = expandedNodes[topKey] !== false;
                                  const hasSubtopics = top.subtopics && top.subtopics.length > 0;

                                  return (
                                    <div key={topKey} className="group flex flex-col">
                                      <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-background/50">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          {hasSubtopics ? (
                                            <button
                                              onClick={() => toggleExpand(topKey)}
                                              className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-secondary"
                                            >
                                              {isTopExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                            </button>
                                          ) : (
                                            <span className="w-3 h-3 text-secondary inline-block text-center">•</span>
                                          )}
                                          <FileText className="w-3 h-3 text-secondary flex-shrink-0" />

                                          {editingNodeId === topKey ? (
                                            <div className="flex items-center gap-1 flex-1">
                                              <input
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                className="bg-background text-primary text-xs px-2 py-0.5 rounded border border-blue-500 focus:outline-none w-full"
                                                autoFocus
                                              />
                                              <button onClick={() => saveRename([sIdx, cIdx, tIdx])} className="p-0.5 text-emerald-500">
                                                <Check className="w-3 h-3" />
                                              </button>
                                              <button onClick={() => setEditingNodeId(null)} className="p-0.5 text-secondary">
                                                <X className="w-3 h-3" />
                                              </button>
                                            </div>
                                          ) : (
                                            <span className="text-xs text-primary truncate">{top.name}</span>
                                          )}
                                        </div>

                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                          <button
                                            onClick={() => addNode([sIdx, cIdx, tIdx], 'subtopic')}
                                            title="Add Subtopic"
                                            className="p-0.5 text-secondary hover:text-blue-500"
                                          >
                                            <Plus className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => startRename(topKey, top.name)}
                                            title="Rename Topic"
                                            className="p-0.5 text-secondary hover:text-primary"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => deleteNode([sIdx, cIdx, tIdx])}
                                            title="Delete Topic"
                                            className="p-0.5 text-secondary hover:text-red-500"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Subtopics */}
                                      {hasSubtopics && isTopExpanded && (
                                        <div className="pl-6 space-y-1 my-0.5 border-l border-border ml-3">
                                          {top.subtopics!.map((subtop: { name: string }, stIdx: number) => {
                                            const subtopKey = `s-${sIdx}-c-${cIdx}-t-${tIdx}-st-${stIdx}`;

                                            return (
                                              <div
                                                key={subtopKey}
                                                className="group/sub flex items-center justify-between py-0.5 px-2 rounded hover:bg-background/50"
                                              >
                                                <span className="text-[11px] text-secondary truncate">{subtop.name}</span>
                                                <div className="opacity-0 group-hover/sub:opacity-100 flex items-center gap-1 transition-opacity">
                                                  <button
                                                    onClick={() => startRename(subtopKey, subtop.name)}
                                                    className="p-0.5 text-secondary hover:text-primary"
                                                  >
                                                    <Edit2 className="w-2.5 h-2.5" />
                                                  </button>
                                                  <button
                                                    onClick={() => deleteNode([sIdx, cIdx, tIdx, stIdx])}
                                                    className="p-0.5 text-secondary hover:text-red-500"
                                                  >
                                                    <Trash2 className="w-2.5 h-2.5" />
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
