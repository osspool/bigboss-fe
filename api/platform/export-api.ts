// @/api/platform/export-api.ts
import { handleApiRequest, type BlobResponse } from '../api-handler';
import type { RequestOptions } from '../api-factory';
import type { ExportParams, ExportFormat, ExportCollection } from '@/types/export.types';

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

/**
 * Export API - Data Export Operations
 *
 * Consolidated API for exporting data to CSV/XLSX formats.
 *
 * Routes:
 * - GET /export/csv?collection=xxx&select=yyy&filter=zzz
 * - GET /export/xlsx?collection=xxx&select=yyy&filter=zzz
 *
 * Features:
 * - MongoKit repository-based exports (secure, role-filtered)
 * - Role-based field filtering (hides sensitive data like costPrice)
 * - CSV and XLSX formats
 * - Direct download or programmatic handling
 * - Filter support with MongoDB query syntax
 *
 * Supported Collections:
 * - product: Product catalog with pricing
 * - order: Order history
 * - customer: Customer list
 * - transaction: Financial transactions
 * - stockEntry: Current inventory levels
 * - stockMovement: Inventory movement history
 *
 * Usage Examples:
 * ```ts
 * // Export all products to CSV
 * const blob = await exportApi.toCSV({ token, collection: 'product' });
 *
 * // Export orders with filters
 * const blob = await exportApi.toXLSX({
 *   token,
 *   collection: 'order',
 *   filter: { status: 'delivered' },
 *   select: 'orderNumber,customer,totalAmount,createdAt'
 * });
 *
 * // Trigger browser download
 * exportApi.downloadFile(blob, 'orders.xlsx');
 * ```
 */
class ExportApi {
  private readonly basePath: string;

  constructor() {
    this.basePath = '/api/v1/export';
  }

  /**
   * Build query string from export parameters
   */
  private buildQueryString(params: Omit<ExportParams, 'collection'>): string {
    const searchParams = new URLSearchParams();

    if (params.select) {
      searchParams.append('select', params.select);
    }

    if (params.filter) {
      const filterString =
        typeof params.filter === 'string'
          ? params.filter
          : JSON.stringify(params.filter);
      searchParams.append('filter', filterString);
    }

    return searchParams.toString();
  }

  /**
   * Export data to CSV format
   * GET /export/csv
   *
   * Returns CSV file as blob for download or processing.
   *
   * @example
   * // Export all products
   * const blob = await exportApi.toCSV({ token, collection: 'product' });
   *
   * // Export filtered transactions
   * const blob = await exportApi.toCSV({
   *   token,
   *   collection: 'transaction',
   *   filter: { status: 'verified' },
   *   select: 'amount,method,status,createdAt'
   * });
   */
  async toCSV({
    token,
    collection,
    filter,
    select,
    options = {},
  }: {
    token: string;
    collection: ExportCollection;
    filter?: Record<string, unknown> | string;
    select?: string;
    options?: FetchOptions;
  }): Promise<Blob> {
    const params = this.buildQueryString({ filter, select });
    const url = `${this.basePath}/csv?collection=${collection}${params ? `&${params}` : ''}`;

    const response = await handleApiRequest<BlobResponse>('GET', url, {
      token,
      cache: 'no-store',
      ...options,
    });

    return response.data;
  }

  /**
   * Export data to XLSX (Excel) format
   * GET /export/xlsx
   *
   * Returns Excel file as blob for download or processing.
   *
   * @example
   * // Export stock movements
   * const blob = await exportApi.toXLSX({
   *   token,
   *   collection: 'stockMovement',
   *   filter: { type: 'sale', createdAt: { $gte: '2024-01-01' } }
   * });
   */
  async toXLSX({
    token,
    collection,
    filter,
    select,
    options = {},
  }: {
    token: string;
    collection: ExportCollection;
    filter?: Record<string, unknown> | string;
    select?: string;
    options?: FetchOptions;
  }): Promise<Blob> {
    const params = this.buildQueryString({ filter, select });
    const url = `${this.basePath}/xlsx?collection=${collection}${params ? `&${params}` : ''}`;

    const response = await handleApiRequest<BlobResponse>('GET', url, {
      token,
      cache: 'no-store',
      ...options,
    });

    return response.data;
  }

  /**
   * Export data with specified format
   * Convenience method for format-agnostic exports
   *
   * @example
   * const format = userPreference.exportFormat; // 'csv' | 'xlsx'
   * const blob = await exportApi.export({
   *   token,
   *   format,
   *   collection: 'customer',
   *   select: 'name,phone,email'
   * });
   */
  async export({
    token,
    format,
    collection,
    filter,
    select,
    options = {},
  }: {
    token: string;
    format: ExportFormat;
    collection: ExportCollection;
    filter?: Record<string, unknown> | string;
    select?: string;
    options?: FetchOptions;
  }): Promise<Blob> {
    if (format === 'csv') {
      return this.toCSV({ token, collection, filter, select, options });
    } else {
      return this.toXLSX({ token, collection, filter, select, options });
    }
  }

