/**
 * SISMP — Theme Toggle Switcher
 * Interactive micro-animated button to toggle between Light & Dark theme modes.
 * Features WCAG AAA compliance, smooth icon transition, and tooltip badge.
 */
'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 hover:border-slate-600'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary hover:border-slate-300'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
        <Sun
          className={`w-5 h-5 transition-all duration-300 transform ${
            isDark ? 'scale-0 rotate-90 opacity-0 absolute' : 'scale-100 rotate-0 opacity-100'
          }`}
        />
        <Moon
          className={`w-5 h-5 transition-all duration-300 transform ${
            isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0 absolute'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-semibold select-none pr-1">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
}
