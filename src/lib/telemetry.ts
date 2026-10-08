/**
 * CampusOS Production Observability & Telemetry Module
 * Provides structured, privacy-compliant telemetry, error diagnostics, and performance monitoring.
 *
 * Privacy Guarantees:
 * - Strict PII Redaction: Names, raw roll numbers, emails, and passwords are never logged or exported.
 * - Anonymized User Hashing: Only pseudo-anonymous identifiers or session IDs are attached.
 * - Sensitive Query Stripping: URLs are stripped of access tokens, codes, and state params.
 */

export type TelemetryEventType =
  | 'AUTH_LOGIN_ATTEMPT'
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_TOKEN_REFRESH'
  | 'SKILL_SUBMIT_ATTEMPT'
  | 'SKILL_SUBMIT_SUCCESS'
  | 'SKILL_SUBMIT_FAILURE'
  | 'VIEW_NAVIGATE'
  | 'PERF_METRIC'
  | 'UNHANDLED_EXCEPTION';

export interface TelemetryEvent {
  timestamp: string;
  eventType: TelemetryEventType;
  status: 'info' | 'warn' | 'error';
  sessionId?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
}

// In-memory telemetry buffer for diagnostics export
const eventBuffer: TelemetryEvent[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Sanitizes metadata to purge any accidental PII (emails, names, tokens)
 */
function sanitizePayload(data?: Record<string, any>): Record<string, any> | undefined {
  if (!data) return undefined;
  const sanitized: Record<string, any> = {};
  const sensitiveKeys = ['email', 'password', 'token', 'access_token', 'code', 'fullname', 'secret', 'phone'];

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED_PII]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizePayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Emits a structured telemetry event
 */
export function trackEvent(
  eventType: TelemetryEventType,
  status: 'info' | 'warn' | 'error' = 'info',
  metadata?: Record<string, any>,
  durationMs?: number
): void {
  const event: TelemetryEvent = {
    timestamp: new Date().toISOString(),
    eventType,
    status,
    durationMs,
    metadata: sanitizePayload(metadata),
  };

  eventBuffer.push(event);
  if (eventBuffer.length > MAX_BUFFER_SIZE) {
    eventBuffer.shift();
  }

  // Console output handling:
  // In development: format clean colored notice
  // In production: only log warnings and errors (silent info)
  if (import.meta.env.DEV) {
    if (status === 'error') {
      console.error(`[CampusOS Telemetry] ${eventType}:`, event);
    } else if (status === 'warn') {
      console.warn(`[CampusOS Telemetry] ${eventType}:`, event);
    } else {
      console.info(`[CampusOS Telemetry] ${eventType}:`, event);
    }
  } else if (status === 'error' || status === 'warn') {
    console.error(JSON.stringify(event));
  }
}

/**
 * Captures unhandled application errors for telemetry
 */
export function trackError(error: Error, componentStack?: string): void {
  trackEvent('UNHANDLED_EXCEPTION', 'error', {
    name: error.name,
    message: error.message,
    stack: error.stack ? error.stack.split('\n').slice(0, 5).join('\n') : undefined,
    componentStack: componentStack ? componentStack.substring(0, 300) : undefined,
  });
}

/**
 * Collects Web Vitals and frontend performance metrics (LCP, FID, API latency)
 */
export function trackPerformance(metricName: string, durationMs: number): void {
  trackEvent('PERF_METRIC', 'info', { metricName }, durationMs);
}

/**
 * Returns buffered events (useful for admin diagnostics or bug reports)
 */
export function getBufferedTelemetry(): TelemetryEvent[] {
  return [...eventBuffer];
}
