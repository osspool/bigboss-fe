/**
 * Export & Archive Types
 *
 * Type definitions for data export (CSV/XLSX) and archival operations.
 */

// ==================== Export Types ====================

/**
 * Supported collection names for export
 */
export type ExportCollection =
  | 'product'
  | 'order'
  | 'customer'
  | 'transaction'
  | 'stockEntry'
  | 'stockMovement';

/**
 * Export format
 */
export type ExportFormat = 'csv' | 'xlsx';

/**
 * Export request parameters
 */
export interface ExportParams {
  /** Collection to export */
  collection: ExportCollection;
  /** Comma-separated field names to include */
  select?: string;
  /** JSON filter criteria (stringified) */
  filter?: string | Record<string, unknown>;
}

/**
 * Export response (blob data)
 */
export interface ExportResponse {
  data: Blob;
  response: Response;
}

// ==================== Archive Types ====================

/**
 * Supported archive types
 */
export type ArchiveType = 'transaction' | 'stock_movement';

/**
 * Archive creation payload
 */
export interface CreateArchivePayload {
  type: ArchiveType;
  organizationId?: string;
  rangeFrom?: Date | string;
  rangeTo?: Date | string;
  ttlDays?: number;
}

/**
 * Archive record
 */
export interface Archive {
  _id: string;
  type: ArchiveType;
  organizationId?: string;
  rangeFrom: string;
  rangeTo: string;
  filePath: string;
  format: 'json';
  recordCount: number;
  sizeBytes: number;
  expiresAt?: string;
  archivedAt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Archive result (after creation)
 */
export interface ArchiveResult {
  archived: number;
  filePath: string;
  cutoffDate: string;
  olderThanDays: number;
  message?: string;
}

// ==================== Statistics Types ====================

/**
 * Stock movement statistics
 */
export interface StockMovementStats {
  total: number;
  last30Days: number;
  last90Days: number;
  lastYear: number;
  olderThanYear: number;
  recommendation: string;
}

/**
 * Transaction statistics
 */
export interface TransactionStats {
  total: number;
  last30Days: number;
  last90Days: number;
  lastYear: number;
  olderThanYear: number;
  pending: number;
  archivable: number;
  recommendation: string;
}

// ==================== Cleanup/Archival Options ====================

/**
 * Options for archiving old data
 */
export interface ArchiveOptions {
  /** Archive records older than X days (default: 365) */
  olderThanDays?: number;
  /** Branch ID filter (optional) */
  branchId?: string;
  /** How long to keep archives before deletion (default: 730 days for movements, 2555 for transactions) */
  ttlDays?: number;
}

/**
 * Cleanup expired archives result
 */
export interface CleanupResult {
  deletedArchives: number;
  deletedFiles: number;
  orphanedFilesRemoved: number;
}
