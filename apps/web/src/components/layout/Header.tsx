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
          <div className="flex items-center space-x-2.5 bg-background px-3 py-1.5 rounded-sm border border-border">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="font-semibold text-xs text-primary">{activeExam.title}</span>
            {activeExam.daysRemaining !== null && activeExam.daysRemaining !== undefined && (
              <div className="flex items-center text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-sm font-mono border border-orange-500/20">
                <Clock className="w-3 h-3 mr-1 text-orange-400" />
                <span>{activeExam.daysRemaining}d left</span>
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

        <div className="flex items-center space-x-1.5 text-xs bg-background border border-border text-primary px-3 py-1.5 rounded-sm font-mono">
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span className="font-semibold text-primary">0 Day Streak</span>
        </div>

        {user && (
          <div className="flex items-center space-x-3 border-l border-border pl-4">
            <div className="w-7 h-7 rounded-sm bg-orange-600 flex items-center justify-center text-white text-xs font-bold font-mono">
              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-primary">{user.fullName}</p>
              <p className="text-[10px] text-secondary font-mono">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-secondary hover:text-red-400 hover:bg-zinc-800/60 rounded-sm transition-colors"
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
