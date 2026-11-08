import React, { useState } from 'react';
import { ReferenceItem } from '../types/protocol';
import { ShieldAlert, Terminal, Copy, Check, AlertTriangle, ShieldCheck, Search, ShieldX } from 'lucide-react';

interface TriageCalculatorProps {
  items: ReferenceItem[];
  onSelectDetail: (item: ReferenceItem) => void;
}

export const TriageCalculator: React.FC<TriageCalculatorProps> = ({ items, onSelectDetail }) => {
  const [query, setQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cleanQuery = query.trim().toLowerCase();

  // Try to find matching item by port number, code string, or keyword
  const matchedItem = items.find((item) => {
    if (!cleanQuery) return false;
    const numOnly = cleanQuery.replace(/\D/g, '');
    const codeNum = item.code.replace(/\D/g, '');
    if (numOnly && codeNum && numOnly === codeNum) return true;
    return (
      item.code.toLowerCase().includes(cleanQuery) ||
      item.meaning.toLowerCase().includes(cleanQuery) ||
      item.id.toLowerCase() === cleanQuery
    );
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Determine Exposure Risk
  const evaluateExposure = (item?: ReferenceItem, rawInput?: string) => {
    const raw = rawInput || (item ? item.code : '');
    const portMatch = raw.match(/\d+/);
    const portNum = portMatch ? parseInt(portMatch[0], 10) : null;

    if (item?.category === 'HTTP Status') {
      const codeNum = portNum;
      if (codeNum === 403) {
        return {
          status: 'Restricted / Forbidden',
          badge: 'Authorization Gate',
          level: 'medium',
          summary: 'Client was authenticated but lacked authorization permissions.',
          guidance: 'Audit server access control list (ACL) or role-based access control (RBAC). Ensure sensitive admin endpoints do not leak stack traces.',
        };
      }
      if (codeNum === 401) {
        return {
          status: 'Authentication Required',
          badge: 'Identity Gate',
          level: 'safe',
          summary: 'Missing or invalid authentication credentials (WWW-Authenticate required).',
          guidance: 'Verify client token validity, clock skew for JWTs, or API key configuration.',
        };
      }
      if (codeNum && codeNum >= 500) {
        return {
          status: 'Server / Upstream Failure',
          badge: 'Incident Trigger',
          level: 'danger',
          summary: 'Internal daemon failure, process crash, or proxy timeout.',
          guidance: 'Check upstream container health, database connection pool exhaustion, and memory limits (OOM).',
        };
      }
    }

    // Default Port heuristics
    const criticalPorts = [445, 3389, 23, 21, 1433, 1521, 5900, 6379, 9200, 27017, 137, 138, 139];
    const restrictedPorts = [22, 88, 389, 3306, 5432, 25, 161];
    const standardPorts = [443, 80, 53];

    if (portNum && criticalPorts.includes(portNum)) {
      return {
        status: 'CRITICAL: NEVER EXPOSE TO INTERNET',
        badge: 'Mass-Compromise Vector',
        level: 'danger',
        summary: `Port ${portNum} is a high-frequency initial access and ransomware lateral movement target. Zero-day and credential attacks against this port cause catastrophic breach.`,
        guidance: `Immediately verify external perimeter firewalls drop traffic on port ${portNum}. Only allow access via encrypted VPN or WireGuard with strict multi-factor authentication.`,
      };
    }

    if (portNum && restrictedPorts.includes(portNum)) {
      return {
        status: 'HIGH RISK: RESTRICT TO INTERNAL IP / VPN',
        badge: 'Internal / Management Only',
        level: 'warning',
        summary: `Port ${portNum} handles management or database operations. It should never be exposed broadly to the open Internet without explicit IP whitelisting.`,
        guidance: `Enforce IP whitelisting, rate-limiting, and key-based authentication. Disable root logins and legacy protocol ciphers.`,
      };
    }

    if (portNum && standardPorts.includes(portNum)) {
      return {
        status: 'STANDARD INTERNET-FACING SERVICE',
        badge: 'Permitted if Hardened',
        level: 'safe',
        summary: `Port ${portNum} is standard for public internet services (HTTPS / Web / DNS). Secure configuration and TLS 1.2+ are mandatory.`,
        guidance: `Deploy hardened TLS configuration with modern cipher suites and enforce HSTS with subdomains.`,
      };
    }

    return {
      status: 'CUSTOM OR UNCOMMON SERVICE PORT',
      badge: 'Manual Audit Required',
      level: 'warning',
      summary: `Port ${raw} is not in standard web tiers. Unknown listening daemons increase attack surface.`,
      guidance: `Run an nmap version probe (-sV -sC) and check running process with 'ss -tulpn' on the target host.`,
    };
  };

  const exposure = evaluateExposure(matchedItem, cleanQuery);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Intro Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Incident Response & Port Triage Calculator
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto">
          Type any port number (e.g. <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">22</span>, <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">443</span>, <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">445</span>, <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">3389</span>) or HTTP code (<span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">403</span>, <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">502</span>) to instantly evaluate threat profile, posture, and defense scripts.
        </p>

        {/* Input Bar */}
        <div className="relative max-w-md mx-auto mt-6">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type port (e.g. 443, 22) or code (403)..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-cyan-500 dark:focus:border-cyan-500 rounded-xl text-base font-mono tabular-nums text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none shadow-sm transition-all"
          />
        </div>

        {/* Quick Click presets */}
        <div className="flex items-center justify-center gap-2 flex-wrap mt-3 text-xs">
          <span className="text-slate-400">Try quick triage:</span>
          {['443', '22', '403', '445', '3389', '6379', '502'].map((preset) => (
            <button
              key={preset}
              onClick={() => setQuery(preset)}
              className="px-2.5 py-1 font-mono text-xs bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-md border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Output Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-6 sm:p-8 text-left">
        {/* Posture Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {exposure.level === 'danger' && (
                <ShieldAlert className="w-5 h-5 text-rose-500" />
              )}
              {exposure.level === 'warning' && (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              )}
              {exposure.level === 'safe' && (
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              )}
              <span
                className={`text-sm font-extrabold tracking-wide uppercase ${
                  exposure.level === 'danger'
                    ? 'text-rose-600 dark:text-rose-400'
                    : exposure.level === 'warning'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {exposure.status}
              </span>
            </div>
            <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {matchedItem ? matchedItem.code : `Query: ${cleanQuery || 'None'}`}
            </h3>
          </div>

          {matchedItem && (
            <button
              onClick={() => onSelectDetail(matchedItem)}
              className="px-4 py-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 rounded-lg transition-colors"
            >
              Inspect Full Spec →
            </button>
          )}
        </div>

        {/* Detailed Assessment */}
        <div className="py-6 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Assessment Summary
            </span>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
              {matchedItem ? matchedItem.security_note : exposure.summary}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Perimeter & Firewall Guidance
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {matchedItem?.remediation || exposure.guidance}
            </p>
          </div>
        </div>

        {/* Automated Defense Code Blocks */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Automated Linux Firewall & Audit Snippets
          </span>

          {/* UFW Rule */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">UFW Defense Command:</span>
              <button
                onClick={() =>
                  handleCopy(
                    exposure.level === 'danger'
                      ? `sudo ufw deny ${cleanQuery || '445'}/tcp comment 'Perimeter block'`
                      : `sudo ufw limit ${cleanQuery || '22'}/tcp comment 'Rate-limit'`,
                    'ufw'
                  )
                }
                className="hover:text-cyan-400 flex items-center gap-1"
              >
                {copiedKey === 'ufw' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <code className="text-xs font-mono text-emerald-400 block overflow-x-auto">
              {exposure.level === 'danger'
                ? `sudo ufw deny ${cleanQuery || '445'}/tcp comment 'Perimeter block'`
                : `sudo ufw limit ${cleanQuery || '22'}/tcp comment 'Rate-limit'`}
            </code>
          </div>

          {/* Audit Probe */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nmap / Probe Verification Command:</span>
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    `nmap -sV -sC -Pn -p ${cleanQuery || '443'} <target_ip_or_domain>`,
                    'nmap'
                  )
                }
                className="hover:text-cyan-400 flex items-center gap-1"
              >
                {copiedKey === 'nmap' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <code className="text-xs font-mono text-cyan-300 block overflow-x-auto">
              nmap -sV -sC -Pn -p {cleanQuery || '443'} &lt;target_ip_or_domain&gt;
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
