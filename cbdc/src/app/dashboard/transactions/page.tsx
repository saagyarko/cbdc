// src/app/dashboard/transactions/page.tsx
import { TransactionsList } from '@/components/transactions/transactions-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">All Transactions</CardTitle>
          <CardDescription>
            View, filter, and manage all CBDC transactions across the network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsList />
        </CardContent>
      </Card>
    </div>
  );
}
