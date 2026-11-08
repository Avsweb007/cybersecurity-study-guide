import React, { useState } from 'react';
import { ReferenceItem } from '../types/protocol';
import { Bookmark, Copy, Check, ArrowUpDown, ArrowUpRight } from 'lucide-react';

interface ProtocolTableProps {
  items: ReferenceItem[];
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onSelect: (item: ReferenceItem) => void;
}

type SortField = 'code' | 'category' | 'meaning' | 'risk';

export const ProtocolTable: React.FC<ProtocolTableProps> = ({
  items,
  bookmarks,
  onToggleBookmark,
  onSelect,
}) => {
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'code') {
      cmp = a.code.localeCompare(b.code, undefined, { numeric: true });
    } else if (sortField === 'category') {
      cmp = a.category.localeCompare(b.category);
    } else if (sortField === 'meaning') {
      cmp = a.meaning.localeCompare(b.meaning);
    } else if (sortField === 'risk') {
      const riskWeight: Record<string, number> = {
        Critical: 4,
        High: 3,
        Medium: 2,
        Low: 1,
        Informational: 0,
      };
      const wA = a.risk_level ? riskWeight[a.risk_level] ?? 0 : 0;
      const wB = b.risk_level ? riskWeight[b.risk_level] ?? 0 : 0;
      cmp = wA - wB;
    }
    return sortAsc ? cmp : -cmp;
  });

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'Critical':
        return 'text-rose-600 dark:text-rose-400 font-semibold';
      case 'High':
        return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400 font-semibold';
      case 'Low':
        return 'text-emerald-600 dark:text-emerald-400 font-medium';
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4 w-12 text-center">Save</th>
            <th
              onClick={() => handleSort('code')}
              className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Code / Port</span>
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
            </th>
            <th
              onClick={() => handleSort('category')}
              className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Category</span>
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
            </th>
            <th
              onClick={() => handleSort('meaning')}
              className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Protocol & Meaning</span>
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
            </th>
            <th className="py-3 px-4 hidden lg:table-cell">Security Assessment</th>
            <th
              onClick={() => handleSort('risk')}
              className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors w-28"
            >
              <div className="flex items-center gap-1.5">
                <span>Threat</span>
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
            </th>
            <th className="py-3 px-4 w-20 text-right">Inspect</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {sortedItems.map((item) => {
            const isBookmarked = bookmarks.includes(item.id);
            return (
              <tr
                key={item.id}
                onClick={() => onSelect(item)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleBookmark(item.id)}
                    className="text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
                    />
                  </button>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {item.code}
                    </span>
                    <button
                      onClick={(e) => handleCopy(e, item.code, item.id)}
                      title="Copy code"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {item.category}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900 dark:text-slate-200">
                    {item.meaning}
                  </div>
                </td>
                <td className="py-3 px-4 hidden lg:table-cell text-xs text-slate-600 dark:text-slate-400 max-w-md truncate">
                  {item.security_note}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-xs">
                  <span className={getRiskColor(item.risk_level)}>
                    {item.risk_level || 'Normal'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(item);
                    }}
                    className="p-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 inline-flex items-center gap-0.5 text-xs font-medium"
                  >
                    <span>View</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
