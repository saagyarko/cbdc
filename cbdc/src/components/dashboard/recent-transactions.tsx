// src/components/dashboard/recent-transactions.tsx
"use client";
import { MOCK_TRANSACTIONS, CBDC_ICON_COMPONENTS, CBDC_CURRENCY_SYMBOLS } from '@/lib/constants';
import type { Transaction } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const getStatusBadgeVariant = (status: Transaction['status']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Completed':
      return 'default'; // Using primary for completed
    case 'Pending':
      return 'secondary';
    case 'Failed':
      return 'destructive';
    case 'Flagged':
      return 'outline'; // Visually distinct for flagged
    default:
      return 'secondary';
  }
};


export function RecentTransactions() {
  const recentTransactions = MOCK_TRANSACTIONS.slice(0, 6); // Show top 6

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Overview of the latest CBDC settlements.</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/transactions">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((tx) => {
              const IconComponent = CBDC_ICON_COMPONENTS[tx.cbdcType ? CBDC_ICON_COMPONENTS.hasOwnProperty(tx.cbdcType) ? tx.cbdcType : 'Currency' : 'Currency'] || CBDC_ICON_COMPONENTS.Currency;
              const currencySymbol = CBDC_CURRENCY_SYMBOLS[tx.cbdcType] || '';
              return (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium truncate max-w-[100px] hidden sm:table-cell">{tx.id}</TableCell>
                  <TableCell className="font-medium truncate max-w-[100px] sm:hidden table-cell">{tx.id.substring(0,6)}...</TableCell>
                  <TableCell className="hidden md:table-cell">{format(new Date(tx.date), 'dd MMM yyyy, HH:mm')}</TableCell>
                  <TableCell className="md:hidden table-cell">{format(new Date(tx.date), 'dd/MM/yy')}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                      {currencySymbol}{tx.amount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusBadgeVariant(tx.status)}
                      className={cn(
                        tx.status === 'Completed' && 'bg-accent text-accent-foreground hover:bg-accent/90',
                        tx.status === 'Flagged' && 'border-destructive text-destructive hover:bg-destructive/10',
                      )}
                    >
                      {tx.status}
                    </Badge>
                    {tx.status === 'Pending' && <Progress value={50} className="h-1 w-full mt-1" />}
                  </TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Transaction actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => alert(`Viewing details for ${tx.id}`)}>View Details</DropdownMenuItem>
                          {tx.status === 'Flagged' && <DropdownMenuItem onSelect={() => alert(`Investigating ${tx.id}`)}>Investigate</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
