/**
 * JSS Security Suite - Audit Logger & Error Logging Service
 */

export type SecurityEventType = 
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_REGISTER'
  | 'AUTH_LOGOUT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_INPUT_DETECTED'
  | 'SSRF_ATTEMPT_BLOCKED'
  | 'FILE_VALIDATION_FAILED'
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_UPDATED'
  | 'UNAUTHORIZED_DELETE_ATTEMPT'
  | 'UNAUTHORIZED_DEPOSIT_APPROVAL'
  | 'SECURITY_ALERT'
  | 'ADMIN_ACTION'
  | 'DEPOSIT_REQUEST'
  | 'DEPOSIT_VERIFIED'
  | 'SYSTEM_ERROR';

export interface AuditLogEntry {
  timestamp: string;
  eventType: SecurityEventType;
  userId?: string;
  ipAddress?: string;
  details?: Record<string, any>;
  message: string;
}

class AuditLogger {
  /**
   * Logs a security event.
   */
  public log(eventType: SecurityEventType, message: string, details?: Record<string, any>, userId?: string) {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      details,
      message,
    };

    // Print structured JSON log on server console
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(entry));
    } else {
      console.log(`[AUDIT ${entry.eventType}] ${entry.message}`, details || '');
    }
  }

  /**
   * Logs systemic errors while stripping sensitive internal details before sending to client.
   */
  public error(error: any, contextMessage: string): { message: string; safeError: string } {
    const rawErrorMessage = error instanceof Error ? error.message : String(error);
    
    this.log('SYSTEM_ERROR', contextMessage, {
      rawError: rawErrorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return sanitized non-sensitive message to clients
    return {
      message: contextMessage,
      safeError: process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan pada sistem. Silakan coba lagi.' : rawErrorMessage,
    };
  }
}

export const auditLogger = new AuditLogger();
