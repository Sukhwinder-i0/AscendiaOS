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
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        {activeExam ? (
          <div className="flex items-center space-x-3 bg-slate-800/60 px-3.5 py-1.5 rounded-lg border border-slate-700/60">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-semibold text-sm text-slate-100">{activeExam.title}</span>
            {activeExam.daysRemaining !== null && activeExam.daysRemaining !== undefined && (
              <div className="flex items-center text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-medium border border-amber-400/20">
                <Clock className="w-3 h-3 mr-1" />
                <span>{activeExam.daysRemaining} days left</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-400 font-medium flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Select or Create an Exam Workspace</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 text-xs bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          <span className="font-bold text-slate-100">0 Day Streak</span>
        </div>

        {user && (
          <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-slate-200">{user.fullName}</p>
              <p className="text-[10px] text-slate-400">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
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
