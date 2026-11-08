import React from 'react';
import { ViewMode } from '../types/protocol';
import {
  ShieldCheck,
  Moon,
  Sun,
  Plus,
  FileCode2,
  Search,
  Sparkles,
  Stethoscope,
  ArrowLeftRight,
} from 'lucide-react';

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
  const isSearchActive = currentView === 'cards' || currentView === 'table';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors shadow-xs">
      {/* Top Utility Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <button
          onClick={() => onSelectView('cards')}
          className="flex items-center gap-2 text-left group whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:border-cyan-500/60 transition-colors">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            NetSec Matrix
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={() => onSelectView('cards')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              isSearchActive
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold border-b-2 border-cyan-500'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Search
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
            Triage
          </button>
          <button
            onClick={() => onSelectView('compare')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'compare'
                ? 'text-cyan-600 dark:text-cyan-400 font-semibold border-b-2 border-cyan-500'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Compare
          </button>
        </nav>

        {/* Action Buttons & Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenJsonModal}
            title="Export or Import JSON Data"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300/70 dark:border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <FileCode2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>JSON</span>
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
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Entry</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Prominent Mobile Navigation Strip (Requirement 2: Search, Flashcards & Quiz, Triage, Compare near top) */}
      <div className="md:hidden border-t border-slate-100 dark:border-slate-800/80 px-2 py-1.5 bg-slate-50/90 dark:bg-slate-900/90">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => onSelectView('cards')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
              isSearchActive
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5 mb-0.5" />
            <span>Search</span>
          </button>

          <button
            onClick={() => onSelectView('flashcards')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
              currentView === 'flashcards'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mb-0.5" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => onSelectView('triage')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
              currentView === 'triage'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 mb-0.5" />
            <span>Triage</span>
          </button>

          <button
            onClick={() => onSelectView('compare')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
              currentView === 'compare'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 mb-0.5" />
            <span>Compare</span>
          </button>
        </div>
      </div>
    </header>
  );
};
