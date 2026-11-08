import React, { useState } from 'react';
import { ReferenceItem } from '../types/protocol';
import { X, Copy, Check, Download, Upload, AlertCircle, FileText } from 'lucide-react';

interface JsonExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ReferenceItem[];
  onImportItems: (newItems: ReferenceItem[]) => void;
}

export const JsonExportModal: React.FC<JsonExportModalProps> = ({
  isOpen,
  onClose,
  items,
  onImportItems,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Format exactly matching user schema: id, category, code, meaning, security_note
  const exportData = items.map((i) => ({
    id: i.id,
    category: i.category,
    code: i.code,
    meaning: i.meaning,
    security_note: i.security_note,
  }));

  const jsonString = JSON.stringify(exportData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netsec-protocols-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    setImportSuccess(null);

    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        throw new Error('Import data must be a JSON array of objects.');
      }

      const validated: ReferenceItem[] = parsed.map((item, index) => {
        if (!item.code || !item.meaning || !item.security_note) {
          throw new Error(
            `Item at index ${index} is missing required fields: code, meaning, or security_note.`
          );
        }
        return {
          id: item.id || `imported-${Date.now()}-${index}`,
          category: item.category || 'Ports',
          code: item.code,
          meaning: item.meaning,
          security_note: item.security_note,
          custom: true,
        };
      });

      onImportItems(validated);
      setImportSuccess(`Successfully imported ${validated.length} protocol items!`);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setImportError(err.message || 'Invalid JSON syntax. Please verify and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-left flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              JSON Database Exchange
            </h3>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('export')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'export'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Export JSON ({items.length})
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'import'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Import JSON
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeTab === 'export' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Standard JSON representation matching the seed format. Includes Port 22, Port 443,
              HTTP 403, and all current entries.
            </p>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300">
              <pre className="whitespace-pre">{jsonString}</pre>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-mono">{items.length} records active</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-cyan-500" />
                  <span>Download .json</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full JSON</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleImportSubmit} className="flex-1 flex flex-col min-h-0 text-xs">
            <p className="text-slate-500 dark:text-slate-400 mb-3">
              Paste a JSON array of objects with <code className="text-cyan-500 font-mono">id</code>, <code className="text-cyan-500 font-mono">category</code>, <code className="text-cyan-500 font-mono">code</code>, <code className="text-cyan-500 font-mono">meaning</code>, and <code className="text-cyan-500 font-mono">security_note</code>.
            </p>

            {importError && (
              <div className="mb-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="mb-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='[&#10;  {&#10;    "id": "port-8080",&#10;    "category": "Ports",&#10;    "code": "Port 8080",&#10;    "meaning": "HTTP Alternative / Proxy",&#10;    "security_note": "Commonly used for dev web servers and admin dashboards."&#10;  }&#10;]'
              rows={10}
              className="w-full flex-1 p-3 font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              required
            />

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-white bg-cyan-600 hover:bg-cyan-500 font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Merge & Import</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
