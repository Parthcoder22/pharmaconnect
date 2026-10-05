import { db } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * 21 CFR Part 11 compliant immutable audit logging utility
 * Records actor, action, entity type, entity id, and metadata snapshot
 */
export const recordAuditLog = async (actorId, action, entityType, entityId, metadata = {}) => {
  try {
    const entry = {
      id: uuidv4(),
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      metadata,
      created_at: new Date().toISOString()
    };

    db.insert('audit_logs', entry);
    return entry;
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
    return null;
  }
};
