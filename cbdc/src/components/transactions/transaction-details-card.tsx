// src/components/transactions/transaction-details-card.tsx
import type { Transaction } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CBDC_ICON_COMPONENTS, CBDC_CURRENCY_SYMBOLS } from '@/lib/constants';
import { format } from 'date-fns';
import { ArrowRightCircle, Banknote, CalendarDays, CircleDollarSign, Hash, Info, Landmark, Users, AlertTriangle, CheckCircle2, ClockIcon, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionDetailsCardProps {
  transaction: Transaction;
}

const getStatusInfo = (status: Transaction['status']): {
  icon: React.ElementType;
  textClass: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  badgeClass?: string;
} => {
  switch (status) {
    case 'Completed':
      return { icon: CheckCircle2, textClass: 'text-accent', badgeVariant: 'default', badgeClass: 'bg-accent text-accent-foreground' };
    case 'Pending':
      return { icon: ClockIcon, textClass: 'text-yellow-500', badgeVariant: 'secondary' };
    case 'Failed':
      return { icon: XCircle, textClass: 'text-destructive', badgeVariant: 'destructive' };
    case 'Flagged':
      return { icon: AlertTriangle, textClass: 'text-orange-500', badgeVariant: 'outline', badgeClass: 'border-orange-500 text-orange-500' };
    default:
      return { icon: Info, textClass: 'text-muted-foreground', badgeVariant: 'secondary' };
  }
};

export function TransactionDetailsCard({ transaction }: TransactionDetailsCardProps) {
  const IconComponent = CBDC_ICON_COMPONENTS[transaction.cbdcType] || CBDC_ICON_COMPONENTS.Currency;
  const currencySymbol = CBDC_CURRENCY_SYMBOLS[transaction.cbdcType] || '';
  const statusInfo = getStatusInfo(transaction.status);

  const detailItems = [
    { label: 'Transaction ID', value: transaction.id, icon: Hash },
    { label: 'Date & Time', value: format(new Date(transaction.date), 'PPPpp'), icon: CalendarDays },
    { label: 'Sender', value: transaction.sender, icon: Landmark },
    { label: 'Receiver', value: transaction.receiver, icon: Landmark },
    { label: 'Amount', value: `${currencySymbol}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Banknote, valueClass: 'font-bold text-lg' },
    { label: 'Currency', value: transaction.currency.replace('_CBDC', ' CBDC'), icon: IconComponent },
    {
      label: 'Status',
      value: (
        <Badge variant={statusInfo.badgeVariant} className={cn("text-sm", statusInfo.badgeClass)}>
          <statusInfo.icon className="mr-1.5 h-4 w-4" />
          {transaction.status}
        </Badge>
      ),
      icon: Info,
    },
    { label: 'Description', value: transaction.description || 'N/A', icon: Info, fullWidth: true },
  ];

  if (transaction.riskScore !== undefined) {
    detailItems.push({
      label: 'AI Risk Score',
      value: (
        <div className="flex items-center space-x-2">
          <span className={cn("font-semibold", transaction.riskScore > 70 ? 'text-destructive' : transaction.riskScore > 40 ? 'text-yellow-600' : 'text-green-600')}>
            {transaction.riskScore} / 100
          </span>
          <Progress
            value={transaction.riskScore}
            className={cn(
              "h-2 w-24",
              transaction.riskScore > 70 ? 'bg-destructive/20 [&>div]:bg-destructive' :
              transaction.riskScore > 40 ? 'bg-yellow-500/20 [&>div]:bg-yellow-500' :
              'bg-accent/20 [&>div]:bg-accent'
            )}
          />
        </div>
      ),
      icon: AlertTriangle,
    });
  }


  return (
    <Card className="shadow-lg w-full">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {detailItems.map((item) => (
            <div key={item.label} className={cn("flex items-start space-x-3", item.fullWidth && "md:col-span-2")}>
              <item.icon className="h-5 w-5 text-primary mt-1 shrink-0" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                {typeof item.value === 'string' ? (
                  <p className={cn("text-base text-foreground break-all", item.valueClass)}>{item.value}</p>
                ) : (
                  <div className={cn("text-base text-foreground", item.valueClass)}>{item.value}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        {transaction.status === 'Pending' && (
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-md font-semibold mb-2 flex items-center"><ClockIcon className="mr-2 h-5 w-5 text-yellow-500" />Pending Action</h3>
            <p className="text-sm text-muted-foreground">This transaction is currently awaiting processing or confirmation. Progress:</p>
            <Progress value={50} className="mt-2 h-2.5" />
          </div>
        )}
        {transaction.status === 'Flagged' && (
          <div className="mt-6 pt-4 border-t border-orange-500/30">
             <h3 className="text-md font-semibold mb-2 flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />Flagged for Review</h3>
            <p className="text-sm text-orange-600">This transaction has been flagged by our AI system for potential issues. Please review carefully.</p>
            {/* Further actions could be added here, e.g., "Start Investigation" button */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}