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
  PieChart,
  Target,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface SidebarProps {
  activeExamId?: string | null;
}

export function Sidebar({ activeExamId }: SidebarProps) {
  const pathname = usePathname();
  const { logoSrc } = useTheme();

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
    <aside className="w-64 border-r border-border bg-surface flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-colors">
      <div>
        {/* Brand Header with Theme Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-border">
          <Link href="/dashboard" className="flex items-center space-x-2 shrink-0">
            <img
              src={logoSrc}
              alt="Exam COMPETII"
              className="h-8 w-auto object-contain transition-opacity duration-200"
            />
          </Link>
          <ThemeToggle />
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2">
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
                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        : 'text-secondary hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800/60',
                    )}
                  >
                    <Icon className={clsx('w-4 h-4', active ? 'text-blue-500' : 'text-secondary')} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {activeExamId && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2">
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
                        disabled ? 'opacity-40 cursor-not-allowed text-secondary' : '',
                        active
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          : !disabled
                            ? 'text-secondary hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800/60'
                            : '',
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={clsx('w-4 h-4', active ? 'text-blue-500' : 'text-secondary')} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-secondary px-1.5 py-0.5 rounded border border-border font-mono">
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
      <div className="p-4 border-t border-border">
        <div className="bg-background rounded-lg p-3 border border-border flex items-center space-x-3">
          <div className="text-xs">
            <p className="font-medium text-primary">Exam Prep OS</p>
            <p className="text-secondary text-[11px]">v1.0.2 Phase 2</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
