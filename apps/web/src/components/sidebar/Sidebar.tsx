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
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900">
              StudyOS
            </h1>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
              Phase 1 Core
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                      active
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                    )}
                  >
                    <Icon className={clsx('w-4 h-4', active ? 'text-blue-600' : 'text-slate-400')} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {activeExamId && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                        'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                        disabled ? 'opacity-50 cursor-not-allowed text-slate-400' : '',
                        active
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : !disabled
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          : '',
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={clsx('w-4 h-4', active ? 'text-blue-600' : 'text-slate-400')} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
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
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center space-x-3">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="text-xs">
            <p className="font-medium text-slate-800">Exam Prep OS</p>
            <p className="text-slate-500 text-[11px]">v1.0.0 Phase 1</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
