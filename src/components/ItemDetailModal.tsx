import React, { useState } from 'react';
import { ReferenceItem } from '../types/protocol';
import { X, Copy, Check, Terminal, Shield, ShieldAlert, ArrowRight, Bookmark, FileCode2 } from 'lucide-react';

interface ItemDetailModalProps {
  item: ReferenceItem | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelectRelated: (item: ReferenceItem) => void;
  allItems: ReferenceItem[];
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onSelectRelated,
  allItems,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!item) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const relatedItems = (item.related_ids || [])
    .map((id) => allItems.find((i) => i.id === id))
    .filter(Boolean) as ReferenceItem[];

  const minimalJson = JSON.stringify(
    {
      id: item.id,
      category: item.category,
      code: item.code,
      meaning: item.meaning,
      security_note: item.security_note,
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Code & Top Actions */}
        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-baseline gap-2.5 flex-wrap mb-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                {item.code}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{item.category}</span>
                {item.transport && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{item.transport}</span>
                  </>
                )}
                {item.risk_level && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                      {item.risk_level} Risk
                    </span>
                  </>
                )}
              </div>
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {item.meaning}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onToggleBookmark(item.id)}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this entry'}
              className="p-2 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Note Box */}
        <div className="mb-6 p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-900/50">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 mb-1.5">
            <Shield className="w-4 h-4" />
            <span>Security Engineering Note</span>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
            {item.security_note}
          </p>
        </div>

        {/* Attack Vectors */}
        {item.attack_vectors && item.attack_vectors.length > 0 && (
          <div className="mb-6">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Known Attack Vectors & Threat Scenarios</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {item.attack_vectors.map((vec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-500 font-mono mt-0.5">•</span>
                  <span>{vec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Remediation */}
        {item.remediation && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Hardening & Defensive Remediation
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {item.remediation}
            </p>
          </div>
        )}

        {/* Probe / Audit Command */}
        {item.audit_command && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                <span>Verification / Audit Probe Command</span>
              </span>
              <button
                onClick={() => handleCopy(item.audit_command!, 'audit')}
                className="text-xs text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1"
              >
                {copiedKey === 'audit' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
              <code>{item.audit_command}</code>
            </div>
          </div>
        )}

        {/* Defense Snippet / Firewall Rule */}
        {item.defense_snippet && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.defense_snippet.label}
              </span>
              <button
                onClick={() => handleCopy(item.defense_snippet!.code, 'defense')}
                className="text-xs text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1"
              >
                {copiedKey === 'defense' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Config</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre">
              <code>{item.defense_snippet.code}</code>
            </div>
          </div>
        )}

        {/* JSON Schema Representation */}
        <div className="mb-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <FileCode2 className="w-3.5 h-3.5 text-cyan-500" />
              <span>Standard JSON Schema Object</span>
            </span>
            <button
              onClick={() => handleCopy(minimalJson, 'json')}
              className="text-xs text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1"
            >
              {copiedKey === 'json' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
            {minimalJson}
          </pre>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Related Protocols & Codes
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedItems.map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => onSelectRelated(rel)}
                  className="px-3 py-1.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <span className="font-semibold">{rel.code}</span>
                  <span className="text-slate-400 font-sans">({rel.meaning.slice(0, 24)}...)</span>
                  <ArrowRight className="w-3 h-3 text-cyan-500" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
