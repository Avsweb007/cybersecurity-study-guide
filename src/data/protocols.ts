import { ReferenceItem, ComparisonPair } from '../types/protocol';

export const INITIAL_REFERENCE_ITEMS: ReferenceItem[] = [
  // User supplied seed entries (kept exact)
  {
    id: "port-22",
    category: "Ports",
    code: "Port 22",
    meaning: "SSH (Secure Shell) / SFTP",
    security_note: "Used for secure remote access and encrypted file transfers.",
    protocol_family: "SSHv2",
    transport: "TCP",
    risk_level: "High",
    attack_vectors: [
      "Automated brute-force & credential stuffing attacks",
      "Vulnerable OpenSSH version exploits (e.g. regreSSHion CVE-2024-6387)",
      "Compromised SSH keys without passphrase protection"
    ],
    remediation: "Disable password auth (PasswordAuthentication no), enforce ED25519 public keys, disable root login (PermitRootLogin no), restrict IP ranges or enforce WireGuard/bastion access.",
    audit_command: "nmap -sV -p 22 --script ssh2-enum-algos,ssh-auth-methods <target>",
    defense_snippet: {
      label: "UFW Rate Limit & Fail2ban",
      code: "sudo ufw limit 22/tcp comment 'Rate-limit SSH'\nsudo apt install fail2ban -y"
    },
    rfc_or_spec: "RFC 4253",
    related_ids: ["port-23", "port-3389"]
  },
  {
    id: "http-403",
    category: "HTTP Status",
    code: "403 Forbidden",
    meaning: "Access denied by server policy or ACL.",
    security_note: "Indicates authentication succeeded, but authorization failed.",
    protocol_family: "HTTP/1.1 & HTTP/2",
    risk_level: "Informational",
    attack_vectors: [
      "403 Bypasses via URL path traversal (e.g. /admin/..;/), case sensitivity, or header spoofing (X-Original-URL, X-Forwarded-For: 127.0.0.1)",
      "Web Application Firewall (WAF) rule triggers on suspicious payloads"
    ],
    remediation: "Ensure RBAC/ABAC authorization is validated server-side, do not rely on URL path matching alone, configure custom error pages that don't leak server version banners.",
    audit_command: "curl -I -sS -X GET https://target.com/admin -H 'X-Forwarded-For: 127.0.0.1'",
    defense_snippet: {
      label: "Nginx Access Restriction",
      code: "location ^~ /admin/ {\n    allow 10.0.0.0/8;\n    deny all;\n}"
    },
    rfc_or_spec: "RFC 9110 §15.5.4",
    related_ids: ["http-401", "http-404"]
  },
  {
    id: "port-443",
    category: "Ports",
    code: "Port 443",
    meaning: "HTTPS (HTTP Secure / TLS)",
    security_note: "Used for encrypted web traffic (TLS/SSL) and is essential for secure online transactions and communication.",
    protocol_family: "TLS / HTTP/2 / HTTP/3",
    transport: "TCP/UDP",
    risk_level: "Low",
    attack_vectors: [
      "Outdated cipher negotiation (CBC ciphers, RC4, 3DES)",
      "Vulnerable TLS stacks and expired certificates without OCSP stapling",
      "SSL stripping attacks downgrading client to unencrypted Port 80 HTTP"
    ],
    remediation: "Enforce TLS 1.2 and TLS 1.3 only with Perfect Forward Secrecy (PFS), mandate HSTS with long max-age and preload, configure automated renewal with Let's Encrypt / Certbot.",
    audit_command: "nmap -sV --script ssl-enum-ciphers -p 443 <target>",
    defense_snippet: {
      label: "Nginx Modern TLS & HSTS",
      code: "ssl_protocols TLSv1.2 TLSv1.3;\nssl_ciphers HIGH:!aNULL:!MD5;\nadd_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;"
    },
    rfc_or_spec: "RFC 8446 / RFC 9110",
    related_ids: ["port-80", "header-hsts"]
  },

  // Additional Ports
  {
    id: "port-20-21",
    category: "Ports",
    code: "Port 21",
    meaning: "FTP (File Transfer Protocol - Control)",
    security_note: "Transmits credentials and payload in cleartext without TLS.",
    protocol_family: "FTP",
    transport: "TCP",
    risk_level: "Critical",
    attack_vectors: [
      "Cleartext packet sniffing on local network",
      "Anonymous login misconfigurations granting read/write access",
      "FTP bounce attacks"
    ],
    remediation: "Deprecate plaintext FTP in favor of SFTP (SSH Port 22) or FTPS (FTP over TLS Port 990). Block Port 21 on perimeter firewalls.",
    audit_command: "nmap -sV -p 21 --script ftp-anon,ftp-bounce <target>",
    defense_snippet: {
      label: "UFW Deny FTP",
      code: "sudo ufw deny 21/tcp comment 'Block legacy FTP'"
    },
    rfc_or_spec: "RFC 959",
    related_ids: ["port-22"]
  },
  {
    id: "port-23",
    category: "Ports",
    code: "Port 23",
    meaning: "Telnet (Unencrypted Remote Terminal)",
    security_note: "Zero cryptographic security. Passwords and commands sent in plain text.",
    protocol_family: "Telnet",
    transport: "TCP",
    risk_level: "Critical",
    attack_vectors: [
      "Man-in-the-Middle (MitM) sniffing of admin credentials",
      "IoT botnet scanning (e.g. Mirai botnet default creds brute forcing)"
    ],
    remediation: "Immediately disable and purge telnet daemon; replace with SSHv2. Ensure Port 23 is closed across all ingress/egress boundaries.",
    audit_command: "nmap -Pn -p 23 <target>",
    defense_snippet: {
      label: "IPTables Drop Telnet",
      code: "iptables -A INPUT -p tcp --dport 23 -j DROP"
    },
    rfc_or_spec: "RFC 854",
    related_ids: ["port-22"]
  },
  {
    id: "port-25",
    category: "Ports",
    code: "Port 25",
    meaning: "SMTP (Simple Mail Transfer Protocol - MTA Relay)",
    security_note: "Relays mail between servers. If misconfigured, becomes an open spam relay.",
    protocol_family: "SMTP",
    transport: "TCP",
    risk_level: "High",
    attack_vectors: [
      "Open relay exploitation for spam and phishing campaigns",
      "STARTTLS downgrade stripping attacks",
      "User enumeration via VRFY and EXPN commands"
    ],
    remediation: "Enforce strict sender verification (SPF, DKIM, DMARC), require mandatory TLS 1.3, close open relay, restrict submission to authenticated Port 587.",
    audit_command: "nmap -sV -p 25 --script smtp-open-relay,smtp-enum-users <target>",
    defense_snippet: {
      label: "Postfix Disable VRFY",
      code: "postconf -e 'disable_vrfy_command = yes'\npostconf -e 'smtpd_helo_required = yes'"
    },
    rfc_or_spec: "RFC 5321",
    related_ids: ["port-465", "port-587"]
  },
  {
    id: "port-53",
    category: "Ports",
    code: "Port 53",
    meaning: "DNS (Domain Name System)",
    security_note: "UDP-based queries can be spoofed for DDoS amplification reflection and cache poisoning.",
    protocol_family: "DNS",
    transport: "TCP/UDP",
    risk_level: "High",
    attack_vectors: [
      "DNS Amplification DDoS leveraging open recursive resolvers",
      "DNS cache poisoning (Kaminsky attack)",
      "Unrestricted AXFR zone transfers exposing internal network infrastructure",
      "DNS tunneling for covert command-and-control (C2) exfiltration"
    ],
    remediation: "Disable recursive queries on authoritative DNS, restrict AXFR zone transfers to authorized secondary IPs only, implement DNSSEC, use Response Rate Limiting (RRL).",
    audit_command: "dig @target domain.com AXFR",
    defense_snippet: {
      label: "BIND Restrict Zone Transfer",
      code: "allow-transfer { 192.168.1.50; };\nrecursion no;"
    },
    rfc_or_spec: "RFC 1035",
    related_ids: ["dns-a", "dns-txt"]
  },
  {
    id: "port-80",
    category: "Ports",
    code: "Port 80",
    meaning: "HTTP (Hypertext Transfer Protocol)",
    security_note: "Unencrypted web traffic vulnerable to eavesdropping, cookie theft, and injection.",
    protocol_family: "HTTP",
    transport: "TCP",
    risk_level: "Medium",
    attack_vectors: [
      "Plaintext session hijacking & credential interception",
      "Transparent proxy caching and ISP injection",
      "SSL stripping attacks"
    ],
    remediation: "Configure automatic 301 redirects from HTTP to HTTPS (Port 443) and enforce HTTP Strict Transport Security (HSTS).",
    audit_command: "curl -I http://target.com/",
    defense_snippet: {
      label: "Nginx HTTP to HTTPS 301 Redirect",
      code: "server {\n    listen 80 default_server;\n    return 301 https://$host$request_uri;\n}"
    },
    rfc_or_spec: "RFC 9110",
    related_ids: ["port-443", "header-hsts"]
  },
  {
    id: "port-88",
    category: "Ports",
    code: "Port 88",
    meaning: "Kerberos Authentication Service",
    security_note: "Core Windows Active Directory authentication service. Target for Kerberoasting.",
    protocol_family: "Kerberos v5",
    transport: "TCP/UDP",
    risk_level: "Critical",
    attack_vectors: [
      "Kerberoasting (requesting TGS service tickets with weak service account passwords for offline cracking)",
      "AS-REP Roasting on accounts with pre-authentication disabled",
      "Golden Ticket / Silver Ticket forgery"
    ],
    remediation: "Use Group Managed Service Accounts (gMSA) with 128-char AES keys, enable Kerberos pre-authentication, isolate domain controllers behind internal VLANs.",
    audit_command: "nmap -p 88 --script krb5-enum-users <target-dc>",
    defense_snippet: {
      label: "Firewall Restrict to Domain Subnet",
      code: "sudo ufw allow from 10.10.0.0/16 to any port 88 proto tcp"
    },
    rfc_or_spec: "RFC 4120",
    related_ids: ["port-389", "port-445"]
  },
  {
    id: "port-137-139",
    category: "Ports",
    code: "Ports 137-139",
    meaning: "NetBIOS (Name, Datagram, Session Service)",
    security_note: "Legacy Windows networking protocols susceptible to poisoning and reconnaissance.",
    protocol_family: "NetBIOS over TCP/IP",
    transport: "TCP/UDP",
    risk_level: "High",
    attack_vectors: [
      "LLMNR / NBT-NS poisoning via tools like Responder to harvest NTLMv2 hashes",
      "Domain and user enumeration without authentication"
    ],
    remediation: "Disable NetBIOS over TCP/IP in network adapter properties and disable LLMNR via Group Policy (GPO).",
    audit_command: "nmblookup -A <target-ip>",
    defense_snippet: {
      label: "Block NetBIOS at Gateway",
      code: "sudo ufw deny proto udp from any to any port 137:138\nsudo ufw deny proto tcp from any to any port 139"
    },
    rfc_or_spec: "RFC 1001 / 1002",
    related_ids: ["port-445"]
  },
  {
    id: "port-161-162",
    category: "Ports",
    code: "Port 161",
    meaning: "SNMP (Simple Network Management Protocol)",
    security_note: "v1 and v2c use cleartext community strings ('public'/'private') allowing device takeover.",
    protocol_family: "SNMP",
    transport: "UDP",
    risk_level: "High",
    attack_vectors: [
      "SNMP community string brute-forcing revealing full network topology, route tables, and running processes",
      "SNMP reflection DDoS amplification"
    ],
    remediation: "Migrate immediately to SNMPv3 with USM authentication (SHA) and privacy encryption (AES). Change or block default 'public' community.",
    audit_command: "snmpwalk -v 2c -c public <target>",
    defense_snippet: {
      label: "Restrict SNMP to Management IP",
      code: "sudo ufw allow from 192.168.1.100 to any port 161 proto udp"
    },
    rfc_or_spec: "RFC 3416",
    related_ids: ["port-514"]
  },
  {
    id: "port-389",
    category: "Ports",
    code: "Port 389",
    meaning: "LDAP (Lightweight Directory Access Protocol)",
    security_note: "Standard directory service queries in plaintext unless STARTTLS is enforced.",
    protocol_family: "LDAP",
    transport: "TCP/UDP",
    risk_level: "High",
    attack_vectors: [
      "Cleartext credential sniffing and LDAP bind hijacking",
      "Anonymous directory reconnaissance enumerating all AD users and groups",
      "CLDAP amplification DDoS via UDP 389"
    ],
    remediation: "Enforce LDAP signing and channel binding. Block UDP 389 from WAN. Migrate connections to LDAPS (TCP Port 636) or enforce STARTTLS.",
    audit_command: "nmap -p 389 --script ldap-rootdse,ldap-search <target>",
    defense_snippet: {
      label: "UFW Deny UDP 389 Amplification",
      code: "sudo ufw deny 389/udp comment 'Prevent CLDAP reflection'"
    },
    rfc_or_spec: "RFC 4511",
    related_ids: ["port-636", "port-88"]
  },

  {
    id: "port-445",
    category: "Ports",
    code: "Port 445",
    meaning: "SMB over IP (Server Message Block)",
    security_note: "Prime lateral movement vector for ransomware (WannaCry, EternalBlue, NotPetya).",
    protocol_family: "SMBv2 / SMBv3",
    transport: "TCP",
    risk_level: "Critical",
    attack_vectors: [
      "Remote Code Execution via SMBv1 vulnerabilities (MS17-010 EternalBlue)",
      "NTLM relay attacks against un-signed SMB sessions",
      "Lateral movement and PsExec remote service creation"
    ],
    remediation: "NEVER expose Port 445 to the public Internet! Disable SMBv1 entirely, enforce SMB signing and SMB encryption across internal networks.",
    audit_command: "nmap -p 445 --script smb-protocols,smb-security-mode,smb-vuln-ms17-010 <target>",
    defense_snippet: {
      label: "Perimeter Block SMB Inbound/Outbound",
      code: "sudo ufw deny 445/tcp comment 'Drop all Internet SMB traffic'"
    },
    rfc_or_spec: "MS-SMB2 Specification",
    related_ids: ["port-137-139", "port-3389"]
  },
  {
    id: "port-636",
    category: "Ports",
    code: "Port 636",
    meaning: "LDAPS (LDAP over SSL/TLS)",
    security_note: "Encrypted directory communication, protecting domain queries and auth binds from sniffing.",
    protocol_family: "LDAPS",
    transport: "TCP",
    risk_level: "Low",
    attack_vectors: [
      "Expired or untrusted self-signed root certificates",
      "Deprecated SSLv3 or TLS 1.0 protocols"
    ],
    remediation: "Use trusted enterprise PKI certificates and enforce TLS 1.2+ for all domain client queries.",
    audit_command: "openssl s_client -connect target:636 -showcerts",
    defense_snippet: {
      label: "Allow Secure LDAP Internal Only",
      code: "sudo ufw allow from 10.0.0.0/8 to any port 636 proto tcp"
    },
    rfc_or_spec: "RFC 4513",
    related_ids: ["port-389"]
  },
  {
    id: "port-1433",
    category: "Ports",
    code: "Port 1433",
    meaning: "Microsoft SQL Server (T-SQL)",
    security_note: "Database engine port; external exposure allows direct credential brute-forcing and xp_cmdshell execution.",
    protocol_family: "TDS (Tabular Data Stream)",
    transport: "TCP",
    risk_level: "Critical",
    attack_vectors: [
      "SQL SA account brute forcing and dictionary attacks",
      "Arbitrary OS command execution via xp_cmdshell stored procedure",
      "SQL injection pivot directly into database cluster"
    ],
    remediation: "Never expose directly to the Internet. Disable the default 'sa' account or use Windows Integrated Authentication. Disable xp_cmdshell.",
    audit_command: "nmap -p 1433 --script ms-sql-info,ms-sql-empty-password <target>",
    defense_snippet: {
      label: "Disable xp_cmdshell in T-SQL",
      code: "EXEC sp_configure 'show advanced options', 1; RECONFIGURE;\nEXEC sp_configure 'xp_cmdshell', 0; RECONFIGURE;"
    },
    rfc_or_spec: "MS-TDS Spec",
    related_ids: ["port-3306", "port-5432"]
  },
  {
    id: "port-3306",
    category: "Ports",
    code: "Port 3306",
    meaning: "MySQL / MariaDB Database",
    security_note: "Commonly targeted for credential stuffing, unauthenticated RCE, and data exfiltration.",
    protocol_family: "MySQL Protocol",
    transport: "TCP",
    risk_level: "Critical",
    attack_vectors: [
      "Root account brute force attacks",
      "User-defined function (UDF) exploits for OS level privilege escalation",
      "Data dumping via rogue MySQL server rogue-packet attacks"
    ],
    remediation: "Bind to localhost (127.0.0.1) or private VPC subnet only. Require TLS encryption for remote connections, avoid granting wildcard '%' host permissions.",
    audit_command: "nmap -sV -p 3306 --script mysql-info,mysql-empty-password <target>",
    defense_snippet: {
      label: "MySQL my.cnf Bind Address",
      code: "[mysqld]\nbind-address = 127.0.0.1\nrequire_secure_transport = ON"
    },
    rfc_or_spec: "MySQL Dev Reference",
    related_ids: ["port-5432", "port-1433"]
  },
  {
    id: "port-3389",
    category: "Ports",
    code: "Port 3389",
    meaning: "RDP (Remote Desktop Protocol)",
    security_note: "Top target for initial enterprise intrusion, BlueKeep vulnerability, and ransomware delivery.",
    protocol_family: "RDP",
    transport: "TCP/UDP",
    risk_level: "Critical",
    attack_vectors: [
      "Remote pre-authentication RCE exploits (e.g., BlueKeep CVE-2019-0708)",
      "Mass scanning and continuous credential stuffing / brute forcing",
      "Man-in-the-Middle credential interception if NLA is disabled"
    ],
    remediation: "Never expose Port 3389 directly to the Internet! Put behind an RD Gateway, VPN, or zero-trust broker (e.g. Cloudflare Access, Tailscale). Enforce Network Level Authentication (NLA) and MFA.",
    audit_command: "nmap -p 3389 --script rdp-enum-encryption,rdp-vuln-ms12-020 <target>",
    defense_snippet: {
      label: "Enforce NLA in Windows Registry",
      code: "reg add \"HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp\" /v UserAuthentication /t REG_DWORD /d 1 /f"
    },
    rfc_or_spec: "MS-RDPBCGR Spec",
    related_ids: ["port-22", "port-5900"]
  },
  {
    id: "port-5432",
    category: "Ports",
    code: "Port 5432",
    meaning: "PostgreSQL Database",
    security_note: "Target for credential brute force and privilege escalation via untrusted extensions.",
    protocol_family: "PostgreSQL Frontend/Backend Protocol",
    transport: "TCP",
    risk_level: "High",
    attack_vectors: [
      "Brute force targeting 'postgres' default user",
      "Command execution via COPY TO/FROM PROGRAM or language untrusted functions",
      "Misconfigured pg_hba.conf granting 'trust' authentication to foreign subnets"
    ],
    remediation: "Enforce scram-sha-256 in pg_hba.conf, mandate SSL connections (ssl=on), bind to private address only.",
    audit_command: "nmap -p 5432 --script pgsql-databases <target>",
    defense_snippet: {
      label: "pg_hba.conf SCRAM Enforce",
      code: "# TYPE  DATABASE  USER  ADDRESS       METHOD\nhostssl all       all   10.0.0.0/8    scram-sha-256"
    },
    rfc_or_spec: "PostgreSQL Docs §53",
    related_ids: ["port-3306"]
  },
  {
    id: "port-5900",
    category: "Ports",
    code: "Port 5900",
    meaning: "VNC (Virtual Network Computing - RFB)",
    security_note: "Often left unauthenticated or with 8-character DES password limits easily cracked.",
    protocol_family: "RFB (Remote Frame Buffer)",
    transport: "TCP",
    risk_level: "Critical",
    attack_vectors: [
      "Zero-authentication VNC servers allowing full desktop viewing & control",
      "Weak 8-char DES password cracking (VNC password format)",
      "Unencrypted display streaming over the Internet"
    ],
    remediation: "Block 5900 from WAN. Tunnel VNC connections strictly through SSH (ssh -L 5900:localhost:5900 user@server) or VPN.",
    audit_command: "nmap -p 5900 --script vnc-info,vnc-title <target>",
    defense_snippet: {
      label: "UFW Block VNC Worldwide",
      code: "sudo ufw deny 5900/tcp comment 'Never expose VNC directly'"
    },
    rfc_or_spec: "RFC 6143",
    related_ids: ["port-3389"]
  },
  {
    id: "port-6379",
    category: "Ports",
    code: "Port 6379",
    meaning: "Redis In-Memory Data Store",
    security_note: "Historically ships with no authentication by default. Trivial RCE via SSH key writing.",
    protocol_family: "RESP (REdis Serialization Protocol)",
    transport: "TCP",
    risk_level: "Critical",
    attack_vectors: [
      "Unauthenticated remote access allowing writing unauthorized SSH authorized_keys to root",
      "Cron job injection via Redis database file dump (CONFIG SET dir /var/spool/cron)",
      "Exfiltration of cached tokens, user sessions, and API keys"
    ],
    remediation: "Enable protected-mode yes, bind only to 127.0.0.1, require strong password (requirepass), rename dangerous commands (FLUSHALL, CONFIG).",
    audit_command: "redis-cli -h target -p 6379 info",
    defense_snippet: {
      label: "redis.conf Security Baseline",
      code: "bind 127.0.0.1 -::1\nprotected-mode yes\nrequirepass ComplexSecurePassword123!\nrename-command CONFIG \"\""
    },
    rfc_or_spec: "Redis Security Model",
    related_ids: ["port-9200"]
  },
  {
    id: "port-9200",
    category: "Ports",
    code: "Port 9200",
    meaning: "Elasticsearch REST API",
    security_note: "Exposing port 9200 without X-Pack / Security enabled exposes all indexed company data.",
    protocol_family: "HTTP / REST",
    transport: "TCP",
    risk_level: "Critical",
    attack_vectors: [
      "Public database leaks exposing millions of customer records without auth",
      "RCE via historical Log4j / Groovy scripting vulnerabilities",
      "Cluster disruption and arbitrary index deletion via simple HTTP DELETE"
    ],
    remediation: "Enable Elasticsearch security features (xpack.security.enabled: true), configure HTTPS (xpack.security.http.ssl.enabled), bind to loopback/VPC.",
    audit_command: "curl -s http://target:9200/_cat/indices?v",
    defense_snippet: {
      label: "Elasticsearch yml Auth Enforce",
      code: "network.host: [\"_local_\" , \"10.0.0.5\"]\nxpack.security.enabled: true\nxpack.security.enrollment.enabled: true"
    },
    rfc_or_spec: "Elastic Guide",
    related_ids: ["port-6379"]
  },

  // HTTP Status Codes
  {
    id: "http-401",
    category: "HTTP Status",
    code: "401 Unauthorized",
    meaning: "Missing or invalid authentication credentials.",
    security_note: "Response MUST include a WWW-Authenticate header. Indicates user identity is unverified.",
    protocol_family: "HTTP/1.1 & HTTP/2",
    risk_level: "Informational",
    attack_vectors: [
      "Credential brute forcing on login endpoints",
      "Token expiration or signature tampering detection"
    ],
    remediation: "Respond with 401 when the Authorization header is missing, expired, or invalid. Include WWW-Authenticate: Bearer or Basic. Distinguish from 403 (where identity is known).",
    audit_command: "curl -I -sS https://target.com/api/user",
    defense_snippet: {
      label: "Express.js 401 Response",
      code: "if (!token) {\n  res.setHeader('WWW-Authenticate', 'Bearer realm=\"api\"');\n  return res.status(401).json({ error: 'Authentication required' });\n}"
    },
    rfc_or_spec: "RFC 9110 §15.5.2",
    related_ids: ["http-403", "http-404"]
  },
  {
    id: "http-400",
    category: "HTTP Status",
    code: "400 Bad Request",
    meaning: "Malformed request syntax, invalid query, or deceptive routing.",
    security_note: "Common symptom of request smuggling, invalid JSON, or oversized headers.",
    protocol_family: "HTTP/1.1 & HTTP/2",
    risk_level: "Informational",
    attack_vectors: [
      "HTTP Request Smuggling (CL.TE or TE.CL discrepancies)",
      "Cookie overflow attacks attempting header bloat"
    ],
    remediation: "Validate inputs against a strict schema (e.g. Zod), return clean error details without stack traces, ensure reverse proxy and backend agree on HTTP parsing.",
    audit_command: "curl -I -X POST -d '{\"invalid_json' https://target.com/api",
    defense_snippet: {
      label: "Input Schema Rejection",
      code: "if (!result.success) {\n  return res.status(400).json({ error: 'Validation failed' });\n}"
    },
    rfc_or_spec: "RFC 9110 §15.5.1",
    related_ids: ["http-422"]
  },
  {
    id: "http-404",
    category: "HTTP Status",
    code: "404 Not Found",
    meaning: "The server has not found anything matching the Request-URI.",
    security_note: "Can be used defensively to prevent IDOR enumeration by masquerading unauthorized resources.",
    protocol_family: "HTTP/1.1 & HTTP/2",
    risk_level: "Informational",
    attack_vectors: [
      "Directory fuzzing / brute forcing (Gobuster, ffuf) discovering hidden admin portals or backup files (.env, .git)",
      "Resource enumeration revealing valid vs invalid entity IDs"
    ],
    remediation: "To prevent IDOR enumeration, return 404 instead of 403 for private tenant resources. Configure generic 404 error handlers that do not disclose web server software versions.",
    audit_command: "ffuf -u https://target.com/FUZZ -w wordlist.txt -mc 200,301,302",
    defense_snippet: {
      label: "Nginx Generic 404",
      code: "error_page 404 /custom_404.html;\nlocation = /custom_404.html {\n    internal;\n}"
    },
    rfc_or_spec: "RFC 9110 §15.5.5",
    related_ids: ["http-403", "http-410"]
  },
  {
    id: "http-405",
    category: "HTTP Status",
    code: "405 Method Not Allowed",
    meaning: "The request method is known by server but not supported by target resource.",
    security_note: "The server MUST generate an 'Allow' header indicating supported methods (e.g. GET, HEAD).",
    protocol_family: "HTTP/1.1 & HTTP/2",
    risk_level: "Informational",
    attack_vectors: [
      "Testing for legacy or dangerous HTTP methods (PUT, DELETE, TRACE, DEBUG)",
      "Cross-Site Tracing (XST) if TRACE is enabled on web server"
    ],
    remediation: "Disable TRACE, TRACK, and WebDAV methods unless strictly required. Return Allow header accurately.",
    audit_command: "curl -X OPTIONS -i https://target.com/api",
    defense_snippet: {
      label: "Apache Disable TRACE",
      code: "TraceEnable Off"
    },
    rfc_or_spec: "RFC 9110 §15.5.6",
    related_ids: ["http-400"]
  },
  {
    id: "http-429",
    category: "HTTP Status",
    code: "429 Too Many Requests",
    meaning: "The user has sent too many requests in a given amount of time (rate limited).",
    security_note: "Primary defensive countermeasure against brute force, scraping, and DoS attacks.",
    protocol_family: "HTTP/1.1 & HTTP/2",
    risk_level: "Informational",
    attack_vectors: [
      "Rate limit bypasses via header spoofing (X-Forwarded-For, Client-IP) or IPv6 subnet rotation",
      "Distributed credential stuffing overcoming per-IP thresholds"
    ],
    remediation: "Include 'Retry-After' header indicating wait seconds. Implement rate limits per authenticated user/token and per IP behind trusted proxy configurations.",
    audit_command: "curl -I https://target.com/login",
    defense_snippet: {
      label: "Nginx Rate Limit Zone",
      code: "limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;\nlocation /api/login {\n    limit_req zone=login_limit burst=3 nodelay;\n    limit_req_status 429;\n}"
    },
    rfc_or_spec: "RFC 6585 §4",
    related_ids: ["http-503"]
  },
  {
    id: "http-500",
    category: "HTTP Status",
    code: "500 Internal Server Error",
    meaning: "Generic catch-all error when an unexpected condition occurred on the server.",
    security_note: "Critical risk if the response body contains verbose stack traces, database queries, or file paths.",
    protocol_family: "HTTP/1.1 & HTTP/2",
    risk_level: "Medium",
    attack_vectors: [
      "Information disclosure exposing application framework, SQL syntax, or internal filesystem hierarchy",
      "Fuzzing inputs to trigger unhandled exceptions leading to denial of service"
    ],
    remediation: "Never return debug stack traces to client browsers in production. Log detailed exceptions to secure centralized logging systems and return an opaque error tracking ID.",
    audit_command: "curl -i -X POST -H 'Content-Type: application/json' -d '{\"id\": \"' https://target.com/",
    defense_snippet: {
      label: "Production Error Catcher",
      code: "app.use((err, req, res, next) => {\n  const incidentId = crypto.randomUUID();\n  logger.error({ incidentId, err });\n  res.status(500).json({ error: 'Internal Error', id: incidentId });\n});"
    },
    rfc_or_spec: "RFC 9110 §15.6.1",
    related_ids: ["http-502", "http-504"]
  },
  {
    id: "http-502",
    category: "HTTP Status",
    code: "502 Bad Gateway",
    meaning: "The server acting as gateway/proxy received an invalid response from upstream.",
    security_note: "Indicates backend daemon (e.g. Node.js, PHP-FPM, Python Gunicorn) crashed or returned unparseable bytes.",
    protocol_family: "HTTP/1.1 & HTTP/2",
    risk_level: "Informational",
    attack_vectors: [
      "Targeted denial of service triggering memory leaks or segmentation faults in upstream apps",
      "TLS certificate mismatches between reverse proxy and upstream service"
    ],
    remediation: "Check upstream process status (systemctl status or container logs), verify proxy connection timeouts, verify upstream SSL validity.",
    audit_command: "curl -I -v https://target.com/",
    defense_snippet: {
      label: "Nginx Proxy Upstream Settings",
      code: "proxy_connect_timeout 5s;\nproxy_read_timeout 60s;\nproxy_next_upstream error timeout http_502;"
    },
    rfc_or_spec: "RFC 9110 §15.6.3",
    related_ids: ["http-504"]
  },
  {
    id: "http-504",
    category: "HTTP Status",
    code: "504 Gateway Timeout",
    meaning: "The server acting as proxy did not receive timely response from upstream.",
    security_note: "Can signify slowloris attacks, database lock contention, or upstream resource exhaustion.",
    protocol_family: "HTTP/1.1 & HTTP/2",
    risk_level: "Informational",
    attack_vectors: [
      "Algorithmic complexity attacks (e.g. ReDoS regular expression catastrophic backtracking)",
      "Exhausting backend thread pools via slow database queries"
    ],
    remediation: "Set aggressive database query timeouts, review slow query logs, implement circuit breakers for third-party microservices.",
    audit_command: "curl -w 'Total Time: %{time_total}s\\n' -o /dev/null -s https://target.com/slow-endpoint",
    defense_snippet: {
      label: "PostgreSQL Statement Timeout",
      code: "SET statement_timeout = '15s';"
    },
    rfc_or_spec: "RFC 9110 §15.6.5",
    related_ids: ["http-502"]
  },

  // Security Headers & Flags
  {
    id: "header-hsts",
    category: "Headers & Flags",
    code: "Strict-Transport-Security (HSTS)",
    meaning: "Forces browser to interact with domain exclusively over HTTPS.",
    security_note: "Prevents SSL stripping (sslstrip) and man-in-the-middle attacks on open Wi-Fi.",
    protocol_family: "HTTP Response Header",
    risk_level: "Informational",
    attack_vectors: [
      "SSL stripping during initial unencrypted HTTP connection before HSTS is received (unless preloaded)"
    ],
    remediation: "Set 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' and submit domain to the Chrome HSTS preload list.",
    audit_command: "curl -sI https://target.com | grep -i strict-transport-security",
    defense_snippet: {
      label: "Nginx HSTS Header",
      code: "add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;"
    },
    rfc_or_spec: "RFC 6797",
    related_ids: ["port-80", "port-443"]
  },
  {
    id: "header-csp",
    category: "Headers & Flags",
    code: "Content-Security-Policy (CSP)",
    meaning: "Restricts resource origins (scripts, styles, images) executable by browser.",
    security_note: "The single most effective browser defense against Cross-Site Scripting (XSS) and data injection.",
    protocol_family: "HTTP Response Header",
    risk_level: "Informational",
    attack_vectors: [
      "Stored and Reflected XSS executing malicious scripts",
      "Data exfiltration via unauthorized image or fetch beacons"
    ],
    remediation: "Enforce strict CSP: default-src 'self'; script-src 'self' 'nonce-RANDOM'; object-src 'none'; base-uri 'self'; require-trusted-types-for 'script';",
    audit_command: "curl -sI https://target.com | grep -i content-security-policy",
    defense_snippet: {
      label: "Strict Baseline CSP",
      code: "add_header Content-Security-Policy \"default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';\" always;"
    },
    rfc_or_spec: "W3C CSP Level 3",
    related_ids: ["header-xfo"]
  },
  {
    id: "header-xfo",
    category: "Headers & Flags",
    code: "X-Frame-Options",
    meaning: "Controls whether a browser should be allowed to render a page in a <frame>, <iframe>, or <embed>.",
    security_note: "Prevents Clickjacking attacks where attacker overlays invisible iframe to hijack user clicks.",
    protocol_family: "HTTP Response Header",
    risk_level: "Informational",
    attack_vectors: [
      "UI redressing / Clickjacking tricking authenticated users into transferring funds or changing settings"
    ],
    remediation: "Set 'X-Frame-Options: DENY' or 'X-Frame-Options: SAMEORIGIN', and pair with CSP 'frame-ancestors 'none''.",
    audit_command: "curl -sI https://target.com | grep -i x-frame-options",
    defense_snippet: {
      label: "Nginx Anti-Clickjacking",
      code: "add_header X-Frame-Options \"DENY\" always;"
    },
    rfc_or_spec: "RFC 7034",
    related_ids: ["header-csp"]
  },
  {
    id: "header-samesite",
    category: "Headers & Flags",
    code: "Cookie SameSite=Lax / Strict",
    meaning: "Controls whether cookies are sent with cross-site requests.",
    security_note: "Dramatically reduces Cross-Site Request Forgery (CSRF) risk by blocking cross-site session cookie transmission.",
    protocol_family: "Set-Cookie Attribute",
    risk_level: "Informational",
    attack_vectors: [
      "Cross-Site Request Forgery (CSRF) executing unauthorized transactions via victim's active session"
    ],
    remediation: "Always configure session cookies with 'SameSite=Lax' (or 'Strict' for sensitive admin workflows), paired with 'Secure' and 'HttpOnly'.",
    audit_command: "curl -sI https://target.com | grep -i set-cookie",
    defense_snippet: {
      label: "Secure Cookie Set",
      code: "Set-Cookie: session_id=xyz; Secure; HttpOnly; SameSite=Lax; Path=/"
    },
    rfc_or_spec: "RFC 6265bis",
    related_ids: ["header-cors"]
  },
  {
    id: "header-cors",
    category: "Headers & Flags",
    code: "CORS: Access-Control-Allow-Origin",
    meaning: "Declares which foreign origins are permitted to read HTTP response data in browsers.",
    security_note: "Wildcard '*' combined with credentials (allow-credentials: true) creates extreme vulnerability.",
    protocol_family: "HTTP Header",
    risk_level: "High",
    attack_vectors: [
      "CORS misconfigurations (e.g. blindly reflecting Origin header or trusting null origin) enabling malicious sites to steal private user JSON"
    ],
    remediation: "Never blindly mirror the 'Origin' header. Use an explicit whitelist of trusted domains and avoid wildcard '*' if credentials are required.",
    audit_command: "curl -H 'Origin: https://evil.com' -I https://target.com/api/data",
    defense_snippet: {
      label: "Express Whitelist CORS",
      code: "const allowed = ['https://trusted.com'];\nif (allowed.includes(req.headers.origin)) {\n  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);\n}"
    },
    rfc_or_spec: "W3C Fetch Standard",
    related_ids: ["header-csp"]
  },

  // DNS Records
  {
    id: "dns-txt-spf",
    category: "DNS Records",
    code: "TXT (SPF / DKIM / DMARC)",
    meaning: "Domain email authentication & spoofing defense records.",
    security_note: "Missing or permissive SPF (+all or ?all) allows cybercriminals to forge emails from your domain.",
    protocol_family: "DNS TXT",
    risk_level: "High",
    attack_vectors: [
      "CEO fraud / Business Email Compromise (BEC) and phishing using domain impersonation"
    ],
    remediation: "Publish strict SPF: 'v=spf1 include:_spf.google.com -all'. Enforce DMARC policy: 'v=DMARC1; p=reject; rua=mailto:dmarc@domain.com'.",
    audit_command: "dig +short TXT domain.com && dig +short TXT _dmarc.domain.com",
    defense_snippet: {
      label: "DMARC Enforcement TXT Record",
      code: "_dmarc.yourdomain.com. IN TXT \"v=DMARC1; p=reject; sp=reject; pct=100; rua=mailto:dmarc-reports@yourdomain.com\""
    },
    rfc_or_spec: "RFC 7208 / RFC 7489",
    related_ids: ["dns-mx"]
  },
  {
    id: "dns-cname",
    category: "DNS Records",
    code: "CNAME (Canonical Name)",
    meaning: "Maps an alias domain name to an external canonical domain.",
    security_note: "Dangling CNAMEs pointing to de-provisioned cloud buckets (S3, GitHub Pages, Azure) enable Subdomain Takeover.",
    protocol_family: "DNS CNAME",
    risk_level: "High",
    attack_vectors: [
      "Subdomain takeover: attacker registers the abandoned third-party cloud service and claims the corporate subdomain"
    ],
    remediation: "Regularly audit DNS zones for dangling CNAME pointers. Immediately delete CNAME records when decommissioning SaaS or CDN resources.",
    audit_command: "dig CNAME sub.domain.com +short",
    defense_snippet: {
      label: "DNS Audit Script",
      code: "# Check CNAME resolution status\ndig CNAME old-blog.company.com +trace"
    },
    rfc_or_spec: "RFC 1035 §3.3.1",
    related_ids: ["port-53"]
  },

  // Signals & Exits
  {
    id: "sig-kill-9",
    category: "Signals & Exits",
    code: "SIGKILL (Signal 9)",
    meaning: "Immediate termination signal sent directly to OS kernel.",
    security_note: "Cannot be caught, blocked, or ignored by the process. Leaves temporary locks, sockets, and uncommitted writes.",
    protocol_family: "POSIX Signals",
    risk_level: "Medium",
    attack_vectors: [
      "Malicious termination of security agents (EDR/antivirus) by compromised root processes",
      "Data corruption during sudden database process termination"
    ],
    remediation: "Use SIGTERM (15) first to allow graceful cleanup. Reserve SIGKILL (9) strictly for un-responsive frozen processes or emergency containment.",
    audit_command: "kill -9 <PID>",
    defense_snippet: {
      label: "Graceful Termination Flow in Bash",
      code: "kill -15 $PID\nsleep 5\nkill -0 $PID 2>/dev/null && kill -9 $PID"
    },
    rfc_or_spec: "POSIX.1-2017",
    related_ids: ["sig-term-15"]
  },
  {
    id: "sig-term-15",
    category: "Signals & Exits",
    code: "SIGTERM (Signal 15)",
    meaning: "Standard termination signal requesting process to shut down cleanly.",
    security_note: "Can be caught and handled by application to close database pools, flush logs, and release socket locks.",
    protocol_family: "POSIX Signals",
    risk_level: "Informational",
    attack_vectors: [
      "Process hanging indefinitely if signal handler deadlocks or ignores termination"
    ],
    remediation: "Always register graceful shutdown handlers in Node.js, Go, or Python to close active connections before exiting.",
    audit_command: "kill -15 <PID>",
    defense_snippet: {
      label: "Node.js Graceful Shutdown",
      code: "process.on('SIGTERM', () => {\n  server.close(() => process.exit(0));\n});"
    },
    rfc_or_spec: "POSIX.1-2017",
    related_ids: ["sig-kill-9"]
  },
  {
    id: "exit-code-137",
    category: "Signals & Exits",
    code: "Exit Code 137",
    meaning: "Process killed by OS due to SIGKILL (128 + 9 = 137) - Usually Linux OOM Killer.",
    security_note: "Often indicates memory exhaustion or DoS via unbounded memory allocation payloads.",
    protocol_family: "Linux Process Return Code",
    risk_level: "Medium",
    attack_vectors: [
      "Zip bomb / decompression bomb or unbounded JSON parsing consuming all system RAM"
    ],
    remediation: "Set memory limits in Docker/K8s, inspect dmesg (`dmesg -T | grep -i oom`), and enforce maximum payload sizes in web servers.",
    audit_command: "dmesg -T | grep -E -i 'oom|killed process'",
    defense_snippet: {
      label: "Docker Memory Limit",
      code: "docker run -m 512m --memory-swap 512m my-secure-app"
    },
    rfc_or_spec: "Linux Exit Codes",
    related_ids: ["sig-kill-9"]
  },

  // OWASP Top 10
  {
    id: "owasp-a01",
    category: "OWASP Top 10",
    code: "A01:2021 Broken Access Control",
    meaning: "Failure to enforce authorization constraints allowing users to act outside permissions.",
    security_note: "Number 1 vulnerability in web applications. Includes IDOR, privilege escalation, and CORS misconfigs.",
    protocol_family: "Application Security",
    risk_level: "Critical",
    attack_vectors: [
      "Insecure Direct Object References (IDOR): changing id=100 to id=101 in URL to view another user's invoice",
      "Forced browsing to administrative URLs (/admin/users)",
      "Metadata manipulation (tampering with JWT roles or claims client-side)"
    ],
    remediation: "Deny access by default. Enforce server-side record ownership checks on every request: SELECT * FROM records WHERE id = ? AND tenant_id = current_user.tenant_id.",
    audit_command: "curl -H 'Authorization: Bearer <low_priv_token>' https://target.com/api/tenant/2/secrets",
    defense_snippet: {
      label: "Record Ownership Check",
      code: "const record = await db.documents.findUnique({ where: { id } });\nif (!record || record.userId !== req.user.id) {\n  return res.status(404).json({ error: 'Not found' });\n}"
    },
    rfc_or_spec: "OWASP Top 10 A01",
    related_ids: ["http-403", "http-401"]
  },
  {
    id: "owasp-a10",
    category: "OWASP Top 10",
    code: "A10:2021 SSRF (Server-Side Request Forgery)",
    meaning: "Web server fetches remote resource without validating user-supplied destination URL.",
    security_note: "Permits attackers to query internal cloud metadata endpoints (169.254.169.254) and VPC services.",
    protocol_family: "Application Security",
    risk_level: "Critical",
    attack_vectors: [
      "Stealing AWS IAM temporary credentials via http://169.254.169.254/latest/meta-data/iam/security-credentials/",
      "Scanning internal network ports (e.g. http://127.0.0.1:6379) from the external web app"
    ],
    remediation: "Enforce IMDSv2 on AWS EC2, validate and resolve URLs against a strict domain whitelist, block loopback and RFC 1918 private IP ranges at the network and DNS resolution layer.",
    audit_command: "curl -s -X POST https://target.com/fetch -d 'url=http://169.254.169.254/latest/meta-data/'",
    defense_snippet: {
      label: "AWS IMDSv2 Enforce",
      code: "aws ec2 modify-instance-metadata-options \\\n    --instance-id i-1234567890abcdef0 \\\n    --http-tokens required"
    },
    rfc_or_spec: "OWASP Top 10 A10",
    related_ids: ["port-6379"]
  }
];

