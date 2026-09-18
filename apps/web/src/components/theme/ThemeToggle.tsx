'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { clsx } from 'clsx';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={clsx(
        'p-2 rounded-lg border border-border bg-surface text-secondary hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center',
        className,
      )}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200" />
      )}
    </button>
  );
}
