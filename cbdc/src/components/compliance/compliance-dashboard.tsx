// src/components/compliance/compliance-dashboard.tsx
"use client";

import React, { useState } from 'react';
import { MOCK_COMPLIANCE_METRICS, MOCK_TRANSACTIONS } from '@/lib/constants';
import type { ComplianceMetric } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, FileText, CalendarDays, Download, Loader2, ListFilter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateComplianceReport } from '@/app/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { logAuditAction } from '@/lib/audit-log';
import { useSession } from 'next-auth/react';

const getStatusIcon = (status: ComplianceMetric['status']) => {
  switch (status) {
    case 'Compliant':
      return <CheckCircle2 className="h-5 w-5 text-accent" />;
    case 'Needs Review':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'Non-Compliant':
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    default:
      return null;
  }
};

export function ComplianceDashboard() {
  const [reportPeriod, setReportPeriod] = useState("last_month");
  const [reportType, setReportType] = useState("aml_summary");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();
  const user = session?.user ? (session.user as any).username : 'Unknown';

  // Compliance rules: flag transactions over $100,000, $0, suspicious sender/receiver, or high-risk countries
  const suspiciousNames = ['Evil Corp', 'Fraudster Bank', 'Suspicious Entity'];
  const highRiskCountries = ['North Korea', 'Iran'];
  const [flagged, setFlagged] = useState<{ id: string; amount: number; sender: string; receiver: string; reviewed: boolean; reason: string }[]>(
    MOCK_TRANSACTIONS.filter(tx => {
      const isLarge = tx.amount > 100000;
      const isZero = tx.amount === 0;
      const suspiciousSender = suspiciousNames.includes(tx.sender) || /test|anonymous/i.test(tx.sender);
      const suspiciousReceiver = suspiciousNames.includes(tx.receiver) || /test|anonymous/i.test(tx.receiver);
      // Assume tx.receiver or tx.sender could have a country property in real data
      const highRisk = highRiskCountries.some(country =>
        (tx.receiver && typeof tx.receiver === 'string' && tx.receiver.includes(country)) ||
        (tx.sender && typeof tx.sender === 'string' && tx.sender.includes(country))
      );
      return isLarge || isZero || suspiciousSender || suspiciousReceiver || highRisk;
    }).map(tx => {
      let reason = '';
      if (tx.amount > 100000) reason = 'Large transaction amount';
      else if (tx.amount === 0) reason = 'Zero amount transaction';
      else if (suspiciousNames.includes(tx.sender) || /test|anonymous/i.test(tx.sender)) reason = `Suspicious sender: ${tx.sender}`;
      else if (suspiciousNames.includes(tx.receiver) || /test|anonymous/i.test(tx.receiver)) reason = `Suspicious receiver: ${tx.receiver}`;
      else if (highRiskCountries.some(country => (tx.receiver && typeof tx.receiver === 'string' && tx.receiver.includes(country)))) reason = 'Receiver in high-risk country';
      else if (highRiskCountries.some(country => (tx.sender && typeof tx.sender === 'string' && tx.sender.includes(country)))) reason = 'Sender in high-risk country';
      return { ...tx, reviewed: false, reason };
    })
  );

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const result = await generateComplianceReport({ period: reportPeriod, type: reportType });
    setIsGeneratingReport(false);

    logAuditAction({
      user,
      action: 'Generate Compliance Report',
      details: `Generated report: ${reportType} for ${reportPeriod}`,
    });

    if (result.reportUrl) {
      toast({
        title: "Report Generated",
        description: `Compliance report is ready for download.`,
        action: (
          <Button variant="outline" size="sm" asChild>
            <a href={result.reportUrl} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" /> Download
            </a>
          </Button>
        ),
      });
    } else {
      toast({
        variant: "destructive",
        title: "Report Generation Failed",
        description: result.error || "An unknown error occurred.",
      });
    }
  };

  const markReviewed = (id: string) => {
    setFlagged(f => f.map(tx => tx.id === id ? { ...tx, reviewed: true } : tx));
    const tx = flagged.find(tx => tx.id === id);
    if (tx) {
      logAuditAction({
        user,
        action: 'Compliance Review',
        details: `Marked transaction ${id} as reviewed. Reason: ${tx.reason}`,
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-xl font-headline">Compliance Overview</CardTitle>
              <CardDescription>Key metrics and automated regulatory reporting.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_COMPLIANCE_METRICS.map((metric) => (
              <Card key={metric.name} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">{metric.name}</CardTitle>
                    {getStatusIcon(metric.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metric.value.toLocaleString()}</div>
                  <Badge variant={
                    metric.status === 'Compliant' ? 'default' : 
                    metric.status === 'Needs Review' ? 'secondary' : 'destructive'
                  } className={cn(metric.status === 'Compliant' && "bg-accent text-accent-foreground")}>
                    {metric.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last checked: {format(new Date(metric.lastChecked), 'dd MMM yyyy')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Generate Compliance Report</CardTitle>
          <CardDescription>Select parameters to generate an automated compliance report.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="reportPeriod" className="text-sm font-medium">Report Period</label>
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger id="reportPeriod">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_24_hours">Last 24 Hours</SelectItem>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="reportType" className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aml_summary">AML Summary</SelectItem>
                <SelectItem value="kyc_verification_log">KYC Verification Log</SelectItem>
                <SelectItem value="transaction_monitoring_overview">Transaction Monitoring Overview</SelectItem>
                <SelectItem value="full_compliance_package">Full Compliance Package</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleGenerateReport} disabled={isGeneratingReport} className="w-full sm:w-auto">
              {isGeneratingReport ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
           <p className="text-xs text-muted-foreground">Generated reports will be available for download. Ensure all data is up-to-date before generation.</p>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Recent Regulatory Submissions</CardTitle>
          <CardDescription>History of generated and submitted compliance reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Generation Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Mock data for recent submissions */}
              <TableRow>
                <TableCell>AML Summary - Last Month</TableCell>
                <TableCell>{format(new Date(Date.now() - 86400000 * 2), 'dd MMM yyyy, HH:mm')}</TableCell>
                <TableCell><Badge variant="default" className="bg-accent text-accent-foreground">Submitted</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm"><Download className="mr-1 h-3.5 w-3.5" /> Download</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>KYC Log - Q3 2023</TableCell>
                <TableCell>{format(new Date(Date.now() - 86400000 * 30), 'dd MMM yyyy, HH:mm')}</TableCell>
                <TableCell><Badge variant="default" className="bg-accent text-accent-foreground">Submitted</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm"><Download className="mr-1 h-3.5 w-3.5" /> Download</Button>
                </TableCell>
              </TableRow>
               <TableRow>
                <TableCell>Transaction Monitoring - Last Week</TableCell>
                <TableCell>{format(new Date(Date.now() - 86400000 * 1), 'dd MMM yyyy, HH:mm')}</TableCell>
                <TableCell><Badge variant="secondary">Pending Submission</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm"><Download className="mr-1 h-3.5 w-3.5" /> Download</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Flagged Transactions (&gt;$100,000)</CardTitle>
          <CardDescription>Transactions flagged by compliance rules. Mark as reviewed when checked.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flagged.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No flagged transactions.</TableCell></TableRow>
              ) : (
                flagged.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.id}</TableCell>
                    <TableCell>${tx.amount.toLocaleString()}</TableCell>
                    <TableCell>{tx.sender}</TableCell>
                    <TableCell>{tx.receiver}</TableCell>
                    <TableCell>
                      <Badge variant={tx.reviewed ? 'default' : 'destructive'}>
                        {tx.reviewed ? 'Reviewed' : 'Needs Review'}
                      </Badge>
                    </TableCell>
                    <TableCell>{tx.reason}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" disabled={tx.reviewed} onClick={() => markReviewed(tx.id)}>
                        Mark as Reviewed
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
