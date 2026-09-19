'use client';

import React from 'react';
import { FileText, Sigma, BookOpen, AlertTriangle, Clock, Layers, X } from 'lucide-react';
import { clsx } from 'clsx';

export type NoteTemplateType =
  | 'STANDARD'
  | 'FORMULA_SHEET'
  | 'CONCEPT_SUMMARY'
  | 'MISTAKE_LOG'
  | 'REVISION_NOTES';

interface NoteTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: NoteTemplateType) => void;
}

export function NoteTemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate,
}: NoteTemplateSelectorProps) {
  if (!isOpen) return null;

  const templates: Array<{
    id: NoteTemplateType;
    title: string;
    description: string;
    icon: any;
    color: string;
  }> = [
    {
      id: 'STANDARD',
      title: 'Blank Note',
      description: 'Start with a clean distraction-free document',
      icon: FileText,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    },
    {
      id: 'FORMULA_SHEET',
      title: 'Formula Sheet',
      description: 'Pre-formatted structure with KaTeX LaTeX equations, variables, prerequisites, and solved examples',
      icon: Sigma,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      id: 'CONCEPT_SUMMARY',
      title: 'Concept Summary',
      description: 'High-yield breakdown covering overview, key definitions, main principles, and takeaways',
      icon: BookOpen,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'MISTAKE_LOG',
      title: 'Mistake Log',
      description: 'Track tricky practice problems, wrong initial approaches, correct solutions, and prevention rules',
      icon: AlertTriangle,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'REVISION_NOTES',
      title: '30-Second Revision',
      description: 'Last-minute review sheet with high-yield points, core equations, and memory anchors',
      icon: Clock,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-sm max-w-xl w-full p-6 space-y-5 shadow-none">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary tracking-tight">Choose Note Template</h3>
              <p className="text-xs text-secondary mt-0.5">Select a structured study layout to start writing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-secondary hover:text-primary hover:bg-zinc-800 rounded-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-1">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.id}
                onClick={() => {
                  onSelectTemplate(tpl.id);
                  onClose();
                }}
                className="group flex items-start space-x-3.5 p-3.5 rounded-sm border border-border bg-background/50 hover:bg-background hover:border-orange-500/40 cursor-pointer transition-all"
              >
                <div className={clsx('w-10 h-10 rounded-sm border flex items-center justify-center shrink-0', tpl.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-primary group-hover:text-orange-400 transition-colors tracking-tight">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-secondary mt-0.5 leading-relaxed font-sans">
                    {tpl.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
