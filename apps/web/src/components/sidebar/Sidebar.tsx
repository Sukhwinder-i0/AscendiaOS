'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  FolderTree,
  FileText,
  Bookmark,
  Bot,
  BrainCircuit,
  PieChart,
  Target,
  Settings,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  activeExamId?: string | null;
}

export function Sidebar({ activeExamId }: SidebarProps) {
  const pathname = usePathname();

  const primaryNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Exams', href: '/exams', icon: GraduationCap },
  ];

  const examWorkspaceNav = activeExamId
    ? [
        {
          label: 'Syllabus Tree',
          href: `/workspace/${activeExamId}/syllabus`,
          icon: FolderTree,
        },
        { label: 'Resources', href: '#', icon: Bookmark, badge: 'Soon' },
        { label: 'Notes', href: '#', icon: FileText, badge: 'Soon' },
        { label: 'AI Tutor', href: '#', icon: Bot, badge: 'Soon' },
        { label: 'Analytics', href: '#', icon: PieChart, badge: 'Soon' },
        { label: 'Goals', href: '#', icon: Target, badge: 'Soon' },
      ]
    : [];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              StudyOS
            </h1>
            <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">
              Phase 1 Core
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Main Menu
            </p>
            <nav className="space-y-1">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      active
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900',
                    )}
                  >
                    <Icon className={clsx('w-4 h-4', active ? 'text-indigo-400' : 'text-slate-400')} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {activeExamId && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Exam Workspace
              </p>
              <nav className="space-y-1">
                {examWorkspaceNav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href) && item.href !== '#';
                  const disabled = item.href === '#';
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={(e) => disabled && e.preventDefault()}
                      className={clsx(
                        'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        disabled ? 'opacity-50 cursor-not-allowed text-slate-500' : '',
                        active
                          ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                          : !disabled
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                          : '',
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={clsx('w-4 h-4', active ? 'text-indigo-400' : 'text-slate-500')} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="text-xs">
            <p className="font-medium text-slate-300">Exam Prep OS</p>
            <p className="text-slate-500">v1.0.0 Phase 1</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
