'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExamResponse } from '@studyos/shared';
import { api } from '@/lib/api';
import { CreateExamModal } from '@/components/exams/CreateExamModal';
import {
  GraduationCap,
  Plus,
  FolderTree,
  Trash2,
  Clock,
  Target,
  Award,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExams = async () => {
    try {
      const data = await api.getExams();
      setExams(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDeleteExam = async (id: string) => {
    if (confirm('Are you sure you want to delete this exam workspace and all its syllabus data?')) {
      await api.deleteExam(id);
      fetchExams();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Exams & Learning Goals</h1>
          <p className="text-xs text-slate-500">
            Create and manage exam prep workspaces for GATE, UPSC, JEE, Certifications, or custom goals.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Exam Workspace</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white p-12 rounded-xl text-center border border-dashed border-slate-300">
          <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Exam Workspaces Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            StudyOS supports arbitrary learning goals (GATE DA, GATE CS, UPSC, JEE, University courses, Certifications).
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            + Create First Exam Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-wider font-mono font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200">
                    {exam.code || 'EXAM'}
                  </span>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {exam.title}
                </h3>

                {exam.daysRemaining !== null && exam.daysRemaining !== undefined && (
                  <p className="text-xs text-amber-700 mt-1 flex items-center font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    {exam.daysRemaining} days remaining
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Overall Progress</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {exam.overallProgressPercentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${exam.overallProgressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Target Metadata */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono">
                  {exam.targetScore && (
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-blue-600" />
                      <span>Target: {exam.targetScore} pts</span>
                    </div>
                  )}
                  {exam.targetRank && (
                    <div className="flex items-center space-x-1">
                      <Award className="w-3 h-3 text-slate-500" />
                      <span>Rank: Top {exam.targetRank}</span>
                    </div>
                  )}
                </div>

                {/* Action Link */}
                <Link
                  href={`/workspace/${exam.id}/syllabus`}
                  className="flex items-center justify-center space-x-2 w-full py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg text-xs font-semibold transition-colors border border-slate-200 hover:border-blue-200"
                >
                  <FolderTree className="w-4 h-4" />
                  <span>Open Syllabus Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateExamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (dto) => {
          await api.createExam(dto);
          fetchExams();
        }}
      />
    </div>
  );
}
