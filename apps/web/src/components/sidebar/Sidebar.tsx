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
  Inbox,
  Bot,
  PieChart,
  Target,
  Clock,
  Flame,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

import { X } from 'lucide-react';

interface SidebarProps {
  activeExamId?: string | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ activeExamId, isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { logoSrc } = useTheme();

  const primaryNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Activity & Streaks', href: '/activity', icon: Flame },
    { label: 'Exams', href: '/exams', icon: GraduationCap },
    { label: 'Study History', href: '/history', icon: Clock },
    { label: 'Notes Workspace', href: '/notes', icon: FileText },
    { label: 'Resource Library', href: '/resources', icon: Bookmark },
    { label: 'Resource Inbox', href: '/resources/inbox', icon: Inbox },
  ];

  const examWorkspaceNav = activeExamId
    ? [
      {
        label: 'Syllabus Tree',
        href: `/workspace/${activeExamId}/syllabus`,
        icon: FolderTree,
      },
      {
        label: 'Resources',
        href: `/workspace/${activeExamId}/resources`,
        icon: Bookmark,
      },
      {
        label: 'Notes',
        href: `/workspace/${activeExamId}/notes`,
        icon: FileText,
      },
      { label: 'AI Tutor', href: '#', icon: Bot, badge: 'Soon' },
      { label: 'Analytics', href: '#', icon: PieChart, badge: 'Soon' },
      { label: 'Goals', href: '#', icon: Target, badge: 'Soon' },
    ]
    : [];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-surface">
      <div>
        {/* Brand Header with Theme Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-border">
          <Link href="/dashboard" onClick={onCloseMobile} className="flex items-center space-x-2 shrink-0">
            <img
              src={logoSrc}
              alt="AscendiaOS"
              className="h-8 w-auto object-contain transition-opacity duration-200"
            />
          </Link>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 md:hidden text-secondary hover:text-primary rounded-sm transition-colors"
                title="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
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
                    onClick={onCloseMobile}
                    className={clsx(
                      'flex items-center space-x-3 px-3 py-2 rounded-sm text-xs font-medium transition-colors border',
                      active
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        : 'text-secondary border-transparent hover:text-primary hover:bg-zinc-800/50',
                    )}
                  >
                    <Icon className={clsx('w-4 h-4', active ? 'text-orange-500' : 'text-secondary')} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {activeExamId && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2 font-mono">
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
                      onClick={(e) => {
                        if (disabled) e.preventDefault();
                        else if (onCloseMobile) onCloseMobile();
                      }}
                      className={clsx(
                        'flex items-center justify-between px-3 py-2 rounded-sm text-xs font-medium transition-colors border',
                        disabled ? 'opacity-40 cursor-not-allowed text-secondary border-transparent' : '',
                        active
                          ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          : !disabled
                            ? 'text-secondary border-transparent hover:text-primary hover:bg-zinc-800/50'
                            : '',
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={clsx('w-4 h-4', active ? 'text-orange-500' : 'text-secondary')} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded-sm border border-border font-mono">
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

      {/* Footer / Author Credit */}
      <div className="p-4 border-t border-border">
        <div className="bg-background rounded-sm p-3 border border-border flex flex-col space-y-1.5 font-mono">
          <div className="text-xs">
            <p className="font-semibold text-primary">Prep Infrastructure</p>
            <p className="text-secondary text-[10px]">v1.0 • Phase 6 Active</p>
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-secondary">
            <span>Created by</span>
            <a
              href="https://github.com/sukhwinder-i0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 hover:underline font-semibold transition-colors"
            >
              sukhwinder-i0
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="w-64 border-r border-border bg-surface hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-colors">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] bg-surface h-full border-r border-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
