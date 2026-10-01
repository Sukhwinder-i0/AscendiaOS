'use client';

import React, { useState } from 'react';
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
  X,
  MessageSquarePlus,
  Send,
  Bug,
  Lightbulb,
  Star,
  ChevronUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const FEEDBACK_CATEGORIES = [
  { key: 'feature', label: 'Feature',  icon: Lightbulb, color: 'text-yellow-400' },
  { key: 'bug',     label: 'Bug',      icon: Bug,        color: 'text-red-400'    },
  { key: 'praise',  label: 'Praise',   icon: Star,       color: 'text-orange-400' },
] as const;
type FeedbackCategory = typeof FEEDBACK_CATEGORIES[number]['key'];
const GITHUB_REPO = 'Sukhwinder-i0/AscendiaOS';

interface SidebarProps {
  activeExamId?: string | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ activeExamId, isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { logoSrc } = useTheme();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>('feature');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) return;
    const cat = FEEDBACK_CATEGORIES.find((c) => c.key === feedbackCategory)!;
    const title = encodeURIComponent(`[${cat.label}] ${feedbackText.slice(0, 60)}`);
    const body = encodeURIComponent(`### Category\n${cat.label}\n\n### Description\n${feedbackText}\n\n---\n*Submitted via AscendiaOS App*`);
    const label = feedbackCategory === 'bug' ? '&labels=bug' : feedbackCategory === 'feature' ? '&labels=enhancement' : '';
    window.open(`https://github.com/${GITHUB_REPO}/issues/new?title=${title}&body=${body}${label}`, '_blank');
    setFeedbackSubmitted(true);
    setTimeout(() => { setFeedbackSubmitted(false); setFeedbackText(''); setFeedbackOpen(false); }, 2000);
  };

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

      {/* Footer / Feedback + Author Credit */}
      <div className="p-4 border-t border-border space-y-2">

        {/* Feedback button + absolutely-positioned panel floating upward */}
        <div className="relative">
          {feedbackOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-zinc-700/60 rounded-sm p-3 space-y-2.5 shadow-xl shadow-black/40 z-50">
              {feedbackSubmitted ? (
                <div className="flex flex-col items-center gap-1.5 py-2 text-center">
                  <Send className="w-4 h-4 text-orange-400" />
                  <p className="text-xs font-medium text-zinc-100">Opening GitHub...</p>
                  <p className="text-[11px] text-zinc-500">Thanks! 🙏</p>
                </div>
              ) : (
                <>
                  {/* Category pills */}
                  <div className="flex gap-1.5">
                    {FEEDBACK_CATEGORIES.map((c) => {
                      const Icon = c.icon;
                      return (
                        <button
                          key={c.key}
                          onClick={() => setFeedbackCategory(c.key)}
                          className={clsx(
                            'flex items-center gap-1 px-2 py-1 rounded-sm text-[11px] font-medium border transition-all flex-1 justify-center',
                            feedbackCategory === c.key
                              ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                              : 'bg-zinc-800/50 border-zinc-700/40 text-zinc-400 hover:border-zinc-600'
                          )}
                        >
                          <Icon className={clsx('w-3 h-3', feedbackCategory === c.key ? 'text-orange-400' : c.color)} />
                          {c.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Text area */}
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={feedbackCategory === 'bug' ? 'What went wrong?' : feedbackCategory === 'feature' ? "What would you like to see?" : "What do you love?"}
                    rows={4}
                    className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-sm px-2.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-orange-500/60 transition-all"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-600">Opens GitHub issue</span>
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={!feedbackText.trim()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-semibold transition-all"
                    >
                      <Send className="w-3 h-3" />
                      Submit
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Feedback toggle button */}
          <button
            onClick={() => setFeedbackOpen((v) => !v)}
            className={clsx(
              'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-sm text-xs font-medium border transition-all',
              feedbackOpen
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                : 'bg-zinc-800/40 border-zinc-700/40 text-zinc-400 hover:border-orange-500/30 hover:text-orange-400 hover:bg-orange-500/5'
            )}
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            Feedback & Suggestions
            <ChevronUp className={clsx('w-3 h-3 ml-auto transition-transform duration-200', feedbackOpen ? '' : 'rotate-180')} />
          </button>
        </div>

        {/* Prep Infrastructure card */}
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
