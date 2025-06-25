import type { LucideIcon } from 'lucide-react';

export interface Transaction {
  id: string;
  date: string; // ISO string
  sender: string;
  receiver: string;
  amount: number;
  currency: string; // e.g., "USD_CBDC", "EUR_CBDC"
  status: 'Completed' | 'Pending' | 'Failed' | 'Flagged';
  cbdcType: keyof typeof CBDC_ICONS_MAP; 
  description?: string;
  riskScore?: number; // Optional: 0-100 if analyzed
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  date: string; // ISO string
  reason: string;
  riskScore: number; // 0-100
  status: 'New' | 'Reviewed' | 'Resolved';
}

export interface ComplianceMetric {
  name: string;
  value: string | number;
  status: 'Compliant' | 'Needs Review' | 'Non-Compliant';
  lastChecked: string; // ISO string
}

export interface OverviewStat {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string; // e.g., "+5.2%"
  changeType?: 'positive' | 'negative';
  description: string;
}

// Define a more specific type for CBDC icons if they come from a predefined map
export const CBDC_ICONS_MAP = {
  USD_CBDC: 'DollarSign',
  EUR_CBDC: 'Euro',
  GBP_CBDC: 'PoundSterling',
  JPY_CBDC: 'JapaneseYen',
  OTHER_CBDC: 'Currency',
} as const;

export type CBDCName = keyof typeof CBDC_ICONS_MAP;

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
  disabled?: boolean;
  roles?: string[];
};
