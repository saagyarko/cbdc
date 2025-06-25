// src/app/dashboard/transactions/[id]/page.tsx
import { TransactionDetailsCard } from '@/components/transactions/transaction-details-card';
import { MOCK_TRANSACTIONS } from '@/lib/constants';
import type { Transaction } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function TransactionDetailsPage({ params }: { params: { id: string } }) {
  const transaction = MOCK_TRANSACTIONS.find(tx => tx.id === params.id);

  if (!transaction) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-headline mt-4">Transaction Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              The transaction with ID <span className="font-mono bg-muted px-1 py-0.5 rounded">{params.id}</span> could not be found. It might have been removed or the ID is incorrect.
            </CardDescription>
            <Button asChild className="mt-6">
              <Link href="/dashboard/transactions">Back to Transactions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Transaction Details</CardTitle>
          <CardDescription>
            Detailed information for transaction ID: <span className="font-mono bg-muted px-1 py-0.5 rounded">{transaction.id}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionDetailsCard transaction={transaction} />
        </CardContent>
      </Card>
       <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/dashboard/transactions">Back to All Transactions</Link>
            </Button>
        </div>
    </div>
  );
}