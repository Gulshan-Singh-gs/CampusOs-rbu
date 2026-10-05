import { supabase } from '@/shared/lib/supabase';
import type { AuditLog } from '@/shared/types/app.types';

const AUDIT_STORAGE_KEY = 'campusos_local_audit_logs';

/**
 * Record a security-critical action into the immutable audit trail.
 * Syncs to Supabase audit_logs table, with optimistic fallback to client storage.
 */
export async function recordAuditLog(
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const timestamp = new Date().toISOString();

  // Optimistic local cache for audit logs
  try {
    const rawLogs = localStorage.getItem(AUDIT_STORAGE_KEY);
    const logs: AuditLog[] = rawLogs ? JSON.parse(rawLogs) : [];
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      actorId: null,
      actorEmail: null,
      action,
      entityType,
      entityId: entityId || null,
      metadata,
      createdAt: timestamp,
    };
    logs.unshift(newLog);
    // Keep last 100 entries locally
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (err) {
    console.warn('Audit log local storage note:', err);
  }

  // Persist to Supabase audit_logs
  try {
    await supabase.from('audit_logs').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
  } catch (err) {
    // Non-blocking for offline operations
    console.warn('Supabase audit log persistence note:', err);
  }
}
