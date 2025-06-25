// src/components/transactions/transactions-list.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_TRANSACTIONS, CBDC_ICON_COMPONENTS, CBDC_CURRENCY_SYMBOLS, CBDC_ICONS_MAP } from '@/lib/constants';
import type { Transaction, CBDCName } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Search, Filter, MoreHorizontal, Download, Eye, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { logAuditAction } from '@/lib/audit-log';
import { useSession } from 'next-auth/react';

const getStatusBadgeVariant = (status: Transaction['status']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Completed':
      return 'default';
    case 'Pending':
      return 'secondary';
    case 'Failed':
      return 'destructive';
    case 'Flagged':
      return 'outline';
    default:
      return 'secondary';
  }
};


export function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Initialize with empty array
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortColumn, setSortColumn] = useState<keyof Transaction | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [visibleColumns, setVisibleColumns] = useState<Record<keyof Transaction, boolean>>({
    id: true, date: true, sender: true, receiver: true, amount: true, currency: true, status: true, cbdcType: false, description: false, riskScore: true,
  });

  const [ledgerStatus, setLedgerStatus] = useState<Record<string, { txHash: string; status: string; block?: number; timestamp?: number }>>({});
  const [modalTxHash, setModalTxHash] = useState<string | null>(null);
  const [modalDetails, setModalDetails] = useState<any>(null);

  const { data: session } = useSession();
  const user = session?.user ? (session.user as any).username : 'Unknown';

  useEffect(() => {
    // Load mock data on the client side after initial hydration
    setTransactions(MOCK_TRANSACTIONS);
  }, []);


  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    if (currencyFilter !== 'all') {
      filtered = filtered.filter(tx => tx.currency === currencyFilter);
    }
    
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= dateRange.from! && txDate <= dateRange.to!;
      });
    } else if (dateRange?.from) {
       filtered = filtered.filter(tx => new Date(tx.date) >= dateRange.from!);
    }


    if (sortColumn) {
      // Create a new array before sorting to avoid mutating the state directly
      filtered = [...filtered].sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        // For dates (which are strings here)
        if (sortColumn === 'date') {
             return sortDirection === 'asc' ? new Date(valA as string).getTime() - new Date(valB as string).getTime() : new Date(valB as string).getTime() - new Date(valA as string).getTime();
        }
        return 0;
      });
    }

    return filtered;
  }, [transactions, searchTerm, statusFilter, currencyFilter, dateRange, sortColumn, sortDirection]);

  const handleSort = (column: keyof Transaction) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const toggleColumnVisibility = (column: keyof Transaction) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const availableCurrencies = useMemo(() => {
    if (transactions.length === 0) return []; // Handle initial empty state
    return [...new Set(transactions.map(tx => tx.currency))];
  }, [transactions]);

  // Submit to ledger handler
  const handleSubmitToLedger = async (tx: Transaction) => {
    const res = await fetch('/api/ledger/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    const data = await res.json();
    setLedgerStatus(prev => ({ ...prev, [tx.id]: { txHash: data.txHash, status: data.status } }));
    // Poll for confirmation
    pollLedgerStatus(tx.id, data.txHash);
    logAuditAction({
      user,
      action: 'Submit Transaction',
      details: `Submitted transaction ${tx.id} to ledger. Amount: ${tx.amount} ${tx.currency}`,
    });
  };

  // Poll ledger status
  const pollLedgerStatus = (txId: string, txHash: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/ledger/status?txHash=${txHash}`);
      const data = await res.json();
      setLedgerStatus(prev => ({ ...prev, [txId]: { ...prev[txId], ...data } }));
      if (data.status === 'confirmed') clearInterval(interval);
    }, 1500);
  };

  // Open modal and fetch details
  const handleViewOnLedger = async (txId: string) => {
    const txHash = ledgerStatus[txId]?.txHash;
    if (!txHash) return;
    const res = await fetch(`/api/ledger/status?txHash=${txHash}`);
    const data = await res.json();
    setModalDetails(data);
    setModalTxHash(txHash);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 border bg-card rounded-lg shadow">
        <div className="relative w-full md:w-auto md:flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, sender, receiver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} className="w-full sm:w-auto" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              {availableCurrencies.map(curr => (
                <SelectItem key={curr} value={curr}>{curr.replace('_CBDC', ' CBDC')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.keys(visibleColumns).map((colKey) => (
                <DropdownMenuCheckboxItem
                  key={colKey}
                  checked={visibleColumns[colKey as keyof Transaction]}
                  onCheckedChange={() => toggleColumnVisibility(colKey as keyof Transaction)}
                >
                  {colKey.charAt(0).toUpperCase() + colKey.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => alert("Exporting transactions...")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.id && <TableHead onClick={() => handleSort('id')} className="cursor-pointer hover:bg-muted/50">ID <ArrowUpDown className="ml-2 h-3 w-3 inline" /></TableHead>}
              {visibleColumns.date && <TableHead onClick={() => handleSort('date')} className="cursor-pointer hover:bg-muted/50 hidden md:table-cell">Date <ArrowUpDown className="ml-2 h-3 w-3 inline" /></TableHead>}
              {visibleColumns.sender && <TableHead className="hidden lg:table-cell">Sender</TableHead>}
              {visibleColumns.receiver && <TableHead className="hidden lg:table-cell">Receiver</TableHead>}
              {visibleColumns.amount && <TableHead onClick={() => handleSort('amount')} className="cursor-pointer hover:bg-muted/50 text-right">Amount <ArrowUpDown className="ml-2 h-3 w-3 inline" /></TableHead>}
              {visibleColumns.currency && <TableHead className="hidden md:table-cell">Currency</TableHead>}
              {visibleColumns.status && <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/50">Status <ArrowUpDown className="ml-2 h-3 w-3 inline" /></TableHead>}
              {visibleColumns.riskScore && <TableHead className="hidden xl:table-cell text-center">Risk</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((tx) => {
               const iconKey = CBDC_ICONS_MAP[tx.cbdcType as keyof typeof CBDC_ICONS_MAP] || 'Currency';
               const IconComponent = CBDC_ICON_COMPONENTS[iconKey as keyof typeof CBDC_ICON_COMPONENTS] || CBDC_ICON_COMPONENTS.Currency;
               const currencySymbol = CBDC_CURRENCY_SYMBOLS[tx.cbdcType] || '';
              return (
              <TableRow key={tx.id} className="hover:bg-muted/50">
                {visibleColumns.id && <TableCell className="font-medium truncate max-w-[80px] sm:max-w-[120px]">{tx.id}</TableCell>}
                {visibleColumns.date && <TableCell className="hidden md:table-cell">{format(new Date(tx.date), 'dd MMM yyyy, HH:mm')}</TableCell>}
                {visibleColumns.sender && <TableCell className="hidden lg:table-cell">{tx.sender}</TableCell>}
                {visibleColumns.receiver && <TableCell className="hidden lg:table-cell">{tx.receiver}</TableCell>}
                {visibleColumns.amount && <TableCell className="text-right">{currencySymbol}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>}
                {visibleColumns.currency && <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                    {tx.currency.replace('_CBDC', '')}
                  </div>
                </TableCell>}
                {visibleColumns.status && <TableCell>
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
                </TableCell>}
                {visibleColumns.riskScore && <TableCell className="hidden xl:table-cell text-center">
                  {tx.riskScore !== undefined ? (
                    <div className="flex flex-col items-center">
                      <span className={cn(
                        "text-xs font-semibold",
                        tx.riskScore > 75 ? "text-destructive" : tx.riskScore > 50 ? "text-yellow-600" : "text-green-600"
                      )}>
                        {tx.riskScore}
                      </span>
                      <Progress value={tx.riskScore} className={cn(
                        "h-1 w-12",
                        tx.riskScore > 75 ? "bg-destructive/20 [&>div]:bg-destructive" : 
                        tx.riskScore > 50 ? "bg-yellow-500/20 [&>div]:bg-yellow-500" : 
                        "bg-green-500/20 [&>div]:bg-green-500"
                       )} />
                    </div>
                  ) : <span className="text-xs text-muted-foreground">-</span>}
                </TableCell>}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Transaction actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/transactions/${tx.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </DropdownMenuItem>
                      {tx.status === 'Flagged' && 
                        <DropdownMenuItem asChild>
                           <Link href={`/dashboard/fraud-detection?alertId=ALERT-${tx.id}`}>
                            <AlertTriangle className="mr-2 h-4 w-4" /> Investigate
                           </Link>
                        </DropdownMenuItem>
                      }
                      <DropdownMenuItem onSelect={() => alert(`Generating report for ${tx.id}`)}>Generate Report</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {ledgerStatus[tx.id] ? (
                    <div className="flex flex-col items-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleViewOnLedger(tx.id)}>
                        View on Ledger
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Status: {ledgerStatus[tx.id].status}
                      </span>
                    </div>
                  ) : (
                    <Button size="sm" variant="default" onClick={() => handleSubmitToLedger(tx)}>
                      Submit to Ledger
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
      {transactions.length > 0 && filteredTransactions.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No transactions found matching your criteria.
        </div>
      )}
      {transactions.length === 0 && (
         <div className="text-center py-10 text-muted-foreground">
          Loading transactions...
        </div>
      )}
      {/* TODO: Add pagination controls */}

      {/* Ledger Modal */}
      <Dialog open={!!modalTxHash} onOpenChange={() => { setModalTxHash(null); setModalDetails(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction on Mock Ledger</DialogTitle>
            <DialogDescription>
              Details for transaction hash <span className="font-mono">{modalTxHash}</span>
            </DialogDescription>
          </DialogHeader>
          {modalDetails ? (
            <div className="space-y-2">
              <div><b>Status:</b> {modalDetails.status}</div>
              <div><b>Block:</b> {modalDetails.block}</div>
              <div><b>Timestamp:</b> {modalDetails.timestamp ? new Date(modalDetails.timestamp).toLocaleString() : '-'}</div>
              <div><b>Transaction:</b> <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">{JSON.stringify(modalDetails.tx, null, 2)}</pre></div>
            </div>
          ) : <div>Loading...</div>}
          <DialogFooter>
            <Button onClick={() => { setModalTxHash(null); setModalDetails(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    