  /**
   * Trigger browser download of blob
   * Creates temporary link and clicks it to download file
   *
   * @example
   * const blob = await exportApi.toCSV({ token, collection: 'product' });
   * exportApi.downloadFile(blob, 'products.csv');
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get suggested filename based on collection and format
   *
   * @example
   * const filename = exportApi.getSuggestedFilename('product', 'csv');
   * // Returns: 'products-2024-12-11.csv'
   */
  getSuggestedFilename(collection: ExportCollection, format: ExportFormat): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const collectionPlural = collection.endsWith('y')
      ? collection.slice(0, -1) + 'ies'
      : collection + 's';
    return `${collectionPlural}-${date}.${format}`;
  }
}

// Create and export a singleton instance
export const exportApi = new ExportApi();
export { ExportApi };

// ==================== Utility Functions ====================

/**
 * Export and download in one call
 * Convenience wrapper for common use case
 *
 * @example
 * await exportAndDownload({
 *   token,
 *   format: 'xlsx',
 *   collection: 'order',
 *   filter: { status: 'delivered' }
 * });
 */
export async function exportAndDownload({
  token,
  format,
  collection,
  filter,
  select,
  filename,
}: {
  token: string;
  format: ExportFormat;
  collection: ExportCollection;
  filter?: Record<string, unknown> | string;
  select?: string;
  filename?: string;
}): Promise<void> {
  const blob = await exportApi.export({ token, format, collection, filter, select });
  const finalFilename = filename || exportApi.getSuggestedFilename(collection, format);
  exportApi.downloadFile(blob, finalFilename);
}

/**
 * Read CSV blob as text
 * Useful for preview or parsing
 *
 * @example
 * const blob = await exportApi.toCSV({ token, collection: 'customer' });
 * const csvText = await readCSVBlob(blob);
 * console.log('First 100 chars:', csvText.slice(0, 100));
 */
export async function readCSVBlob(blob: Blob): Promise<string> {
  return blob.text();
}

/**
 * Parse CSV text to array of objects
 * Simple CSV parser for client-side processing
 *
 * @example
 * const csvText = await readCSVBlob(blob);
 * const data = parseCSV(csvText);
 * console.log('First row:', data[0]);
 */
export function parseCSV(csvText: string): Array<Record<string, string>> {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }

  return data;
}

/**
 * Common filter builders for exports
 */
export const ExportFilters = {
  /** Orders by date range */
  ordersByDateRange: (startDate: string, endDate: string) => ({
    createdAt: { $gte: startDate, $lte: endDate },
  }),

  /** Orders by status */
  ordersByStatus: (status: string | string[]) =>
    Array.isArray(status) ? { status: { $in: status } } : { status },

  /** Transactions by date and status */
  transactionsByDate: (startDate: string, endDate: string, status?: string) => ({
    transactionDate: { $gte: startDate, $lte: endDate },
    ...(status && { status }),
  }),

  /** Stock movements by type and date */
  movementsByType: (type: string, startDate?: string, endDate?: string) => ({
    type,
    ...(startDate && endDate && { createdAt: { $gte: startDate, $lte: endDate } }),
  }),

  /** Products by category */
  productsByCategory: (category: string | string[]) =>
    Array.isArray(category) ? { category: { $in: category } } : { category },

  /** Customers with orders */
  customersWithOrders: () => ({
    'stats.totalOrders': { $gt: 0 },
  }),
};

/**
 * Common field selections for exports
 */
export const ExportFields = {
  /** Product essentials */
  productBasic: 'name,sku,basePrice,quantity,category',
  productFull: 'name,sku,barcode,basePrice,costPrice,quantity,category,isActive',

  /** Order essentials */
  orderBasic: 'orderNumber,customer,status,totalAmount,createdAt',
  orderFull: 'orderNumber,customer,items,totalAmount,status,paymentStatus,deliveryMethod,createdAt',

  /** Customer essentials */
  customerBasic: 'name,phone,email',
  customerFull: 'name,phone,email,stats,addresses,createdAt',

  /** Transaction essentials */
  transactionBasic: 'amount,method,status,transactionDate',
  transactionFull: 'amount,type,method,status,referenceModel,referenceId,transactionDate',

  /** Stock essentials */
  stockBasic: 'product,branch,quantity,reorderPoint',
  stockFull: 'product,variantSku,branch,quantity,reservedQuantity,costPrice,reorderPoint',

  /** Movement essentials */
  movementBasic: 'product,branch,type,quantity,balanceAfter,createdAt',
  movementFull: 'product,variantSku,branch,type,quantity,balanceAfter,costPerUnit,reference,actor,createdAt',
};
