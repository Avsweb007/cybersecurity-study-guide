import React, { useState, useMemo } from 'react';
import { ReferenceItem, CategoryType } from '../types/protocol';
import { RotateCw, CheckCircle2, XCircle, Award, Sparkles, HelpCircle, Shuffle } from 'lucide-react';

interface FlashcardsViewProps {
  items: ReferenceItem[];
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ items }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [mode, setMode] = useState<'flashcard' | 'quiz'>('flashcard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  // Quiz mode state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter((i) => i.category === activeCategory);
  }, [items, activeCategory]);

  const currentItem = filteredItems[currentIndex] || filteredItems[0];

  const handleNext = () => {
    setIsFlipped(false);
    setSelectedAnswer(null);
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setSelectedAnswer(null);
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setSelectedAnswer(null);
    const randomIndex = Math.floor(Math.random() * filteredItems.length);
    setCurrentIndex(randomIndex);
  };

  const markMastered = () => {
    if (!currentItem) return;
    if (!masteredIds.includes(currentItem.id)) {
      setMasteredIds([...masteredIds, currentItem.id]);
      setReviewIds(reviewIds.filter((id) => id !== currentItem.id));
    }
    setStreak((prev) => prev + 1);
    handleNext();
  };

  const markReview = () => {
    if (!currentItem) return;
    if (!reviewIds.includes(currentItem.id)) {
      setReviewIds([...reviewIds, currentItem.id]);
      setMasteredIds(masteredIds.filter((id) => id !== currentItem.id));
    }
    setStreak(0);
    handleNext();
  };

  // Generate 4 randomized options for Quiz Mode
  const quizOptions = useMemo(() => {
    if (!currentItem || mode !== 'quiz') return [];
    const correct = currentItem.meaning;
    const others = items
      .filter((i) => i.id !== currentItem.id)
      .map((i) => i.meaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const all = [correct, ...others].sort(() => 0.5 - Math.random());
    return all;
  }, [currentItem, items, mode, currentIndex]);

  const handleAnswerQuiz = (choice: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choice);
    const isCorrect = choice === currentItem.meaning;
    setQuizScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    if (isCorrect) {
      setStreak((prev) => prev + 1);
      if (!masteredIds.includes(currentItem.id)) {
        setMasteredIds([...masteredIds, currentItem.id]);
      }
    } else {
      setStreak(0);
      if (!reviewIds.includes(currentItem.id)) {
        setReviewIds([...reviewIds, currentItem.id]);
      }
    }
  };

  const categories: string[] = [
    'All',
    'Ports',
    'HTTP Status',
    'Headers & Flags',
    'DNS Records',
    'Signals & Exits',
  ];

  if (!currentItem) {
    return (
      <div className="py-12 text-center text-slate-500">
        No items available in this category.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Mode & Category Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Segmented Control for Mode */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <button
            onClick={() => {
              setMode('flashcard');
              setIsFlipped(false);
              setSelectedAnswer(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              mode === 'flashcard'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Flashcard Deck
          </button>
          <button
            onClick={() => {
              setMode('quiz');
              setIsFlipped(false);
              setSelectedAnswer(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              mode === 'quiz'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Multiple-Choice Quiz
          </button>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1 text-amber-500 font-semibold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Streak: {streak}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Mastered: {masteredIds.length}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-rose-500 font-medium">Review: {reviewIds.length}</span>
        </div>
      </div>

      {/* Category Pills/Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setCurrentIndex(0);
              setIsFlipped(false);
              setSelectedAnswer(null);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Card Arena */}
      {mode === 'flashcard' ? (
        <div className="space-y-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[300px] sm:min-h-[340px] p-8 flex flex-col justify-between bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-2xl shadow-lg transition-all text-center relative group"
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono tabular-nums">
                Card {currentIndex + 1} of {filteredItems.length}
              </span>
              <span className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium">
                <RotateCw className="w-3.5 h-3.5" />
                Click card to flip
              </span>
            </div>

            {/* Front vs Back Content */}
            {!isFlipped ? (
              <div className="my-auto py-8">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                  {currentItem.category}
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white mb-4 tracking-tight">
                  {currentItem.code}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  What protocol, service, or status does this represent, and what is its security
                  implication?
                </p>
              </div>
            ) : (
              <div className="my-auto py-4 text-left animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs uppercase font-bold tracking-widest text-cyan-600 dark:text-cyan-400 mb-1">
                  {currentItem.code} · {currentItem.category}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {currentItem.meaning}
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                  <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                    Security Note:
                  </span>
                  {currentItem.security_note}
                </div>
                {currentItem.remediation && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <strong className="text-slate-700 dark:text-slate-300">Defense:</strong>{' '}
                    {currentItem.remediation}
                  </p>
                )}
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="font-mono">
                {currentItem.transport ? `Transport: ${currentItem.transport}` : ''}
              </span>
              <span>{currentItem.risk_level ? `${currentItem.risk_level} Threat` : ''}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleShuffle}
              title="Shuffle card deck"
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={markReview}
                className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Review Later</span>
              </button>
              <button
                onClick={markMastered}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mastered (Next)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Multiple Choice Quiz Mode */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-mono">
              Question {currentIndex + 1} of {filteredItems.length}
            </span>
            <span className="font-mono font-medium">
              Score: {quizScore.correct} / {quizScore.total} (
              {quizScore.total > 0 ? Math.round((quizScore.correct / quizScore.total) * 100) : 0}%)
            </span>
          </div>

          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              {currentItem.category} Challenge
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              What does <span className="text-cyan-500">{currentItem.code}</span> represent?
            </h3>
          </div>

          <div className="space-y-3 mb-6">
            {quizOptions.map((choice, idx) => {
              const isSelected = selectedAnswer === choice;
              const isCorrectAnswer = choice === currentItem.meaning;
              let btnStyle =
                'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-cyan-500/60';

              if (selectedAnswer !== null) {
                if (isCorrectAnswer) {
                  btnStyle =
                    'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-semibold';
                } else if (isSelected) {
                  btnStyle =
                    'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200';
                } else {
                  btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleAnswerQuiz(choice)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3 ${btnStyle}`}
                >
                  <span className="font-mono text-xs opacity-60 mt-0.5">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="flex-1">{choice}</span>
                </button>
              );
            })}
          </div>

          {selectedAnswer !== null && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-4 animate-in fade-in duration-200">
              <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                Security Engineering Analysis:
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {currentItem.security_note}
              </p>
            </div>
          )}

          {selectedAnswer !== null && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors"
              >
                Next Question →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
