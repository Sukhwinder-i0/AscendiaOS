'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown, Plus, Target } from 'lucide-react';

interface ExamOption {
  id: string;
  title: string;
  code?: string | null;
}

interface ExamSelectorProps {
  currentExam: {
    id: string;
    title: string;
    code?: string | null;
  } | null;
  availableExams: ExamOption[];
  onSelectExam: (examId: string) => void;
}

export const ExamSelector: React.FC<ExamSelectorProps> = ({
  currentExam,
  availableExams,
  onSelectExam,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!currentExam && availableExams.length === 0) {
    return (
      <Link
        href="/exams"
        className="inline-flex items-center space-x-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-zinc-950 text-xs font-semibold rounded-sm transition-colors shrink-0"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Create Exam</span>
      </Link>
    );
  }

  return (
    <div className="relative inline-block text-left shrink-0">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-mono uppercase tracking-wider text-secondary hidden sm:inline">
          Exam:
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-surface border border-border hover:border-orange-500/40 rounded-sm text-xs font-semibold text-primary transition-colors focus:outline-none"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Target className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="truncate max-w-[160px] sm:max-w-[220px]">
            {currentExam ? currentExam.title : 'All Activity'}
          </span>
          {currentExam?.code && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-background border border-border text-secondary rounded-xs">
              {currentExam.code}
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-secondary shrink-0" />
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-64 bg-surface border border-border rounded-sm shadow-lg z-30 py-1 text-xs">
            <div className="px-3 py-1.5 border-b border-border text-[10px] font-mono text-secondary uppercase tracking-wider">
              Switch Exam Target
            </div>
            {availableExams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => {
                  onSelectExam(exam.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-background transition-colors ${
                  currentExam?.id === exam.id
                    ? 'text-orange-400 font-semibold bg-orange-500/5'
                    : 'text-primary'
                }`}
              >
                <span className="truncate pr-2">{exam.title}</span>
                {exam.code && (
                  <span className="text-[10px] font-mono text-secondary shrink-0">
                    {exam.code}
                  </span>
                )}
              </button>
            ))}
            <div className="border-t border-border mt-1 pt-1">
              <Link
                href="/exams"
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-3 py-2 text-orange-400 hover:bg-background flex items-center space-x-1 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Exams / Goals</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
