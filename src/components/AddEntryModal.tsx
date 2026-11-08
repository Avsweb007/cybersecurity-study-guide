import React, { useState } from 'react';
import { ReferenceItem, CategoryType, RiskLevel } from '../types/protocol';
import { X, Plus, AlertCircle } from 'lucide-react';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: ReferenceItem) => void;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [category, setCategory] = useState<CategoryType>('Ports');
  const [code, setCode] = useState('');
  const [meaning, setMeaning] = useState('');
  const [securityNote, setSecurityNote] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Medium');
  const [transport, setTransport] = useState<'TCP' | 'UDP' | 'TCP/UDP' | 'N/A'>('TCP');
  const [auditCommand, setAuditCommand] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !meaning.trim() || !securityNote.trim()) {
      setError('Please provide code/port, meaning, and security note.');
      return;
    }

    const generatedId = `custom-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

    const newItem: ReferenceItem = {
      id: generatedId,
      category,
      code: code.trim(),
      meaning: meaning.trim(),
      security_note: securityNote.trim(),
      risk_level: riskLevel,
      transport: category === 'Ports' ? transport : undefined,
      audit_command: auditCommand.trim() || undefined,
      custom: true,
    };

    onAdd(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Add Protocol or Port Entry
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Ports">Ports</option>
                <option value="HTTP Status">HTTP Status</option>
                <option value="Headers & Flags">Headers & Flags</option>
                <option value="DNS Records">DNS Records</option>
                <option value="Signals & Exits">Signals & Exits</option>
                <option value="OWASP Top 10">OWASP Top 10</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Code / Port Identifier *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. Port 8443 or 422 Unprocessable"
                className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Meaning / Description *
            </label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="e.g. HTTPS Alternative Port for Admin Panels"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Security Note *
            </label>
            <textarea
              rows={3}
              value={securityNote}
              onChange={(e) => setSecurityNote(e.target.value)}
              placeholder="Explain security implications, vulnerabilities, or attack surface..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Threat / Risk Level
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Informational">Informational</option>
              </select>
            </div>

            {category === 'Ports' && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transport Protocol
                </label>
                <select
                  value={transport}
                  onChange={(e) => setTransport(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="TCP/UDP">TCP/UDP</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Verification / Probe Command (optional)
            </label>
            <input
              type="text"
              value={auditCommand}
              onChange={(e) => setAuditCommand(e.target.value)}
              placeholder="e.g. nmap -sV -p 8443 <target>"
              className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
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
              <Plus className="w-4 h-4" />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
