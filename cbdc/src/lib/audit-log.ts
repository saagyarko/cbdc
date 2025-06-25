// Simple in-memory audit log for the session (demo only)
export type AuditLogEntry = {
  timestamp: number;
  user: string;
  action: string;
  details?: string;
};

const auditLog: AuditLogEntry[] = [];

export function logAuditAction(entry: Omit<AuditLogEntry, 'timestamp'>) {
  auditLog.unshift({ ...entry, timestamp: Date.now() });
  if (auditLog.length > 1000) auditLog.pop(); // Limit size
}

export function getAuditLog(): AuditLogEntry[] {
  return auditLog;
} 