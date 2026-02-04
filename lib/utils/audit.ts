type AuditAction =
  | 'clinic.created'
  | 'clinic.blocked'
  | 'clinic.unblocked'
  | 'clinic.password_reset'
  | 'clinic.deleted'
  | 'branch_user.created'
  | 'branch_user.updated'
  | 'branch_user.deleted'
  | 'application.approved'
  | 'application.rejected'
  | 'member.suspended'
  | 'member.renewed'
  | 'member.updated'
  | 'member.deleted'
  | 'login.success'
  | 'login.failed'
  | 'login.blocked'

interface AuditLogEntry {
  action: AuditAction
  actorId: string
  actorRole: string
  targetId?: string | number
  targetType?: string
  details?: Record<string, unknown>
  timestamp: string
}

export function auditLog(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  }
  console.log(JSON.stringify({ audit: true, ...logEntry }))
}
