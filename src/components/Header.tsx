import React from 'react';
import { ViewMode } from '../types/protocol';
import { ShieldCheck, Moon, Sun, Plus, FileCode2 } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenAddModal: () => void;
  onOpenJsonModal: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  onOpenAddModal,
  onOpenJsonModal,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onSelectView('cards')}
          className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:border-cyan-500/60 transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            NetSec Matrix
          </span>
        </button>

        {/* Zone 2: Nav Links (4 clean single-line links with hover underlines) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={() => onSelectView('cards')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'cards' || currentView === 'table'
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold border-b-2 border-cyan-500'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => onSelectView('flashcards')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'flashcards'
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold border-b-2 border-cyan-500'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Flashcards & Quiz
          </button>
          <button
            onClick={() => onSelectView('triage')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'triage'
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold border-b-2 border-cyan-500'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Triage Calculator
          </button>
          <button
            onClick={() => onSelectView('compare')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'compare'
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold border-b-2 border-cyan-500'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Diff Matrix
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Utility Tools */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenJsonModal}
            title="Export or Import JSON Data"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300/70 dark:border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <FileCode2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg border border-transparent dark:border-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>
    </header>
  );
};
