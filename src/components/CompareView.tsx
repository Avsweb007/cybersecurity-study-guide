import React, { useState } from 'react';
import { ReferenceItem, ComparisonPair } from '../types/protocol';
import { PRESET_COMPARISONS } from '../data/protocols';
import { ArrowLeftRight, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface CompareViewProps {
  items: ReferenceItem[];
  onSelectDetail: (item: ReferenceItem) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({ items, onSelectDetail }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_COMPARISONS[0].id);
  const [itemAId, setItemAId] = useState<string>(PRESET_COMPARISONS[0].itemAId);
  const [itemBId, setItemBId] = useState<string>(PRESET_COMPARISONS[0].itemBId);

  const activePreset = PRESET_COMPARISONS.find((p) => p.id === selectedPresetId);

  const handleSelectPreset = (preset: ComparisonPair) => {
    setSelectedPresetId(preset.id);
    setItemAId(preset.itemAId);
    setItemBId(preset.itemBId);
  };

  const itemA = items.find((i) => i.id === itemAId) || items[0];
  const itemB = items.find((i) => i.id === itemBId) || items[1];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Intro Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Compare Protocols & Codes Side-by-Side
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto">
          Compare commonly confused ports, HTTP statuses, and system signals to understand critical
          architectural and security differences.
        </p>

        {/* Preset Tabs */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap mt-6">
          {PRESET_COMPARISONS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedPresetId === preset.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Analyst Synthesis Card */}
      {activePreset && (
        <div className="mb-6 p-5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-900/50 text-left">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 mb-1.5">
            <ArrowLeftRight className="w-4 h-4" />
            <span>Key Architectural Distinction</span>
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            {activePreset.keyDifference}
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {activePreset.analystSummary}
          </p>
        </div>
      )}

      {/* Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Item A Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Option A
              </span>
              <select
                value={itemA.id}
                onChange={(e) => {
                  setItemAId(e.target.value);
                  setSelectedPresetId('');
                }}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-700 dark:text-slate-200"
              >
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.code} ({i.category})
                  </option>
                ))}
              </select>
            </div>

            <h3 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mb-1">
              {itemA.code}
            </h3>
            <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-3">
              {itemA.meaning}
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <strong className="block text-slate-900 dark:text-white mb-1">Security Note:</strong>
                <p className="leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                  {itemA.security_note}
                </p>
              </div>

              {itemA.remediation && (
                <div>
                  <strong className="block text-slate-900 dark:text-white mb-1">Defensive Rule:</strong>
                  <p className="leading-relaxed">{itemA.remediation}</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              onClick={() => onSelectDetail(itemA)}
              className="w-full py-2 text-xs font-semibold text-center text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Inspect Complete Spec
            </button>
          </div>
        </div>

        {/* Item B Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Option B
              </span>
              <select
                value={itemB.id}
                onChange={(e) => {
                  setItemBId(e.target.value);
                  setSelectedPresetId('');
                }}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-700 dark:text-slate-200"
              >
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.code} ({i.category})
                  </option>
                ))}
              </select>
            </div>

            <h3 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mb-1">
              {itemB.code}
            </h3>
            <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-3">
              {itemB.meaning}
            </div>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <strong className="block text-slate-900 dark:text-white mb-1">Security Note:</strong>
                <p className="leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80">
                  {itemB.security_note}
                </p>
              </div>

              {itemB.remediation && (
                <div>
                  <strong className="block text-slate-900 dark:text-white mb-1">Defensive Rule:</strong>
                  <p className="leading-relaxed">{itemB.remediation}</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              onClick={() => onSelectDetail(itemB)}
              className="w-full py-2 text-xs font-semibold text-center text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Inspect Complete Spec
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
