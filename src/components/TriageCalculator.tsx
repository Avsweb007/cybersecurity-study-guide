import React, { useState } from 'react';
import { ReferenceItem } from '../types/protocol';
import {
  ShieldAlert,
  Terminal,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  Search,
  Globe,
  Radio,
  Info,
} from 'lucide-react';

interface TriageCalculatorProps {
  items: ReferenceItem[];
  onSelectDetail: (item: ReferenceItem) => void;
}

export const TriageCalculator: React.FC<TriageCalculatorProps> = ({ items, onSelectDetail }) => {
  const [query, setQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cleanQuery = query.trim().toLowerCase();
  const digitsOnly = cleanQuery.replace(/\D/g, '');
  const numericVal = digitsOnly ? parseInt(digitsOnly, 10) : null;

  // Determine if query is intended as an HTTP status code
  // Common HTTP status codes are 100-599. If a matched HTTP item exists, or digits match an HTTP code:
  const isLikelyHttp =
    cleanQuery.includes('http') ||
    cleanQuery.includes('status') ||
    cleanQuery.includes('forbidden') ||
    cleanQuery.includes('not found') ||
    cleanQuery.includes('unauthorized') ||
    items.some(
      (item) =>
        item.category === 'HTTP Status' &&
        (item.code.toLowerCase().includes(cleanQuery) ||
          item.id.toLowerCase() === cleanQuery ||
          (numericVal !== null && item.code.includes(String(numericVal))))
    );

  // Look up matched item with priority for HTTP Status when isLikelyHttp is true
  const matchedItem = items.find((item) => {
    if (!cleanQuery) return false;
    if (isLikelyHttp) {
      if (item.category === 'HTTP Status') {
        const itemCodeNum = item.code.replace(/\D/g, '');
        if (digitsOnly && itemCodeNum === digitsOnly) return true;
        if (item.code.toLowerCase().includes(cleanQuery)) return true;
        if (item.meaning.toLowerCase().includes(cleanQuery)) return true;
      }
    } else {
      // Prioritize Ports if not likely HTTP
      if (item.category === 'Ports') {
        const itemCodeNum = item.code.replace(/\D/g, '');
        if (digitsOnly && itemCodeNum === digitsOnly) return true;
        if (item.code.toLowerCase().includes(cleanQuery)) return true;
      }
    }
    // Fallback to any matching item
    const itemCodeNum = item.code.replace(/\D/g, '');
    if (digitsOnly && itemCodeNum && digitsOnly === itemCodeNum) return true;
    return (
      item.code.toLowerCase().includes(cleanQuery) ||
      item.meaning.toLowerCase().includes(cleanQuery) ||
      item.id.toLowerCase() === cleanQuery
    );
  });

  const isHttpEntry =
    matchedItem?.category === 'HTTP Status' ||
    (numericVal !== null &&
      [
        100, 101, 200, 201, 204, 301, 302, 304, 307, 308, 400, 401, 402, 403, 404, 405, 408, 409,
        410, 413, 418, 429, 500, 501, 502, 503, 504,
      ].includes(numericVal) &&
      !items.some((i) => i.category === 'Ports' && i.code === `Port ${numericVal}`));

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Determine Triage Assessment & Guidance
  const evaluateExposure = () => {
    if (isHttpEntry) {
      const codeNum = numericVal;
      if (codeNum === 403) {
        return {
          type: 'HTTP Status Code',
          status: '403 Forbidden (Client Error)',
          badge: 'Authorization Gate',
          level: 'warning',
          summary:
            '403 Forbidden means the server understood the request but refused to allow it. This can happen whether or not you’re logged in.',
          guidance:
            'Check server-side authorization policies, ACLs, role mappings, and Web Application Firewall (WAF) rule sets. Ensure sensitive endpoints do not leak stack traces or server version headers.',
          commandLabel: 'Curl Status Probe:',
          command: 'curl -I -sS -X GET https://<target_domain>/protected-resource',
          configLabel: 'Nginx Access Restriction Example:',
          configSnippet:
            "location ^~ /admin/ {\n    # Restrict to trusted administrative CIDR\n    allow 10.0.0.0/8;\n    deny all;\n}",
        };
      }

      if (codeNum === 404) {
        return {
          type: 'HTTP Status Code',
          status: '404 Not Found (Client Error)',
          badge: 'Resource Not Located',
          level: 'safe',
          summary:
            '404 Not Found indicates the server cannot find anything matching the Request-URI. Can be used defensively to prevent IDOR enumeration by masquerading unauthorized resources without disclosing their existence.',
          guidance:
            'Verify routing configuration, URL slug parameters, and rewrite rules. Configure custom 404 error handlers to prevent disclosing web server software banners or directory structures.',
          commandLabel: 'Curl Endpoint Probe:',
          command: 'curl -I -sS https://<target_domain>/resource-path',
          configLabel: 'Nginx Generic 404 Handler:',
          configSnippet:
            'error_page 404 /custom_404.html;\nlocation = /custom_404.html {\n    internal;\n}',
        };
      }

      if (codeNum === 401) {
        return {
          type: 'HTTP Status Code',
          status: '401 Unauthorized (Client Error)',
          badge: 'Authentication Required',
          level: 'safe',
          summary:
            'Missing or invalid authentication credentials. The response MUST include a WWW-Authenticate header. Indicates the client identity is unverified.',
          guidance:
            'Verify client credentials, JWT expiration/clock skew, or Bearer token header format.',
          commandLabel: 'Curl Auth Probe:',
          command: 'curl -I -sS https://<target_domain>/api/endpoint',
          configLabel: 'Express.js 401 Response:',
          configSnippet:
            'res.setHeader(\'WWW-Authenticate\', \'Bearer realm="api"\');\nres.status(401).json({ error: "Authentication required" });',
        };
      }

      if (codeNum === 429) {
        return {
          type: 'HTTP Status Code',
          status: '429 Too Many Requests (Rate Limited)',
          badge: 'Rate Limit Threshold',
          level: 'warning',
          summary:
            'The client has sent too many requests in a given amount of time. Serves as a primary defense against brute force, scraping, and credential stuffing.',
          guidance:
            'Include Retry-After header with wait seconds. Enforce sliding window token bucket rate limits per user account and client IP.',
          commandLabel: 'Curl Rate Limit Test:',
          command: 'curl -I -sS https://<target_domain>/api/login',
          configLabel: 'Nginx Rate Limit Zone:',
          configSnippet:
            'limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;\nlocation /api/ {\n    limit_req zone=api burst=20 nodelay;\n    limit_req_status 429;\n}',
        };
      }

      if (codeNum && codeNum >= 500) {
        return {
          type: 'HTTP Status Code',
          status: `${codeNum} Server Error (Upstream / Internal Failure)`,
          badge: 'Service Failure',
          level: 'danger',
          summary:
            matchedItem?.security_note ||
            `HTTP ${codeNum} indicates an unexpected server condition, upstream gateway timeout, or backend crash occurred while processing the request.`,
          guidance:
            matchedItem?.remediation ||
            'Check backend application logs, database connection pool exhaustion, memory utilization (OOM), and proxy timeout settings.',
          commandLabel: 'Curl Upstream Probe:',
          command: 'curl -I -v -sS https://<target_domain>/health',
          configLabel: 'Error Masking Configuration:',
          configSnippet:
            "// Do not leak stack traces to client browsers\napp.use((err, req, res, next) => {\n  logger.error(err);\n  res.status(500).json({ error: 'Internal Error', ref: incidentId });\n});",
        };
      }

      return {
        type: 'HTTP Status Code',
        status: matchedItem ? matchedItem.code : `HTTP ${codeNum || cleanQuery}`,
        badge: 'HTTP Specification',
        level: 'safe',
        summary:
          matchedItem?.security_note ||
          matchedItem?.meaning ||
          `HTTP status code ${codeNum || cleanQuery}.`,
        guidance:
          matchedItem?.remediation ||
          'Adhere to RFC 9110 specification for headers, caching, and safe retry methods.',
        commandLabel: 'Curl Header Inspection:',
        command: `curl -I -sS https://<target_domain>/`,
        configLabel: 'Diagnostic Command:',
        configSnippet: `curl -w "HTTP Status: %{http_code}\\nTime: %{time_total}s\\n" -o /dev/null -s https://<target_domain>/`,
      };
    }

    // Port Heuristics
    const portNum = numericVal;
    const criticalPorts = [445, 3389, 23, 21, 1433, 1521, 5900, 6379, 9200, 27017, 137, 138, 139];
    const restrictedPorts = [22, 88, 389, 3306, 5432, 25, 161];
    const standardPorts = [443, 80, 53];

    if (portNum && criticalPorts.includes(portNum)) {
      return {
        type: 'Network Service Port',
        status: 'CRITICAL: NEVER EXPOSE TO INTERNET',
        badge: 'Mass-Compromise Target',
        level: 'danger',
        summary: `Port ${portNum} is a high-frequency initial access and lateral movement vector. Exploits (e.g. EternalBlue, BlueKeep, unauthenticated Redis) against this port can lead to full system compromise.`,
        guidance: `Verify external perimeter firewalls drop traffic on port ${portNum}. Allow access strictly through an encrypted private VPN (WireGuard/Tailscale) with multi-factor authentication.`,
        commandLabel: 'Nmap Port Verification Probe:',
        command: `nmap -sV -sC -Pn -p ${portNum} <target_ip>`,
        configLabel: 'UFW Perimeter Drop Rule:',
        configSnippet: `sudo ufw deny ${portNum}/tcp comment 'Perimeter Block Port ${portNum}'`,
      };
    }

    if (portNum && restrictedPorts.includes(portNum)) {
      return {
        type: 'Network Service Port',
        status: 'HIGH RISK: RESTRICT TO INTERNAL IP / VPN',
        badge: 'Management Service',
        level: 'warning',
        summary: `Port ${portNum} handles management, directory, or database operations. It should never be exposed broadly to the open Internet without explicit IP whitelisting.`,
        guidance: `Enforce IP whitelisting, rate-limiting, and key-based authentication. Disable root logins and legacy ciphers.`,
        commandLabel: 'Nmap Security Probe:',
        command: `nmap -sV -p ${portNum} <target_ip>`,
        configLabel: 'UFW Rate Limit Rule:',
        configSnippet: `sudo ufw limit ${portNum}/tcp comment 'Rate-limit Port ${portNum}'`,
      };
    }

    if (portNum && standardPorts.includes(portNum)) {
      return {
        type: 'Network Service Port',
        status: 'STANDARD INTERNET-FACING SERVICE',
        badge: 'Permitted if Hardened',
        level: 'safe',
        summary: `Port ${portNum} is standard for public internet services (HTTPS / Web / DNS). Hardened configuration and TLS 1.2+ are required.`,
        guidance: `Deploy hardened TLS configuration with modern cipher suites and enforce HSTS with subdomains.`,
        commandLabel: 'Nmap / SSL Probe:',
        command: `nmap -sV --script ssl-enum-ciphers -p ${portNum} <target_domain>`,
        configLabel: 'UFW Allow Rule:',
        configSnippet: `sudo ufw allow ${portNum}/tcp comment 'Allow Public Traffic'`,
      };
    }

    return {
      type: 'Network Service Port',
      status: 'CUSTOM OR UNCOMMON SERVICE PORT',
      badge: 'Manual Audit Required',
      level: 'warning',
      summary: `Port ${cleanQuery || 'entered'} is not in standard web tiers. Unrecognized listening daemons expand attack surface.`,
      guidance: `Run an nmap version probe (-sV -sC) and check running process with 'ss -tulpn' on the target host.`,
      commandLabel: 'Nmap Service Probe:',
      command: `nmap -sV -sC -Pn -p ${cleanQuery || '8080'} <target_ip>`,
      configLabel: 'UFW Defense Rule:',
      configSnippet: `sudo ufw deny ${cleanQuery || '8080'}/tcp comment 'Block Uncommon Port'`,
    };
  };

  const exposure = evaluateExposure();

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-4">
      {/* Educational Clarification Banner (Requirement 3) */}
      <div className="mb-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3 text-left">
        <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">
            Educational Reference & Triage Tool
          </strong>
          <span>
            This tool gives general study guidance based on the number entered. It does not scan a
            device or network.
          </span>
        </div>
      </div>

      {/* Intro Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Protocol & Incident Triage Calculator
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto">
          Enter an HTTP code (e.g.{' '}
          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">404</span>,{' '}
          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">403</span>,{' '}
          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">502</span>) or a
          port (e.g.{' '}
          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">443</span>,{' '}
          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">22</span>,{' '}
          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">445</span>,{' '}
          <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">3389</span>) for
          instant study guidance.
        </p>

        {/* Input Bar */}
        <div className="relative max-w-md mx-auto mt-5">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type HTTP code (404, 403) or port (443, 22)..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-cyan-500 dark:focus:border-cyan-500 rounded-xl text-base font-mono tabular-nums text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none shadow-xs transition-all"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex items-center justify-center gap-2 flex-wrap mt-3 text-xs">
          <span className="text-slate-400">Quick tests:</span>
          {['404', '403', '443', '22', '401', '445', '3389', '502'].map((preset) => (
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-5 sm:p-8 text-left">
        {/* Posture Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                {exposure.type}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <span
                className={`text-xs font-extrabold tracking-wide uppercase ${
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
              className="px-4 py-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 rounded-lg transition-colors shrink-0"
            >
              Inspect Complete Spec →
            </button>
          )}
        </div>

        {/* Detailed Assessment */}
        <div className="py-5 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Meaning & Study Analysis
            </span>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
              {exposure.summary}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Recommended Defensive Hardening
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {exposure.guidance}
            </p>
          </div>
        </div>

        {/* Automated Reference Commands & Configuration */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Reference Command & Configuration Snippet
          </span>

          {/* Command */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>{exposure.commandLabel}</span>
              </span>
              <button
                onClick={() => handleCopy(exposure.command, 'cmd')}
                className="hover:text-cyan-400 flex items-center gap-1"
              >
                {copiedKey === 'cmd' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <code className="text-xs font-mono text-cyan-300 block overflow-x-auto">
              {exposure.command}
            </code>
          </div>

          {/* Config Snippet */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">{exposure.configLabel}</span>
              <button
                onClick={() => handleCopy(exposure.configSnippet, 'config')}
                className="hover:text-cyan-400 flex items-center gap-1"
              >
                {copiedKey === 'config' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-emerald-400 block overflow-x-auto whitespace-pre">
              {exposure.configSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
