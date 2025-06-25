"use client";
import { useEffect, useState } from 'react';
import { getAuditLog, AuditLogEntry } from '@/lib/audit-log';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    setLogs(getAuditLog());
    const interval = setInterval(() => setLogs([...getAuditLog()]), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No actions logged this session.</TableCell></TableRow>
              ) : (
                logs.map((log, i) => (
                  <TableRow key={i}>
                    <TableCell>{format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm:ss')}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.details || '-'}</TableCell>
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