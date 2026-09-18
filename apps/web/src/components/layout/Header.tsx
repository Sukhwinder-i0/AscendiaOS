'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Flame, Clock } from 'lucide-react';
import { ExamResponse } from '@studyos/shared';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface HeaderProps {
  activeExam?: ExamResponse | null;
}

export function Header({ activeExam }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center space-x-4">
        {activeExam ? (
          <div className="flex items-center space-x-2.5 bg-background px-3 py-1.5 rounded-lg border border-border">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-semibold text-xs text-primary">{activeExam.title}</span>
            {activeExam.daysRemaining !== null && activeExam.daysRemaining !== undefined && (
              <div className="flex items-center text-[11px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-medium border border-amber-500/20">
                <Clock className="w-3 h-3 mr-1 text-amber-500" />
                <span>{activeExam.daysRemaining} days left</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-secondary font-medium flex items-center space-x-2">
            <span>Select or Create an Exam Workspace</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />

        <div className="flex items-center space-x-1.5 text-xs bg-background border border-border text-primary px-3 py-1.5 rounded-lg">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-primary">0 Day Streak</span>
        </div>

        {user && (
          <div className="flex items-center space-x-3 border-l border-border pl-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-primary">{user.fullName}</p>
              <p className="text-[10px] text-secondary">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-secondary hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
