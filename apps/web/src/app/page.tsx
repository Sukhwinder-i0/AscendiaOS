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
} from 'lucide-react';

import { useState } from 'react';

export default function HomePage() {
  const { user } = useAuth();
  const { logoSrc } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <img src={logoSrc} alt="Exam COMPETII" className="h-6 sm:h-7 w-auto object-contain" />
            <span className="hidden sm:inline-block text-[10px] sm:text-xs font-mono px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-sm font-semibold uppercase tracking-wider">
              COMPETII OS
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-orange-400 transition-colors">
              Syllabus Architecture
            </a>
            <a href="#resources" className="hover:text-orange-400 transition-colors">
              Resource Vault
            </a>
            <a href="#notes" className="hover:text-orange-400 transition-colors">
              Markdown & Math
            </a>
            <a href="#tracking" className="hover:text-orange-400 transition-colors">
              Timer & Engine
            </a>
          </nav>

          <div className="flex items-center space-x-2.5 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-sm transition-all flex items-center space-x-1.5 sm:space-x-2"
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
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-sm transition-all flex items-center space-x-1.5 sm:space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-1.5 md:hidden text-zinc-400 hover:text-white rounded-sm transition-colors"
              title="Toggle Menu"
            >
              <Layers className="w-5 h-5 text-orange-400" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-800 bg-zinc-950 p-4 space-y-3 font-mono text-xs">
            <nav className="flex flex-col space-y-2.5 text-zinc-300">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1"
              >
                Syllabus Architecture
              </a>
              <a
                href="#resources"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1"
              >
                Resource Vault
              </a>
              <a
                href="#notes"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1"
              >
                Markdown & Math
              </a>
              <a
                href="#tracking"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-orange-400 py-1"
              >
                Timer & Engine
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
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl">
            The Preparation Infrastructure for <span className="text-orange-500">Competitive Exams</span>.
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
            Deconstruct complex exam syllabi into interactive hierarchies, link study material without duplication, write distraction-free notes with LaTeX, and track focused study sessions with mathematical precision.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            <Link
              href={user ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-5 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs uppercase tracking-wider rounded-sm transition-all flex items-center justify-center space-x-2 text-center"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold text-xs uppercase tracking-wider rounded-sm transition-all text-center flex items-center justify-center"
            >
              Explore Architecture
            </a>
          </div>

          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 sm:pt-10 border-t border-zinc-800/60 text-xs">
            <div>
              <div className="text-zinc-500 uppercase tracking-wider font-mono text-[10px]">Hierarchy</div>
              <div className="text-zinc-200 font-semibold mt-1">Exam → Subject → Topic</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-wider font-mono text-[10px]">Math Engine</div>
              <div className="text-zinc-200 font-semibold mt-1">Native KaTeX LaTeX</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-wider font-mono text-[10px]">Timer</div>
              <div className="text-zinc-200 font-semibold mt-1">Server-Authoritative</div>
            </div>
            <div>
              <div className="text-zinc-500 uppercase tracking-wider font-mono text-[10px]">Data Integrity</div>
              <div className="text-zinc-200 font-semibold mt-1">100% Deterministic</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Platform Mockup Preview */}
      <section className="py-12 sm:py-16 bg-zinc-950/60 border-b border-zinc-800/80 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>// PLATFORM INTERFACE PREVIEW</span>
            <span className="hidden sm:inline">OS4STUDY MONOLITH</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-3 sm:p-4 space-y-4 font-mono overflow-x-auto">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-zinc-700 rounded-sm inline-block"></span>
                <span className="w-3 h-3 bg-zinc-700 rounded-sm inline-block"></span>
                <span className="w-3 h-3 bg-zinc-700 rounded-sm inline-block"></span>
                <span className="text-xs text-zinc-400 font-sans ml-2">
                  COMPETII / GATE DA / Probability & Statistics
                </span>
              </div>
              <span className="text-xs text-orange-400 font-mono">Status: ACTIVE_LEARNING</span>
            </div>

            {/* Mock content grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs font-sans">
              <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-3">
                <div className="text-xs font-semibold text-orange-400 font-mono flex items-center justify-between">
                  <span>SYLLABUS SPINE</span>
                  <span>68%</span>
                </div>
                <div className="space-y-2 text-zinc-300">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>✓ Conditional Probability</span>
                    <span>100%</span>
                  </div>
                  <div className="flex items-center justify-between text-orange-400 font-semibold">
                    <span>◐ Bayes Theorem</span>
                    <span>52m</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-500">
                    <span>○ Random Variables</span>
                    <span>0m</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-3 md:col-span-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">NOTE: Bayes Theorem Formulation</span>
                  <span className="text-orange-400">KaTeX Active</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-sm text-zinc-300 font-mono text-xs leading-relaxed">
                  {`$$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$`}
                  <p className="text-zinc-400 font-sans text-xs mt-2">
                    Where {`$P(A|B)$`} is the posterior probability given prior evidence {`$P(A)$`}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section id="features" className="py-20 border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-mono text-orange-500 uppercase tracking-wider">
              CORE SYSTEM PILLARS
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Engineered for Serious Preparation.
            </h2>
            <p className="text-zinc-400 text-sm">
              Generic note-taking tools fail under complex exam structures. COMPETII provides structured syllabus lineage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div id="syllabus" className="bg-zinc-900/60 border border-zinc-800 p-6 space-y-4 rounded-sm">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <FolderTree className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Hierarchical Syllabus Spine</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Break down any exam into clean 5-level trees: Exam → Subject → Chapter → Topic → Subtopic. Automatic context lineage maintains completion percentages deterministically.
              </p>
            </div>

            {/* Pillar 2 */}
            <div id="resources" className="bg-zinc-900/60 border border-zinc-800 p-6 space-y-4 rounded-sm">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Normalized Resource Vault</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Attach YouTube playlists, web documentation, and PDFs directly to syllabus nodes or keep them in the Inbox. Zero duplicate binary storage.
              </p>
            </div>

            {/* Pillar 3 */}
            <div id="notes" className="bg-zinc-900/60 border border-zinc-800 p-6 space-y-4 rounded-sm">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Markdown & KaTeX Math Workspace</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Write distraction-free study notes with native LaTeX equation rendering ($inline$ and $$block$$). Built-in LocalStorage backup prevents accidental loss.
              </p>
            </div>

            {/* Pillar 4 */}
            <div id="tracking" className="bg-zinc-900/60 border border-zinc-800 p-6 space-y-4 rounded-sm">
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Server-Authoritative Session Engine</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Record focused study sessions with pause intervals and recovery. Enforces max 1 active session rule with exact net duration math and confidence scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="inline-block px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-mono uppercase tracking-wider rounded-sm">
            READY FOR STRUCTURED PREPARATION
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Take Control of Your Exam Strategy.
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            Build your first exam workspace, structure your syllabus tree, and start tracking study sessions today.
          </p>

          <div className="pt-4">
            <Link
              href={user ? '/dashboard' : '/register'}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 bg-zinc-950 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-zinc-200 font-bold font-sans">Exam COMPETII</span>
            <span>—</span>
            <span>StudyOS Platform</span>
          </div>

          <div className="flex items-center space-x-6 text-zinc-400">
            <a href="#features" className="hover:text-orange-400 transition-colors">Syllabus</a>
            <a href="#notes" className="hover:text-orange-400 transition-colors">Notes</a>
            <a href="#tracking" className="hover:text-orange-400 transition-colors">Tracking</a>
          </div>

          <div>
            © {new Date().getFullYear()} COMPETII OS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
