// src/components/dashboard/recent-fraud-alerts.tsx
"use client";
import { MOCK_FRAUD_ALERTS } from '@/lib/constants';
import type { FraudAlert } from '@/types';
import { AlertTriangle, ShieldCheck, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';

export function RecentFraudAlerts() {
  const recentAlerts = MOCK_FRAUD_ALERTS.slice(0, 4); // Show top 4

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Active Fraud Alerts</CardTitle>
        <CardDescription>Potentially fraudulent transactions needing review.</CardDescription>
      </CardHeader>
      <CardContent>
        {recentAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ShieldCheck className="h-12 w-12 text-accent mb-3" />
            <p className="text-lg font-semibold">No Active Alerts</p>
            <p className="text-sm text-muted-foreground">System is clear of new fraud alerts.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {recentAlerts.map((alert) => (
              <li key={alert.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                      <span className="font-semibold text-destructive">Risk Score: {alert.riskScore}</span>
                    </div>
                     <Progress value={alert.riskScore} className="h-1.5 w-32 mb-2 bg-destructive/20 [&>div]:bg-destructive" />
                    <p className="text-sm text-muted-foreground">
                      TX ID: <Link href={`/dashboard/transactions/${alert.transactionId}`} className="text-primary hover:underline">{alert.transactionId.substring(0,8)}...</Link>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(alert.date), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={alert.status === 'New' ? 'destructive' : 'secondary'} className="mb-2">
                      {alert.status}
                    </Badge>
                     <Button variant="outline" size="sm" asChild>
                       <Link href={`/dashboard/fraud-detection?alertId=${alert.id}`}>
                         <Eye className="mr-1.5 h-3.5 w-3.5" /> Review
                       </Link>
                     </Button>
                  </div>
                </div>
                <p className="text-sm mt-2 italic text-muted-foreground line-clamp-2">Reason: {alert.reason}</p>
              </li>
            ))}
          </ul>
        )}
        {MOCK_FRAUD_ALERTS.length > 0 && (
           <Button variant="link" asChild className="mt-4 w-full text-primary">
             <Link href="/dashboard/fraud-detection?filter=alerts">View All Alerts</Link>
           </Button>
        )}
      </CardContent>
    </Card>
  );
}