export const PRESET_COMPARISONS: ComparisonPair[] = [
  {
    id: "comp-401-vs-403",
    title: "401 Unauthorized vs. 403 Forbidden",
    itemAId: "http-401",
    itemBId: "http-403",
    keyDifference: "Authentication (Who are you?) vs. Authorization (Are you permitted?)",
    analystSummary: "401 means the client provided no credentials or invalid credentials (identity unconfirmed; must return WWW-Authenticate). 403 means the identity IS established and understood, but server policies or ACLs strictly forbid the action. Re-authenticating with the same user will not solve a 403."
  },
  {
    id: "comp-22-vs-23",
    title: "Port 22 (SSH) vs. Port 23 (Telnet)",
    itemAId: "port-22",
    itemBId: "port-23",
    keyDifference: "End-to-end encrypted cryptographic tunnel vs. cleartext transmission",
    analystSummary: "Port 22 SSH uses public-key cryptography and modern cipher suites to encrypt commands, output, and credentials. Port 23 Telnet transmits every keystroke, username, and password in plain ASCII, immediately interceptable by packet sniffers (Wireshark) on any intermediary network."
  },
  {
    id: "comp-80-vs-443",
    title: "Port 80 (HTTP) vs. Port 443 (HTTPS)",
    itemAId: "port-80",
    itemBId: "port-443",
    keyDifference: "Plaintext transport vs. TLS encrypted encapsulation",
    analystSummary: "Port 80 lacks confidentiality, integrity, and authenticity; attackers can inject scripts, hijack session cookies, or alter content. Port 443 wraps HTTP inside Transport Layer Security (TLS), authenticating server identity via X.509 certificates and guaranteeing tamper-proof packet encryption."
  },
  {
    id: "comp-389-vs-636",
    title: "Port 389 (LDAP) vs. Port 636 (LDAPS)",
    itemAId: "port-389",
    itemBId: "port-636",
    keyDifference: "Unencrypted directory protocol vs. SSL/TLS encrypted directory bind",
    analystSummary: "Port 389 sends directory queries and simple binds in cleartext unless explicit STARTTLS is negotiated, making internal Active Directory credentials vulnerable to eavesdropping. Port 636 establishes TLS immediately upon socket connection before any LDAP payload is transmitted."
  },
  {
    id: "comp-kill-vs-term",
    title: "SIGKILL (9) vs. SIGTERM (15)",
    itemAId: "sig-kill-9",
    itemBId: "sig-term-15",
    keyDifference: "Uncatchable kernel termination vs. cooperative graceful shutdown request",
    analystSummary: "SIGTERM (15) asks the process politely to exit, allowing it to complete in-flight transactions, close database handles, and delete pid/socket files. SIGKILL (9) cannot be intercepted by the target process; the kernel forcibly unmaps its memory immediately, risking corrupted state."
  }
];
