'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  FolderTree,
  FileText,
  Clock,
  Bookmark,
  ArrowRight,
  Check,
  Shield,
  Layers,
  BarChart3,
  ChevronRight,
  Terminal,
  Flame,
  TrendingUp,
  Target,
  Calendar,
  Play,
  Pause,
  Plus,
  Search,
  Zap,
  BookOpen,
  Cpu,
  Database,
  ExternalLink,
  Activity,
  Award,
  CheckCircle2,
  ListChecks,
  Menu,
  X,
  HelpCircle,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const { user } = useAuth();
  const { logoSrc } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(1);
  const [activeSandboxTab, setActiveSandboxTab] = useState<'workspace' | 'syllabus' | 'resources' | 'notes' | 'timer' | 'streak' | 'analytics'>('workspace');

  const workflowSteps = [
    {
      id: 1,
      number: '01',
      title: 'Create Exam Workspace',
      subtitle: 'Define Domain & Targets',
      desc: 'Set up dedicated exam workspaces for competitive exams (GATE, UPSC, JEE, NEET, GRE). Configure target exam date, target score, and daily study quota.',
      icon: Target,
      details: [
        'Multi-exam workspace isolation',
        'Target date countdown & pace calculator',
        'Daily target hours allocation',
        'Custom workspace settings',
      ],
      mockup: {
        title: 'GATE CS 2027 Workspace Setup',
        badge: 'ACTIVE_WORKSPACE',
        content: (
          <div className="space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800 rounded-sm">
              <div>
                <div className="text-zinc-200 font-semibold">Target Exam: GATE Computer Science</div>
                <div className="text-zinc-400 text-[11px] font-mono">Exam Date: Feb 14, 2027 • 142 Days Remaining</div>
              </div>
              <span className="px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/30 font-mono text-[10px] font-bold rounded-sm">
                GOAL: 85/100 MARKS
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-sm">
                <span className="text-zinc-400 block font-mono">Target Daily Hours</span>
                <span className="text-zinc-100 font-bold font-mono">6.5 hrs/day</span>
              </div>
              <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-sm">
                <span className="text-zinc-400 block font-mono">Syllabus Target</span>
                <span className="text-emerald-400 font-bold font-mono">100% by Jan 15</span>
              </div>
            </div>
          </div>
        ),
      },
    },
    {
      id: 2,
      number: '02',
      title: 'Build Syllabus Architecture',
      subtitle: '5-Level Hierarchical Tree',
      desc: 'Deconstruct complex syllabi into clean node trees: Exam → Subject → Chapter/Module → Topic → Subtopic. Assign weightage, priority tags, and completion states.',
      icon: FolderTree,
      details: [
        'Deterministic leaf-to-root progress rollup',
        'Priority tagging (High / Medium / Low)',
        'Subject weightage percentage allocation',
        'Syllabus import / export JSON engine',
      ],
      mockup: {
        title: 'Algorithms & Data Structures Tree',
        badge: '68% COMPLETED',
        content: (
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-800 text-zinc-300">
              <span className="flex items-center space-x-2">
                <span className="text-emerald-400">✓</span>
                <span className="font-semibold">Module 1: Asymptotic Analysis</span>
              </span>
              <span className="text-emerald-400 font-bold">100%</span>
            </div>
            <div className="pl-4 space-y-1.5 border-l border-orange-500/30 ml-2">
              <div className="flex items-center justify-between p-2 bg-zinc-950 border border-orange-500/40 text-orange-300 font-semibold">
                <span className="flex items-center space-x-2">
                  <span>◐ Topic 2.3: Recurrence Relations & Master Theorem</span>
                </span>
                <span className="text-orange-400">IN_PROGRESS</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-800 text-zinc-500">
                <span className="flex items-center space-x-2">
                  <span>○ Topic 2.4: Amortized Analysis & Dynamic Tables</span>
                </span>
                <span>NOT_STARTED</span>
              </div>
            </div>
          </div>
        ),
      },
    },
    {
      id: 3,
      number: '03',
      title: 'Attach Resources & Material',
      subtitle: 'Normalized Resource Vault',
      desc: 'Link YouTube playlists, web documentation, research papers, and PDF files directly to specific syllabus nodes with zero storage duplication.',
      icon: Bookmark,
      details: [
        'Direct node-level resource binding',
        'YouTube video & playlist embedding',
        'Status tracking (To Read / In Progress / Done)',
        'Centralized vault with filter & search',
      ],
      mockup: {
        title: 'Node Attached Material: Recurrence Relations',
        badge: '3 ATTACHMENTS',
        content: (
          <div className="space-y-2 font-sans text-xs">
            <div className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-800 rounded-sm">
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-mono uppercase">VIDEO</span>
                <span className="text-zinc-200 truncate max-w-[200px]">MIT 6.006 Master Theorem Lecture</span>
              </div>
              <span className="text-emerald-400 font-mono text-[10px]">COMPLETED</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-800 rounded-sm">
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-mono uppercase">PDF</span>
                <span className="text-zinc-200 truncate max-w-[200px]">CLRS Chapter 4 Solutions.pdf</span>
              </div>
              <span className="text-orange-400 font-mono text-[10px]">READING</span>
            </div>
          </div>
        ),
      },
    },
    {
      id: 4,
      number: '04',
      title: 'Craft KaTeX & Markdown Notes',
      subtitle: 'Distraction-Free Math Notes',
      desc: 'Write technical study notes using GFM Markdown with native KaTeX LaTeX rendering ($inline$ and $$block$$ math). Formula library & topic linking included.',
      icon: FileText,
      details: [
        'Native KaTeX math equation parser',
        'Side-by-side live editor & preview',
        'Formula preset insertion shortcuts',
        'Automatic LocalStorage backup recovery',
      ],
      mockup: {
        title: 'Master Theorem Standard Form Note',
        badge: 'KaTeX ACTIVE',
        content: (
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm space-y-2 font-mono text-xs">
            <div className="text-orange-400 text-[11px] font-bold">// Master Recurrence Formula</div>
            <div className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-200 text-center rounded-sm">
              {`$$T(n) = aT\\left(\\frac{n}{b}\\right) + f(n)$$`}
            </div>
            <p className="text-zinc-400 text-[11px] font-sans">
              If {`$f(n) = O(n^{\\log_b a - \\epsilon})$`}, then {`$T(n) = \\Theta(n^{\\log_b a})$`}.
            </p>
          </div>
        ),
      },
    },
    {
      id: 5,
      number: '05',
      title: 'Execute & Log Study Sessions',
      subtitle: 'Server-Authoritative Study Engine',
      desc: 'Track dedicated study sessions with Pomodoro or Stopwatch timers. Enforces single active session rule with exact net duration math and confidence ratings.',
      icon: Clock,
      details: [
        'Server-side validation & anti-tamper log',
        'Strict 1-active-session lock across tabs',
        'Pause interval calculation & net time',
        'Post-session confidence rating (1-5 Stars)',
      ],
      mockup: {
        title: 'Active Timer: Master Theorem Practice',
        badge: 'TIMER RUNNING',
        content: (
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm text-center space-y-2">
            <div className="text-2xl font-mono font-extrabold text-orange-500 tracking-wider">
              00 : 45 : 22
            </div>
            <div className="flex justify-center items-center space-x-2 text-[11px] font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Subject: Algorithms • Net Focused Time</span>
            </div>
          </div>
        ),
      },
    },
    {
      id: 6,
      number: '06',
      title: 'Track Daily Streak & Heatmap',
      subtitle: 'Visual Consistency Calendar',
      desc: 'Maintain daily study momentum with a GitHub-style 365-day activity heatmap grid, consecutive study streak counter, and detailed session history logs.',
      icon: Flame,
      details: [
        '365-day visual activity heatmap grid',
        'Consecutive daily streak counter',
        'Total study volume calculation',
        'Recent session history audit feed',
      ],
      mockup: {
        title: 'Study Streak Activity Overview',
        badge: '🔥 18 DAY STREAK',
        content: (
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Sept 2026 Activity Grid</span>
              <span className="text-orange-400 font-bold">Total: 142.5 hrs</span>
            </div>
            <div className="grid grid-cols-12 gap-1 p-2 bg-zinc-950 border border-zinc-800 rounded-sm">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 w-3 rounded-sm ${
                    i % 5 === 0
                      ? 'bg-orange-500'
                      : i % 3 === 0
                      ? 'bg-orange-700'
                      : i % 2 === 0
                      ? 'bg-orange-900/60'
                      : 'bg-zinc-800'
                  }`}
                  title={`Day ${i + 1}`}
                />
              ))}
            </div>
          </div>
        ),
      },
    },
    {
      id: 7,
      number: '07',
      title: 'Analyze Strategic Performance',
      subtitle: 'Analytics & Mastery Insights',
      desc: 'Gain total clarity with multi-dimensional analytics: subject time distribution, completion velocity, mastery radar breakdown, and exam countdown pace projection.',
      icon: BarChart3,
      details: [
        'Subject mastery percentage radar',
        'Syllabus completion pace projection',
        'Time distribution per subject breakdown',
        'Study velocity & trend indicators',
      ],
      mockup: {
        title: 'Performance & Velocity Dashboard',
        badge: 'PACE: ON_TRACK',
        content: (
          <div className="space-y-2 font-sans text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-300">Algorithms & DS</span>
                <span className="text-orange-400 font-bold">78% Mastery</span>
              </div>
              <div className="w-full bg-zinc-950 border border-zinc-800 h-2 rounded-sm overflow-hidden">
                <div className="bg-orange-500 h-full w-[78%]"></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-300">Discrete Mathematics</span>
                <span className="text-emerald-400 font-bold">92% Mastery</span>
              </div>
              <div className="w-full bg-zinc-950 border border-zinc-800 h-2 rounded-sm overflow-hidden">
                <div className="bg-emerald-500 h-full w-[92%]"></div>
              </div>
            </div>
          </div>
        ),
      },
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <img src={logoSrc} alt="AscendiaOS" className="h-6 sm:h-7 w-auto object-contain" />
            <span className="hidden sm:inline-block text-[10px] sm:text-xs font-mono px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-sm font-semibold uppercase tracking-wider">
              AscendiaOS
            </span>
          </div>

          <nav className="hidden lg:flex items-center space-x-6 text-xs font-medium text-zinc-400">
            <a href="#workflow" className="hover:text-orange-400 transition-colors">
              How It Works
            </a>
            <a href="#syllabus" className="hover:text-orange-400 transition-colors">
              Syllabus Tree
            </a>
            <a href="#resources" className="hover:text-orange-400 transition-colors">
              Resource Vault
            </a>
            <a href="#notes" className="hover:text-orange-400 transition-colors">
              KaTeX Notes
            </a>
            <a href="#activity" className="hover:text-orange-400 transition-colors">
              Streak & Analytics
            </a>
            <a href="#faq" className="hover:text-orange-400 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center space-x-2.5 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-sm transition-all flex items-center space-x-1.5 sm:space-x-2"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-block text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-sm transition-all flex items-center space-x-1.5 sm:space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-1.5 lg:hidden text-zinc-400 hover:text-white rounded-sm transition-colors border border-zinc-800"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-orange-400" /> : <Menu className="w-5 h-5 text-orange-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-zinc-800 bg-zinc-950 p-4 space-y-3 font-mono text-xs">
            <nav className="flex flex-col space-y-2.5 text-zinc-300">
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1 border-b border-zinc-900"
              >
                01. How It Works (Step-by-Step)
              </a>
              <a
                href="#syllabus"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1 border-b border-zinc-900"
              >
                02. Syllabus Tree Architecture
              </a>
              <a
                href="#resources"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1 border-b border-zinc-900"
              >
                03. Resource Vault & Content
              </a>
              <a
                href="#notes"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1 border-b border-zinc-900"
              >
                04. KaTeX Math Notes Workspace
              </a>
              <a
                href="#activity"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1 border-b border-zinc-900"
              >
                05. Streak Activity & Heatmap
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1"
              >
                06. System FAQ
              </a>
            </nav>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 bg-orange-600 text-white text-center font-bold rounded-sm"
                >
                  Open Workspace →
                </Link>
              ) : (
                <div className="flex items-center space-x-3 w-full">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 bg-zinc-900 border border-zinc-800 text-zinc-200 text-center font-semibold rounded-sm"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 bg-orange-600 text-white text-center font-semibold rounded-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl">
              The Preparation Infrastructure for <span className="text-orange-500">Competitive Exams</span>.
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-3xl leading-relaxed">
              AscendiaOS transforms fragmented exam preparation into a unified operating system. Deconstruct complex syllabi into interactive node hierarchies, link study resources without duplication, craft distraction-free notes with KaTeX math, log focused study sessions, and track long-term streak activity and analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            <Link
              href={user ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs uppercase tracking-wider rounded-sm transition-all flex items-center justify-center space-x-2 text-center"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#workflow"
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold text-xs uppercase tracking-wider rounded-sm transition-all text-center flex items-center justify-center space-x-2"
            >
              <span>Explore Step-by-Step</span>
              <ChevronRight className="w-4 h-4 text-orange-400" />
            </a>
          </div>

          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 sm:pt-10 border-t border-zinc-800/60 text-xs">
            <div>
              <div className="text-zinc-500 uppercase tracking-wider font-mono text-[10px]">Hierarchy Lineage</div>
              <div className="text-zinc-200 font-semibold mt-1">Exam → Subject → Module → Topic</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-wider font-mono text-[10px]">Math Engine</div>
              <div className="text-zinc-200 font-semibold mt-1">Native KaTeX LaTeX ($ and $$)</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-wider font-mono text-[10px]">Timer Protocol</div>
              <div className="text-zinc-200 font-semibold mt-1">Server-Authoritative Lock</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-wider font-mono text-[10px]">Analytics & Heatmap</div>
              <div className="text-zinc-200 font-semibold mt-1">365-Day Activity & Velocity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Workflow Section */}
      <section id="workflow" className="py-20 border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="space-y-3 max-w-3xl">
            <div className="text-xs font-mono text-orange-500 uppercase tracking-wider">
              HOW ASCENDIAOS WORKS STEP-BY-STEP
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              From Workspace Creation to Exam Mastery.
            </h2>
            <p className="text-zinc-400 text-sm">
              Follow the exact 7-step lifecycle designed to organize your study schedule, track syllabus completion, capture formulas, and maximize daily consistency.
            </p>
          </div>

          {/* Step Selector Horizontal Bar */}
          <div className="flex overflow-x-auto space-x-2 border-b border-zinc-800 pb-3 scrollbar-none">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              const isActive = activeWorkflowStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveWorkflowStep(step.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-sm font-mono text-xs whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <span className={isActive ? 'text-orange-400' : 'text-zinc-500'}>{step.number}.</span>
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Showcase Card */}
          {(() => {
            const currentStep = workflowSteps.find((s) => s.id === activeWorkflowStep) || workflowSteps[0];
            const StepIcon = currentStep.icon;
            return (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-sm p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-sm flex items-center justify-center text-orange-400">
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-orange-400 font-bold uppercase tracking-wider">
                        STEP {currentStep.number} • {currentStep.subtitle}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">{currentStep.title}</h3>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-sm leading-relaxed">{currentStep.desc}</p>

                  <div className="space-y-2.5 pt-2">
                    <div className="text-xs font-mono text-zinc-400 font-semibold uppercase">Key Functionalities:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {currentStep.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4 border-t border-zinc-800">
                    <button
                      onClick={() => setActiveWorkflowStep((prev) => (prev > 1 ? prev - 1 : 7))}
                      className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono rounded-sm hover:border-zinc-700"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setActiveWorkflowStep((prev) => (prev < 7 ? prev + 1 : 1))}
                      className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-semibold rounded-sm flex items-center space-x-1"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Step Mockup Preview */}
                <div className="lg:col-span-6 bg-zinc-950 border border-zinc-800 rounded-sm p-4 space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 text-xs">
                    <span className="text-zinc-300 font-semibold">{currentStep.mockup.title}</span>
                    <span className="text-orange-400 text-[10px] font-bold">{currentStep.mockup.badge}</span>
                  </div>
                  <div className="pt-1">{currentStep.mockup.content}</div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Live Interactive Platform Sandbox Switcher */}
      <section className="py-20 bg-zinc-950 border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs font-mono text-orange-500 uppercase tracking-wider">
              INTERACTIVE PLATFORM SANDBOX
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Test Every Feature Interface live.
            </h2>
            <p className="text-zinc-400 text-sm">
              Click through the system tabs below to preview how AscendiaOS handles exam workspaces, syllabus trees, KaTeX notes, study session timers, heatmaps, and analytics.
            </p>
          </div>

          {/* Sandbox Navigation Tabs */}
          <div className="flex justify-center border-b border-zinc-800 pb-3 overflow-x-auto scrollbar-none gap-2">
            {[
              { id: 'workspace', label: '1. Exam Workspace' },
              { id: 'syllabus', label: '2. Syllabus Tree' },
              { id: 'resources', label: '3. Resource Vault' },
              { id: 'notes', label: '4. KaTeX Notes' },
              { id: 'timer', label: '5. Study Timer' },
              { id: 'streak', label: '6. Streak Heatmap' },
              { id: 'analytics', label: '7. Analytics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSandboxTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-all border whitespace-nowrap ${
                  activeSandboxTab === tab.id
                    ? 'bg-orange-600 text-white border-orange-500 font-bold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sandbox Content Container */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4 sm:p-6 min-h-[320px] flex flex-col justify-between space-y-4">
            {activeSandboxTab === 'workspace' && (
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">Active Exam Workspace: UPSC Civil Services 2027</h4>
                    <p className="text-xs text-zinc-400 font-mono">Domain: General Studies & CSAT • Target Score: 340 Marks</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold rounded-sm">
                    STATUS: ACTIVE_PREP
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm space-y-1">
                    <span className="text-zinc-400 font-mono text-[11px]">Countdown</span>
                    <div className="text-lg font-bold text-orange-400 font-mono">248 Days</div>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm space-y-1">
                    <span className="text-zinc-400 font-mono text-[11px]">Daily Quota</span>
                    <div className="text-lg font-bold text-zinc-100 font-mono">7.0 Hours/Day</div>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm space-y-1">
                    <span className="text-zinc-400 font-mono text-[11px]">Target Score</span>
                    <div className="text-lg font-bold text-emerald-400 font-mono">340 / 500</div>
                  </div>
                </div>
              </div>
            )}

            {activeSandboxTab === 'syllabus' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
                  <span>SYLLABUS TREE SPINE</span>
                  <span className="text-orange-400">TOTAL COMPLETION: 74%</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-zinc-950 border border-zinc-800 flex justify-between items-center text-zinc-200 font-bold">
                    <span>Subject 1: Modern Indian History & Polity</span>
                    <span className="text-emerald-400">88%</span>
                  </div>
                  <div className="pl-4 space-y-1 border-l border-zinc-800 ml-2">
                    <div className="p-2 bg-zinc-950 border border-zinc-800 flex justify-between text-zinc-300">
                      <span>✓ Chapter 4: Constitutional Framework & Preamble</span>
                      <span className="text-emerald-400">100%</span>
                    </div>
                    <div className="p-2 bg-zinc-950 border border-orange-500/40 flex justify-between text-orange-300 font-bold">
                      <span>◐ Chapter 5: Fundamental Rights & Directive Principles</span>
                      <span className="text-orange-400">62%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSandboxTab === 'resources' && (
              <div className="space-y-3 font-sans text-xs">
                <div className="flex justify-between items-center font-mono border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">RESOURCE VAULT ATTACHMENTS</span>
                  <span className="text-orange-400">4 ACTIVE LINKS</span>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bookmark className="w-4 h-4 text-orange-400" />
                      <div>
                        <div className="text-zinc-200 font-semibold">Laxmikanth Indian Polity PDF (6th Ed)</div>
                        <div className="text-zinc-500 font-mono text-[10px]">Attached to: Constitutional Framework</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] rounded-sm">COMPLETED</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Play className="w-4 h-4 text-red-400" />
                      <div>
                        <div className="text-zinc-200 font-semibold">Unacademy Fundamental Rights Playlist</div>
                        <div className="text-zinc-500 font-mono text-[10px]">Attached to: Fundamental Rights</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 font-mono text-[10px] rounded-sm">IN_PROGRESS</span>
                  </div>
                </div>
              </div>
            )}

            {activeSandboxTab === 'notes' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-zinc-400 border-b border-zinc-800 pb-2">
                  <span>MARKDOWN & KaTeX EDITOR PREVIEW</span>
                  <span className="text-orange-400">KaTeX ENGINE ACTIVE</span>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm space-y-2">
                  <div className="text-orange-400 font-bold">// Article 21 & Due Process Derivation</div>
                  <div className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-200 text-center font-mono">
                    {`$$\\text{Right to Life} \\implies \\text{Procedure Established by Law} \\cap \\text{Due Process}$$`}
                  </div>
                  <p className="text-zinc-400 font-sans text-[11px]">
                    Maneka Gandhi vs Union of India (1978) established that procedure under Article 21 must be just, fair, and reasonable.
                  </p>
                </div>
              </div>
            )}

            {activeSandboxTab === 'timer' && (
              <div className="space-y-4 text-center font-mono py-4">
                <div className="text-zinc-400 text-xs">// SERVER-AUTHORITATIVE STUDY TIMER</div>
                <div className="text-4xl font-extrabold text-orange-500 tracking-wider">01 : 28 : 45</div>
                <div className="flex justify-center space-x-4 text-xs font-sans">
                  <span className="px-3 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-sm font-mono">
                    Subject: Indian Polity
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-sm font-mono">
                    Status: FOCUSED
                  </span>
                </div>
              </div>
            )}

            {activeSandboxTab === 'streak' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">STREAK ACTIVITY HEATMAP</span>
                  <span className="text-orange-400 font-bold">🔥 24 DAYS STREAK</span>
                </div>
                <div className="grid grid-cols-14 gap-1 p-3 bg-zinc-950 border border-zinc-800 rounded-sm">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-3.5 w-3.5 rounded-sm ${
                        i % 4 === 0 ? 'bg-orange-500' : i % 3 === 0 ? 'bg-orange-700' : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeSandboxTab === 'analytics' && (
              <div className="space-y-3 font-sans text-xs">
                <div className="flex justify-between items-center font-mono border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">PREPARATION VELOCITY METRICS</span>
                  <span className="text-emerald-400 font-bold">VELOCITY: +18% / WEEK</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm">
                    <span className="text-zinc-500 text-[10px]">TOTAL STUDY HOURS</span>
                    <div className="text-xl font-bold text-white">324.5 Hrs</div>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-sm">
                    <span className="text-zinc-500 text-[10px]">SYLLABUS COVERAGE</span>
                    <div className="text-xl font-bold text-orange-400">82.4%</div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>AscendiaOS Interface Version 2.4.0</span>
              <Link href={user ? '/dashboard' : '/register'} className="text-orange-400 hover:underline flex items-center space-x-1">
                <span>Launch full interactive app</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core System Pillars Breakdown */}
      <section id="features" className="py-20 border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-mono text-orange-500 uppercase tracking-wider">
              SYSTEM INFRASTRUCTURE PILLARS
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Engineered Specifically for High-Stakes Exams.
            </h2>
            <p className="text-zinc-400 text-sm">
              Generic note apps fail when managing complex competitive exam preparation. AscendiaOS builds structural clarity directly into every tool.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1: Exam Workspace */}
            <div id="workspace" className="bg-zinc-900/60 border border-zinc-800 p-6 space-y-4 rounded-sm">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 rounded-sm">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Exam Workspace Isolation</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Isolate preparation by exam target (GATE, UPSC, JEE, NEET). Manage target dates, score goals, and target daily study hours independently.
              </p>
            </div>

            {/* Pillar 2: Syllabus Tree */}
            <div id="syllabus" className="bg-zinc-900/60 border border-zinc-800 p-6 space-y-4 rounded-sm">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 rounded-sm">
                <FolderTree className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">5-Tier Hierarchical Lineage</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Break syllabi down to Exam → Subject → Module → Topic → Subtopic. Automatic progress rollups calculate completion percentage mathematically.
              </p>
            </div>

            {/* Pillar 3: Resource Vault */}
            <div id="resources" className="bg-zinc-900/60 border border-zinc-800 p-6 space-y-4 rounded-sm">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 rounded-sm">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Normalized Resource Vault</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Attach YouTube playlists, web documentation, and PDFs directly to syllabus nodes or keep them in the Inbox. Zero duplicate binary storage.
              </p>
            </div>

            {/* Pillar 4: KaTeX Notes */}
            <div id="notes" className="bg-zinc-900/60 border border-zinc-800 p-6 space-y-4 rounded-sm">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 rounded-sm">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Markdown & KaTeX Math</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Write distraction-free study notes with native LaTeX equation rendering ({'$inline$'} and {'$$block$$'}). Built-in LocalStorage backup prevents accidental loss.
              </p>
            </div>

            {/* Pillar 5: Study Engine */}
            <div id="timer" className="bg-zinc-900/60 border border-zinc-800 p-6 space-y-4 rounded-sm">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 rounded-sm">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Server-Authoritative Session Engine</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Record focused study sessions with pause intervals and recovery. Enforces max 1 active session rule with exact net duration math and confidence scores.
              </p>
            </div>

            {/* Pillar 6: Streak Activity & Heatmap */}
            <div id="activity" className="bg-zinc-900/60 border border-zinc-800 p-6 space-y-4 rounded-sm">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 rounded-sm">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Streak Activity & Analytics</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Maintain continuous study momentum with a GitHub-style activity calendar grid, streak tracking, subject mastery radar, and velocity insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section id="faq" className="py-20 bg-zinc-950 border-b border-zinc-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono text-orange-500 uppercase tracking-wider">SYSTEM FAQ</div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Frequently Asked Questions.
            </h2>
            <p className="text-zinc-400 text-sm">
              Everything you need to know about setting up your exam workspace and using AscendiaOS.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-sm space-y-2">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-orange-400" />
                <span>How does the 5-tier syllabus tree progress rollup work?</span>
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed pl-6">
                When you mark leaf subtopics or topics as completed, AscendiaOS mathematically rolls up the weightage to parent modules, subjects, and the root exam level automatically.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-sm space-y-2">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-orange-400" />
                <span>Can I format complex mathematical and physics equations in notes?</span>
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed pl-6">
                Yes! AscendiaOS integrates native KaTeX LaTeX rendering. Simply wrap inline math in single dollar signs ({'$E=mc^2$'}) and block equations in double dollar signs ({'$$ \\int_{a}^{b} f(x) dx $$'}).
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-sm space-y-2">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-orange-400" />
                <span>How does the server-authoritative timer prevent accidental time loss?</span>
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed pl-6">
                The session timer protocol communicates directly with the backend database API. If you close your browser tab or switch devices, your timer session remains lock-synced and active without data loss.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-sm space-y-2">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-orange-400" />
                <span>What is the streak activity heatmap?</span>
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed pl-6">
                The streak heatmap logs your focused study minutes every day onto a 365-day calendar grid. It tracks your current consecutive streak, total study hours, and daily average volume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-block px-3.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-mono uppercase tracking-wider rounded-sm font-semibold">
            READY FOR STRUCTURED PREPARATION
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Take Control of Your Exam Strategy.
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
            Build your first exam workspace, structure your syllabus tree, link your study materials, and track focused study sessions today.
          </p>

          <div className="pt-4 flex justify-center">
            <Link
              href={user ? '/dashboard' : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 bg-zinc-950 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-zinc-200 font-bold font-sans">AscendiaOS</span>
            <span>—</span>
            <span>The Competitive Exam Preparation Infrastructure</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400">
            <a href="#workflow" className="hover:text-orange-400 transition-colors">How It Works</a>
            <a href="#syllabus" className="hover:text-orange-400 transition-colors">Syllabus</a>
            <a href="#notes" className="hover:text-orange-400 transition-colors">Notes & Math</a>
            <a href="#activity" className="hover:text-orange-400 transition-colors">Streak & Analytics</a>
            <a href="#faq" className="hover:text-orange-400 transition-colors">FAQ</a>
          </div>

          <div>
            © {new Date().getFullYear()} AscendiaOS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
