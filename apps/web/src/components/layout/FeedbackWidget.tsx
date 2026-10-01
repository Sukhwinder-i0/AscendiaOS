'use client';

import React, { useState } from 'react';
import { MessageSquarePlus, X, Send, ChevronDown, Bug, Lightbulb, Star, MessageSquare } from 'lucide-react';

type Category = 'feature' | 'bug' | 'praise' | 'general';

const CATEGORIES: { key: Category; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'feature', label: 'Feature Request', icon: <Lightbulb className="w-3.5 h-3.5" />, color: 'text-yellow-400' },
  { key: 'bug',     label: 'Bug Report',      icon: <Bug className="w-3.5 h-3.5" />,       color: 'text-red-400'    },
  { key: 'praise',  label: 'Praise',          icon: <Star className="w-3.5 h-3.5" />,       color: 'text-orange-400' },
  { key: 'general', label: 'General',         icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'text-zinc-400' },
];

const GITHUB_REPO = 'Sukhwinder-i0/AscendiaOS';

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>('feature');
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selected = CATEGORIES.find((c) => c.key === category)!;

  const handleSubmit = () => {
    if (!text.trim()) return;
    const title = encodeURIComponent(`[${selected.label}] ${text.slice(0, 60)}`);
    const body = encodeURIComponent(
      `### Category\n${selected.label}\n\n### Description\n${text}\n\n---\n*Submitted via AscendiaOS App*`
    );
    const label = category === 'bug' ? '&labels=bug' : category === 'feature' ? '&labels=enhancement' : '';
    window.open(`https://github.com/${GITHUB_REPO}/issues/new?title=${title}&body=${body}${label}`, '_blank');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setText('');
      setOpen(false);
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Panel */}
      {open && (
        <div
          className="w-80 rounded-2xl border border-zinc-700/60 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden"
          style={{ animation: 'feedbackSlideUp 0.2s ease-out' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-zinc-100">Share Feedback</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {submitted ? (
            <div className="px-4 py-8 flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-sm font-medium text-zinc-100">Opening GitHub...</p>
              <p className="text-xs text-zinc-500">Thanks for your feedback! 🙏</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      category === c.key
                        ? 'bg-orange-500/20 border-orange-500/60 text-orange-300'
                        : 'bg-zinc-800/60 border-zinc-700/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    <span className={category === c.key ? 'text-orange-400' : c.color}>{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Text area */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  category === 'bug'     ? "What went wrong? What did you expect?" :
                  category === 'feature' ? "Describe the feature you'd like to see..." :
                  category === 'praise'  ? "Tell us what you love about AscendiaOS!" :
                  "Anything on your mind..."
                }
                rows={4}
                className="w-full bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/20 transition-all"
              />

              {/* Footer */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-600">Opens a GitHub issue</p>
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all"
                >
                  <Send className="w-3 h-3" />
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Share feedback"
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 font-medium text-sm ${
          open
            ? 'bg-zinc-800 border border-zinc-700 text-zinc-300 pr-3'
            : 'bg-orange-500 hover:bg-orange-400 text-white shadow-orange-500/30'
        }`}
        style={{ animation: 'feedbackBounce 0s' }}
      >
        {open ? (
          <><ChevronDown className="w-4 h-4" /> Close</>
        ) : (
          <><MessageSquarePlus className="w-4 h-4" /> Feedback</>
        )}
      </button>

      <style>{`
        @keyframes feedbackSlideUp {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
