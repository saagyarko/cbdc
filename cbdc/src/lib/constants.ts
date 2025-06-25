import { LayoutDashboard, ArrowLeftRight, ShieldAlert, FileText, Settings, DollarSign, Euro, PoundSterling, JapaneseYen, Currency as GenericCurrencyIcon, TrendingUp, TrendingDown, AlertOctagon, CheckCircle2, Users, Clock } from 'lucide-react';
import type { NavItem, Transaction, FraudAlert, ComplianceMetric, OverviewStat, CBDC_ICONS_MAP, CBDCName } from '@/types';
import type { LucideIcon } from 'lucide-react';

export const APP_NAME = "CBDC Connect";

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: (pathname) => pathname === '/dashboard' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/dashboard/fraud-detection', label: 'AI Fraud Detection', icon: ShieldAlert },
  { href: '/dashboard/compliance', label: 'Compliance', icon: FileText, roles: ['admin'] },
  { href: '/dashboard/audit-log', label: 'Audit Log', icon: Users, roles: ['admin'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, match: (pathname) => pathname.startsWith('/dashboard/settings')},
];

export const CBDC_ICON_COMPONENTS: { [key in typeof CBDC_ICONS_MAP[keyof typeof CBDC_ICONS_MAP]]: LucideIcon } = {
  DollarSign: DollarSign,
  Euro: Euro,
  PoundSterling: PoundSterling,
  JapaneseYen: JapaneseYen,
  Currency: GenericCurrencyIcon,
};


export const MOCK_OVERVIEW_STATS: OverviewStat[] = [
  { title: 'Total Transactions', value: '1,234,567', icon: ArrowLeftRight, change: '+2.5%', changeType: 'positive', description: 'Last 24 hours' },
  { title: 'Transaction Volume', value: '$5.8B', icon: DollarSign, change: '+1.8%', changeType: 'positive', description: 'Last 24 hours' },
  { title: 'Active Fraud Alerts', value: '42', icon: AlertOctagon, change: '-10.5%', changeType: 'positive', description: 'Needs immediate attention' },
  { title: 'Compliance Status', value: '99.8%', icon: CheckCircle2, description: 'Overall AML/KYC adherence' },
];

const generateMockTransactionId = () => `TX${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
const getRandomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};
const currencies: CBDCName[] = ['USD_CBDC', 'EUR_CBDC', 'GBP_CBDC', 'JPY_CBDC'];
const statuses: Transaction['status'][] = ['Completed', 'Pending', 'Failed', 'Flagged'];

export const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 20 }, (_, i) => {
  const amount = parseFloat((Math.random() * 1000000 + 1000).toFixed(2));
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  return {
    id: generateMockTransactionId(),
    date: getRandomDate(new Date(2023, 0, 1), new Date()),
    sender: `Bank ${String.fromCharCode(65 + (i % 10))}`, // Bank A, Bank B ...
    receiver: `Bank ${String.fromCharCode(65 + ((i + 3) % 10))}`,
    amount,
    currency: currencies[i % currencies.length],
    cbdcType: currencies[i % currencies.length],
    status,
    description: `Settlement for trade agreement #${Math.floor(Math.random()*1000)}`,
    riskScore: status === 'Flagged' ? Math.floor(Math.random() * 40) + 60 : (status === 'Completed' ? Math.floor(Math.random() * 30) : undefined),
  };
}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


export const MOCK_FRAUD_ALERTS: FraudAlert[] = MOCK_TRANSACTIONS.filter(tx => tx.status === 'Flagged')
  .slice(0, 5)
  .map(tx => ({
    id: `ALERT-${tx.id}`,
    transactionId: tx.id,
    date: tx.date,
    reason: 'Unusual transaction pattern detected: High volume transfer to new beneficiary.',
    riskScore: tx.riskScore || 75,
    status: Math.random() > 0.5 ? 'New' : 'Reviewed',
  }));

export const MOCK_COMPLIANCE_METRICS: ComplianceMetric[] = [
  { name: 'AML Checks Passed', value: '99.95%', status: 'Compliant', lastChecked: new Date().toISOString() },
  { name: 'KYC Verifications', value: '100%', status: 'Compliant', lastChecked: new Date().toISOString() },
  { name: 'Suspicious Activity Reports (SARs) Filed', value: 12, status: 'Needs Review', lastChecked: new Date(Date.now() - 86400000).toISOString() }, // Yesterday
  { name: 'Sanctions Screening Hits', value: 0, status: 'Compliant', lastChecked: new Date().toISOString() },
  { name: 'Data Privacy Compliance (GDPR, etc.)', value: '98%', status: 'Needs Review', lastChecked: new Date(Date.now() - 86400000*2).toISOString() },
];

export const CBDC_CURRENCY_SYMBOLS: { [key in CBDCName]: string } = {
  USD_CBDC: '$',
  EUR_CBDC: '€',
  GBP_CBDC: '£',
  JPY_CBDC: '¥',
  OTHER_CBDC: '¤',
};

export { CBDC_ICONS_MAP } from '@/types';
