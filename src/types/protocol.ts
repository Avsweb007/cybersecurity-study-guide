export type CategoryType = 
  | 'Ports'
  | 'HTTP Status'
  | 'Headers & Flags'
  | 'DNS Records'
  | 'Signals & Exits'
  | 'OWASP Top 10';

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export interface DefenseSnippet {
  label: string;
  code: string;
}

export interface ReferenceItem {
  id: string;
  category: CategoryType;
  code: string;
  meaning: string;
  security_note: string;
  protocol_family?: string;
  risk_level?: RiskLevel;
  transport?: 'TCP' | 'UDP' | 'TCP/UDP' | 'N/A';
  attack_vectors?: string[];
  remediation?: string;
  audit_command?: string;
  defense_snippet?: DefenseSnippet;
  rfc_or_spec?: string;
  related_ids?: string[];
  custom?: boolean;
}

export interface ComparisonPair {
  id: string;
  title: string;
  itemAId: string;
  itemBId: string;
  keyDifference: string;
  analystSummary: string;
}

export type ViewMode = 'cards' | 'table' | 'flashcards' | 'triage' | 'compare';
