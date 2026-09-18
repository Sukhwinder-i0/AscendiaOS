'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Flame, Clock, Sparkles } from 'lucide-react';
import { ExamResponse } from '@studyos/shared';

interface HeaderProps {
  activeExam?: ExamResponse | null;
}

export function Header({ activeExam }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        {activeExam ? (
          <div className="flex items-center space-x-2.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-semibold text-xs text-slate-900">{activeExam.title}</span>
            {activeExam.daysRemaining !== null && activeExam.daysRemaining !== undefined && (
              <div className="flex items-center text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200">
                <Clock className="w-3 h-3 mr-1 text-amber-500" />
                <span>{activeExam.daysRemaining} days left</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-medium flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Select or Create an Exam Workspace</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-xs bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-slate-800">0 Day Streak</span>
        </div>

        {user && (
          <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-slate-900">{user.fullName}</p>
              <p className="text-[10px] text-slate-500">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
