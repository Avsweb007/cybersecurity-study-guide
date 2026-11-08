import React, { useState } from 'react';
import { ReferenceItem } from '../types/protocol';
import { Bookmark, Copy, Check, Terminal, Shield, ArrowUpRight, ShieldAlert } from 'lucide-react';

interface ProtocolCardProps {
  item: ReferenceItem;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelect: (item: ReferenceItem) => void;
}

export const ProtocolCard: React.FC<ProtocolCardProps> = ({
  item,
  isBookmarked,
  onToggleBookmark,
  onSelect,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string, field: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'Critical':
        return 'text-rose-600 dark:text-rose-400';
      case 'High':
        return 'text-amber-600 dark:text-amber-400';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'Low':
        return 'text-emerald-600 dark:text-emerald-400';
      default:
        return 'text-cyan-600 dark:text-cyan-400';
    }
  };

  return (
    <article
      onClick={() => onSelect(item)}
      className="group relative flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-cyan-500/50 dark:hover:border-cyan-500/50 hover:shadow-md transition-all cursor-pointer text-left"
    >
      <div>
        {/* Top Header: Code & Action Buttons (Zero-Pill: Clean unboxed metadata) */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
              {item.code}
            </h3>
            {/* Unboxed inline text metadata with typographic separators */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{item.category}</span>
              {item.transport && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{item.transport}</span>
                </>
              )}
              {item.risk_level && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className={`font-semibold ${getRiskColor(item.risk_level)}`}>
                    {item.risk_level}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(item.id);
              }}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark for audit'}
              className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
              />
            </button>
            <button
              onClick={(e) => handleCopy(e, item.code, 'code')}
              title="Copy code"
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copiedField === 'code' ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Primary Meaning */}
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 leading-snug">
          {item.meaning}
        </p>

        {/* Security Note */}
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          {item.security_note}
        </p>

        {/* Attack Vector Highlight */}
        {item.attack_vectors && item.attack_vectors.length > 0 && (
          <div className="mb-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500/80" />
              <span>Primary Threat Vector</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 truncate">
              {item.attack_vectors[0]}
            </p>
          </div>
        )}
      </div>

      {/* Footer: Audit Command or Quick Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        {item.audit_command ? (
          <div className="flex items-center justify-between w-full gap-2 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-1.5 min-w-0">
              <Terminal className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <code className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate">
                {item.audit_command}
              </code>
            </div>
            <button
              onClick={(e) => handleCopy(e, item.audit_command!, 'cmd')}
              title="Copy probe command"
              className="text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 shrink-0 p-0.5"
            >
              {copiedField === 'cmd' ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-500" />
              {item.rfc_or_spec || 'Standard Specification'}
            </span>
            <span className="inline-flex items-center gap-0.5 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform font-medium">
              Details <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        )}
      </div>
    </article>
  );
};
