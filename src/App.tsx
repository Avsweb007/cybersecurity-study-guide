import React, { useState, useEffect, useMemo } from 'react';
import { ReferenceItem, CategoryType, RiskLevel, ViewMode } from './types/protocol';
import { INITIAL_REFERENCE_ITEMS } from './data/protocols';
import {
  loadCustomItems,
  saveCustomItems,
  loadBookmarks,
  saveBookmarks,
} from './utils/storage';
import { Header } from './components/Header';
import { ProtocolCard } from './components/ProtocolCard';
import { ProtocolTable } from './components/ProtocolTable';
import { ItemDetailModal } from './components/ItemDetailModal';
import { FlashcardsView } from './components/FlashcardsView';
import { TriageCalculator } from './components/TriageCalculator';
import { CompareView } from './components/CompareView';
import { AddEntryModal } from './components/AddEntryModal';
import { JsonExportModal } from './components/JsonExportModal';
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  Bookmark,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<ReferenceItem[]>(() => {
    const custom = loadCustomItems();
    // Merge initial and custom, ensuring no duplicate IDs
    const merged = [...INITIAL_REFERENCE_ITEMS];
    custom.forEach((c) => {
      if (!merged.some((m) => m.id === c.id)) {
        merged.push(c);
      }
    });
    return merged;
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => loadBookmarks());
  const [currentView, setCurrentView] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  const [detailItem, setDetailItem] = useState<ReferenceItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      saveBookmarks(next);
      return next;
    });
  };

  const handleAddItem = (newItem: ReferenceItem) => {
    const updated = [newItem, ...items];
    setItems(updated);
    saveCustomItems(updated.filter((i) => i.custom));
  };

  const handleImportItems = (imported: ReferenceItem[]) => {
    const existingIds = new Set(items.map((i) => i.id));
    const toAdd = imported.filter((i) => !existingIds.has(i.id));
    const updated = [...toAdd, ...items];
    setItems(updated);
    saveCustomItems(updated.filter((i) => i.custom));
  };

  // Filtered Items logic
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Risk filter
      if (selectedRisk !== 'All' && item.risk_level !== selectedRisk) {
        return false;
      }
      // Bookmarks filter
      if (onlyBookmarks && !bookmarks.includes(item.id)) {
        return false;
      }
      // Search query filter (matches code, meaning, security note, transport, audit command)
      if (query) {
        const inCode = item.code.toLowerCase().includes(query);
        const inMeaning = item.meaning.toLowerCase().includes(query);
        const inSecurity = item.security_note.toLowerCase().includes(query);
        const inTransport = item.transport?.toLowerCase().includes(query);
        const inVectors = item.attack_vectors?.some((v) => v.toLowerCase().includes(query));
        if (!inCode && !inMeaning && !inSecurity && !inTransport && !inVectors) {
          return false;
        }
      }
      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedRisk, onlyBookmarks, bookmarks]);

  const categories: string[] = [
    'All',
    'Ports',
    'HTTP Status',
    'Headers & Flags',
    'DNS Records',
    'Signals & Exits',
    'OWASP Top 10',
  ];

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRisk('All');
    setOnlyBookmarks(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Universal Top Bar */}
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        totalCount={items.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sub-views: Flashcards, Triage, Compare */}
        {currentView === 'flashcards' && <FlashcardsView items={items} />}

        {currentView === 'triage' && (
          <TriageCalculator items={items} onSelectDetail={(item) => setDetailItem(item)} />
        )}

        {currentView === 'compare' && (
          <CompareView items={items} onSelectDetail={(item) => setDetailItem(item)} />
        )}

        {/* Primary View: Catalog (Cards or Table) */}
        {(currentView === 'cards' || currentView === 'table') && (
          <div>
            {/* Hero Header (Compact on mobile so Search & Cards are near top) */}
            <div className="mb-4 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 pb-3 sm:pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Protocol & Port Security Matrix
                  </h1>
                  <p className="hidden sm:block text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Fast-lookup engineering reference for network ports, HTTP status codes, security
                    notes, verification commands, and firewall hardening rules.
                  </p>
                </div>

                {/* Quick Stats Strip */}
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                  <div>
                    <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {items.filter((i) => i.category === 'Ports').length}
                    </span>
                    <span className="ml-1 text-slate-500">Ports</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">|</span>
                  <div>
                    <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {items.filter((i) => i.category === 'HTTP Status').length}
                    </span>
                    <span className="ml-1 text-slate-500">HTTP</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">|</span>
                  <div>
                    <span className="font-mono tabular-nums font-bold text-cyan-600 dark:text-cyan-400 text-sm sm:text-base">
                      {bookmarks.length}
                    </span>
                    <span className="ml-1 text-slate-500">Saved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Control Toolbar */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by port, code, name, or note (e.g. 443, 22, 403, SSH)..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 dark:focus:border-cyan-500 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none shadow-xs transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Right controls: View toggle, Risk filter, Bookmarks */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Bookmarks Filter */}
                  <button
                    onClick={() => setOnlyBookmarks(!onlyBookmarks)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                      onlyBookmarks
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/40'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        onlyBookmarks ? 'fill-amber-500 text-amber-500' : ''
                      }`}
                    />
                    <span>Bookmarked ({bookmarks.length})</span>
                  </button>

                  {/* Risk Level Filter */}
                  <select
                    value={selectedRisk}
                    onChange={(e) => setSelectedRisk(e.target.value)}
                    className="px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    <option value="All">All Threat Levels</option>
                    <option value="Critical">Critical Threat</option>
                    <option value="High">High Threat</option>
                    <option value="Medium">Medium Threat</option>
                    <option value="Low">Low Threat</option>
                    <option value="Informational">Informational</option>
                  </select>

                  {/* Layout View Switch (Cards vs Table) */}
                  <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <button
                      onClick={() => setCurrentView('cards')}
                      title="Card Grid View"
                      className={`p-1.5 rounded-md transition-colors ${
                        currentView === 'cards'
                          ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentView('table')}
                      title="Dense Engineering Table View"
                      className={`p-1.5 rounded-md transition-colors ${
                        currentView === 'table'
                          ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <TableIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  const count =
                    cat === 'All'
                      ? items.length
                      : items.filter((i) => i.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="font-mono text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Count & Active Filter Pills */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong className="text-slate-900 dark:text-white font-mono">{filteredItems.length}</strong>{' '}
                  of <span className="font-mono">{items.length}</span> records
                </span>
                {(searchQuery || selectedCategory !== 'All' || selectedRisk !== 'All' || onlyBookmarks) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline ml-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset filters</span>
                  </button>
                )}
              </div>
            </div>

            {/* Render Cards or Table */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                <Shield className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  No matching protocols or ports found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  No records match "{searchQuery}" under the selected category and threat filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : currentView === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <ProtocolCard
                    key={item.id}
                    item={item}
                    isBookmarked={bookmarks.includes(item.id)}
                    onToggleBookmark={toggleBookmark}
                    onSelect={(it) => setDetailItem(it)}
                  />
                ))}
              </div>
            ) : (
              <ProtocolTable
                items={filteredItems}
                bookmarks={bookmarks}
                onToggleBookmark={toggleBookmark}
                onSelect={(it) => setDetailItem(it)}
              />
            )}
          </div>
        )}
      </main>

      {/* Detail Inspector Modal */}
      <ItemDetailModal
        item={detailItem}
        onClose={() => setDetailItem(null)}
        isBookmarked={detailItem ? bookmarks.includes(detailItem.id) : false}
        onToggleBookmark={toggleBookmark}
        onSelectRelated={(rel) => setDetailItem(rel)}
        allItems={items}
      />

      {/* Add Custom Entry Modal */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddItem}
      />

      {/* JSON Export / Import Modal */}
      <JsonExportModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        items={items}
        onImportItems={handleImportItems}
      />

      {/* Clean Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              NetSec Matrix
            </span>
            <span aria-hidden="true">·</span>
            <span>Security Engineering & Protocol Reference Guide</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap">
            <button
              onClick={() => setIsJsonModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Export JSON
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setCurrentView('flashcards')}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Flashcards & Quiz
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setCurrentView('triage')}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Triage
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setCurrentView('compare')}
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Compare
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
