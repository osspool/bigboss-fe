// @/api/platform/pos-api.ts
import { type ApiResponse, type RequestOptions } from '../api-factory';
import { handleApiRequest, createQueryString } from '../api-handler';
import type {
  PosLookupResponse,
  CreatePosOrderPayload,
  Receipt,
  Branch,
  StockEntryWithProduct,
  SetStockPayload,
  StockEntry,
  LowStockItem,
  LowStockParams,
  GetMovementsParams,
  StockMovementWithDetails,
  StockCheckItem,
  StockAvailabilityResult,
  InventoryPaginatedResponse,
  // Bulk operation types
  BulkAdjustPayload,
  BulkAdjustResult,
  UpdateBarcodePayload,
  LabelData,
} from '@/types/inventory.types';
import type { Order } from '@/types/order.types';

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

interface PosApiConfig {
  basePath?: string;
  cache?: RequestCache;
}

/**
 * POS API - Point of Sale Operations
 *
 * Standalone API class for POS operations (not CRUD-based).
 * Combines multiple specialized endpoints:
 * - Product lookup (barcode/SKU scanning)
 * - Order creation (cart-free)
 * - Receipt generation
 * - Branch selection
 * - Inventory management (within POS context)
 *
 * Routes:
 * - GET /pos/lookup?code=xxx (barcode/SKU lookup)
 * - POST /pos/orders (create POS order)
 * - GET /pos/orders/:orderId/receipt (get receipt data)
 * - GET /pos/branches (get active branches for POS)
 * - GET /pos/branches/default (get default branch)
 * - GET /pos/inventory/:productId (get stock for product)
 * - PUT /pos/inventory/:productId (set stock quantity)
 * - GET /pos/inventory/alerts/low-stock (get low stock items)
 * - GET /pos/inventory/movements (get stock movement history)
 *
 * Features:
 * - Cart-free order creation (direct item submission)
 * - Barcode/SKU scanning with auto product lookup
 * - Transactional inventory decrement (all-or-nothing)
 * - Receipt generation with formatted data
 * - Walk-in customer support (no customer required)
 * - Auto customer creation from phone number
 * - Multi-branch inventory tracking
 *
 * Usage Examples:
 * - posApi.lookup({ token, code: '1234567890' })
 * - posApi.createOrder({ token, data: { items: [...], payment: {...} }})
 * - posApi.getReceipt({ token, orderId: '123' })
 * - posApi.getBranches({ token })
 * - posApi.getStock({ token, productId: '123' })
 * - posApi.setStock({ token, productId: '123', data: { quantity: 50 }})
 */
class PosApi {
  private readonly basePath: string;
  private readonly baseUrl: string;
  private readonly inventoryBaseUrl: string;
  private readonly cache: RequestCache;

  constructor(config: PosApiConfig = {}) {
    this.basePath = config.basePath ?? '/api/v1';
    this.baseUrl = `${this.basePath}/pos`;
    this.inventoryBaseUrl = `${this.basePath}/pos/inventory`;
    this.cache = config.cache ?? 'no-store';
  }

  // ============================================
  // PRODUCT LOOKUP
  // ============================================

  /**
   * Lookup product by barcode or SKU
   * GET /pos/lookup?code=xxx
   *
   * Searches stock entries first, then falls back to product lookup.
   * Returns product info with stock quantity and variant details.
   *
   * @example
   * posApi.lookup({ token, code: '1234567890' }) // barcode
   * posApi.lookup({ token, code: 'TSHIRT-RED-M' }) // SKU
   */
  async lookup({
    token,
    code,
    branchId,
    options = {},
  }: {
    token: string;
    code: string;
    branchId?: string;
    options?: FetchOptions;
  }): Promise<PosLookupResponse> {
    if (!code || code.trim().length < 2) {
      throw new Error('Code must be at least 2 characters');
    }

    const params = new URLSearchParams({ code: code.trim() });
    if (branchId) {
      params.append('branchId', branchId);
    }

    return handleApiRequest('GET', `${this.baseUrl}/lookup?${params}`, {
      token,
      cache: this.cache,
      ...options,
    });
  }

  // ============================================
  // ORDER OPERATIONS
  // ============================================

  /**
   * Create POS order (cart-free)
   * POST /pos/orders
   *
   * Creates order with transactional inventory decrement.
   * All items are validated and stock decremented atomically.
   * If any item fails, entire transaction is rolled back.
   *
   * @example
   * posApi.createOrder({
   *   token,
   *   data: {
   *     items: [
   *       { productId: '123', quantity: 2, price: 500 },
   *       { productId: '456', variantSku: 'SIZE-M', quantity: 1, price: 800 }
   *     ],
   *     customer: { phone: '01712345678', name: 'John Doe' },
   *     payment: { method: 'cash', amount: 1800 },
   *     discount: 100,
   *     branchId: '789',
   *     notes: 'Gift wrap requested'
   *   }
   * })
   */
  async createOrder({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: CreatePosOrderPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Order>> {
    if (!data.items || data.items.length === 0) {
      throw new Error('At least one item is required');
    }

    // Validate each item
    for (const item of data.items) {
      if (!item.productId || !item.quantity || item.price === undefined) {
        throw new Error('Each item requires productId, quantity, and price');
      }
      if (item.quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }
    }

    return handleApiRequest('POST', `${this.baseUrl}/orders`, {
      token,
      body: data,
      ...options,
    });
  }

  /**
   * Get receipt data for an order
   * GET /pos/orders/:orderId/receipt
   *
   * Returns formatted receipt data ready for printing.
   *
   * @example
   * posApi.getReceipt({ token, orderId: '507f1f77bcf86cd799439011' })
   */
  async getReceipt({
    token,
    orderId,
    options = {},
  }: {
    token: string;
    orderId: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Receipt>> {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    return handleApiRequest('GET', `${this.baseUrl}/orders/${orderId}/receipt`, {
      token,
      cache: this.cache,
      ...options,
    });
  }

  // ============================================
  // BRANCH OPERATIONS (POS Context)
  // ============================================

  /**
   * Get active branches for POS
   * GET /pos/branches
   *
   * Returns list of active branches for store selection.
   *
   * @example
   * posApi.getBranches({ token })
   */
  async getBranches({
    token,
    options = {},
  }: {
    token: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Branch[]>> {
    return handleApiRequest('GET', `${this.baseUrl}/branches`, {
      token,
      cache: this.cache,
      ...options,
    });
  }

  /**
   * Get default branch for POS
   * GET /pos/branches/default
   *
   * Returns the default branch (auto-creates if none exists).
   *
   * @example
   * posApi.getDefaultBranch({ token })
   */
  async getDefaultBranch({
    token,
    options = {},
  }: {
    token: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Branch>> {
    return handleApiRequest('GET', `${this.baseUrl}/branches/default`, {
      token,
      cache: this.cache,
      ...options,
    });
  }

  // ============================================
  // INVENTORY OPERATIONS (POS Context)
  // ============================================

  /**
   * Get stock levels for a product
   * GET /pos/inventory/:productId
   *
   * Returns all stock entries for a product (across branches or specific branch)
   *
   * @example
   * posApi.getStock({ token, productId: '123' })
   * posApi.getStock({ token, productId: '123', branchId: '456' })
   */
  async getStock({
    token,
    productId,
    branchId,
    options = {},
  }: {
    token: string;
    productId: string;
    branchId?: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<StockEntryWithProduct[]>> {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    const params = branchId ? `?branchId=${branchId}` : '';

    return handleApiRequest('GET', `${this.inventoryBaseUrl}/${productId}${params}`, {
      token,
      cache: this.cache,
      ...options,
    });
  }

  /**
   * Set stock quantity for a product
   * PUT /pos/inventory/:productId
   *
   * @example
   * posApi.setStock({
   *   token,
   *   productId: '123',
   *   data: {
   *     quantity: 50,
   *     variantSku: 'TSHIRT-RED-M',
   *     branchId: '456',
   *     notes: 'Inventory recount'
   *   }
   * })
   */
  async setStock({
    token,
    productId,
    data,
    options = {},
  }: {
    token: string;
    productId: string;
    data: SetStockPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<StockEntry>> {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    if (data.quantity === undefined) {
      throw new Error('Quantity is required');
    }

    return handleApiRequest('PUT', `${this.inventoryBaseUrl}/${productId}`, {
      token,
      body: data,
      ...options,
    });
  }

  /**
   * Get low stock items
   * GET /pos/inventory/alerts/low-stock
   *
   * @example
   * posApi.getLowStock({ token })
   * posApi.getLowStock({ token, params: { branchId: '123', threshold: 5 }})
   */
  async getLowStock({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: LowStockParams;
    options?: FetchOptions;
  }): Promise<ApiResponse<LowStockItem[]>> {
    const queryString = createQueryString(params as Record<string, unknown>);
    const url = queryString
      ? `${this.inventoryBaseUrl}/alerts/low-stock?${queryString}`
      : `${this.inventoryBaseUrl}/alerts/low-stock`;

    return handleApiRequest('GET', url, {
      token,
      cache: this.cache,
      ...options,
    });
  }

  /**
   * Get stock movement history
   * GET /pos/inventory/movements
   *
   * @example
   * posApi.getMovements({
   *   token,
   *   params: {
   *     productId: '123',
   *     branchId: '456',
   *     type: 'sale',
   *     startDate: '2024-01-01',
   *     endDate: '2024-01-31',
   *     page: 1,
   *     limit: 50
   *   }
   * })
   */
  async getMovements({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: GetMovementsParams;
    options?: FetchOptions;
  }): Promise<InventoryPaginatedResponse<StockMovementWithDetails>> {
    const queryString = createQueryString(params as Record<string, unknown>);
    const url = queryString
      ? `${this.inventoryBaseUrl}/movements?${queryString}`
      : `${this.inventoryBaseUrl}/movements`;

    return handleApiRequest('GET', url, {
      token,
      cache: this.cache,
      ...options,
    });
  }

  /**
   * Check stock availability for multiple items
   * POST /inventory/check-availability
   *
   * Useful for cart validation before checkout.
   * Note: This uses the main inventory endpoint, not POS prefix.
   *
   * @example
   * posApi.checkAvailability({
   *   token,
   *   items: [
   *     { productId: '123', variantSku: 'SIZE-M', quantity: 2 },
   *     { productId: '456', quantity: 1 }
   *   ],
   *   branchId: '789'
   * })
   */
  async checkAvailability({
    token,
    items,
    branchId,
    options = {},
  }: {
    token: string;
    items: StockCheckItem[];
    branchId?: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<StockAvailabilityResult>> {
    if (!items || items.length === 0) {
      throw new Error('Items array is required');
    }

    return handleApiRequest('POST', `${this.basePath}/inventory/check-availability`, {
      token,
      body: { items, branchId },
      ...options,
    });
  }

  // ============================================
  // BULK OPERATIONS (Square/Odoo-inspired)
  // ============================================

  /**
   * Bulk stock adjustment - Process multiple adjustments at once
   * POST /pos/inventory/adjust
   *
   * Workflow: FE scans products → queues adjustments → submits batch
   *
   * Modes:
   * - 'set': Set absolute quantity (for recount/initial load)
   * - 'add': Increment quantity (receiving new stock)
   * - 'remove': Decrement quantity (damage/shrinkage)
   *
   * @example
   * posApi.bulkAdjust({
   *   token,
   *   data: {
   *     adjustments: [
   *       { productId: '123', quantity: 50, mode: 'set' },
   *       { productId: '456', variantSku: 'SIZE-M', quantity: 10, mode: 'add', barcode: '1234567890' },
   *       { productId: '789', quantity: 2, mode: 'remove', reason: 'Damaged' }
   *     ],
   *     branchId: 'branch-123',
   *     reason: 'Weekly inventory count'
   *   }
   * })
   */
  async bulkAdjust({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: BulkAdjustPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<BulkAdjustResult>> {
    if (!data.adjustments || data.adjustments.length === 0) {
      throw new Error('Adjustments array is required');
    }
    if (data.adjustments.length > 500) {
      throw new Error('Maximum 500 adjustments per request');
    }

    return handleApiRequest('POST', `${this.inventoryBaseUrl}/adjust`, {
      token,
      body: data,
      ...options,
    });
  }

  /**
   * Update barcode for product or variant
   * PATCH /pos/inventory/barcode
   *
   * For assigning custom barcodes to products.
   * Validates uniqueness - returns 409 if barcode already exists on another product.
   *
   * @example
   * posApi.updateBarcode({
   *   token,
   *   data: { productId: '123', variantSku: 'SIZE-M', barcode: '1234567890123' }
   * })
   */
  async updateBarcode({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: UpdateBarcodePayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<{ message: string }>> {
    if (!data.productId || !data.barcode) {
      throw new Error('productId and barcode are required');
    }

    return handleApiRequest('PATCH', `${this.inventoryBaseUrl}/barcode`, {
      token,
      body: data,
      ...options,
    });
  }

  /**
   * Get label data for barcode printing
   * GET /pos/inventory/labels
   *
   * Returns formatted data for FE to render barcode labels.
   * FE uses JsBarcode or similar library to generate barcode images.
   *
   * @example
   * // Get labels for specific products
   * posApi.getLabelData({ token, productIds: ['123', '456'] })
   *
   * // Get labels for specific variants
   * posApi.getLabelData({ token, variantSkus: ['TSHIRT-RED-M', 'JEANS-BLUE-32'] })
   */
  async getLabelData({
    token,
    productIds,
    variantSkus,
    branchId,
    options = {},
  }: {
    token: string;
    productIds?: string[];
    variantSkus?: string[];
    branchId?: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<LabelData[]>> {
    if (!productIds?.length && !variantSkus?.length) {
      throw new Error('Provide productIds or variantSkus');
    }

    const params = new URLSearchParams();
    if (productIds?.length) params.append('productIds', productIds.join(','));
    if (variantSkus?.length) params.append('variantSkus', variantSkus.join(','));
    if (branchId) params.append('branchId', branchId);

    return handleApiRequest('GET', `${this.inventoryBaseUrl}/labels?${params}`, {
      token,
      cache: 'no-store',
      ...options,
    });
  }
}

// Create and export a singleton instance
export const posApi = new PosApi();
export { PosApi };

// ============================================
// HELPER TYPES FOR POS UI
// ============================================

/**
 * Cart item for POS UI (before submission)
 */
export interface PosCartItem {
  productId: string;
  productName: string;
  productSlug?: string;
  variantSku?: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image?: string;
  maxQuantity?: number; // Available stock
}

/**
 * Cart state for POS UI
 */
export interface PosCartState {
  items: PosCartItem[];
  subtotal: number;
  discount: number;
  total: number;
  customer?: {
    id?: string;
    name?: string;
    phone?: string;
  };
  branchId?: string;
  terminalId?: string;
  notes?: string;
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(
  items: PosCartItem[],
  discount: number = 0
): { subtotal: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return {
    subtotal,
    total: Math.max(0, subtotal - discount),
  };
}

/**
 * Convert cart to order payload
 */
export function cartToOrderPayload(cart: PosCartState): CreatePosOrderPayload {
  return {
    items: cart.items.map(item => ({
      productId: item.productId,
      variantSku: item.variantSku,
      quantity: item.quantity,
      price: item.unitPrice,
    })),
    customer: cart.customer,
    discount: cart.discount,
    branchId: cart.branchId,
    terminalId: cart.terminalId,
    notes: cart.notes,
  };
}

/**
 * Convert lookup response to cart item
 */
export function lookupToCartItem(
  lookup: PosLookupResponse['data'],
  quantity: number = 1
): PosCartItem | null {
  if (!lookup?.product) return null;

  const { product, matchedVariant } = lookup;
  const priceModifier = matchedVariant?.option?.priceModifier || 0;
  const unitPrice = product.basePrice + priceModifier;

  return {
    productId: product._id,
    productName: product.name,
    productSlug: product.slug,
    variantSku: lookup.variantSku || matchedVariant?.option?.sku,
    variantLabel: matchedVariant
      ? `${matchedVariant.variationName}: ${matchedVariant.option.value}`
      : undefined,
    quantity,
    unitPrice,
    lineTotal: unitPrice * quantity,
    image: product.images?.[0]?.variants?.thumbnail || product.images?.[0]?.url,
    maxQuantity: lookup.quantity,
  };
}

// ============================================
// INVENTORY ADJUSTMENT HELPERS
// ============================================

/**
 * Pending adjustment for bulk stock operations
 * Used to queue adjustments before submitting
 */
export interface PendingAdjustment {
  productId: string;
  productName: string;
  variantSku?: string;
  variantLabel?: string;
  currentQuantity: number;
  newQuantity: number;
  mode: 'set' | 'add' | 'remove';
  reason?: string;
  barcode?: string;
  image?: string;
}

/**
 * Inventory adjustment queue state
 */
export interface AdjustmentQueueState {
  items: PendingAdjustment[];
  branchId?: string;
  defaultReason?: string;
}

/**
 * Convert lookup result to pending adjustment
 */
export function lookupToAdjustment(
  lookup: PosLookupResponse['data'],
  newQuantity: number,
  mode: 'set' | 'add' | 'remove' = 'set'
): PendingAdjustment | null {
  if (!lookup?.product) return null;

  const { product, matchedVariant } = lookup;

  return {
    productId: product._id,
    productName: product.name,
    variantSku: lookup.variantSku || matchedVariant?.option?.sku,
    variantLabel: matchedVariant
      ? `${matchedVariant.variationName}: ${matchedVariant.option.value}`
      : undefined,
    currentQuantity: lookup.quantity || 0,
    newQuantity,
    mode,
    image: product.images?.[0]?.variants?.thumbnail || product.images?.[0]?.url,
  };
}

/**
 * Convert pending adjustments to API payload
 */
export function adjustmentsToPayload(
  queue: AdjustmentQueueState
): BulkAdjustPayload {
  return {
    adjustments: queue.items.map(item => ({
      productId: item.productId,
      variantSku: item.variantSku,
      quantity: item.mode === 'set' ? item.newQuantity : Math.abs(item.newQuantity - item.currentQuantity),
      mode: item.mode,
      reason: item.reason,
      barcode: item.barcode,
    })),
    branchId: queue.branchId,
    reason: queue.defaultReason,
  };
}

// ============================================
// BARCODE LABEL UTILITIES
// ============================================

/**
 * Standard label sizes for thermal printers
 */
export const LABEL_SIZES = {
  /** 50mm x 25mm - Small product labels */
  SMALL: { width: 50, height: 25 },
  /** 60mm x 40mm - Standard product labels */
  STANDARD: { width: 60, height: 40 },
  /** 100mm x 50mm - Large labels with more info */
  LARGE: { width: 100, height: 50 },
} as const;

export type LabelSize = keyof typeof LABEL_SIZES;

/**
 * Format price for label display
 */
export function formatLabelPrice(price: number, currency = '৳'): string {
  return `${currency}${price.toLocaleString()}`;
}

/**
 * Truncate text to fit label width
 */
export function truncateForLabel(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

/**
 * Generate barcode value from SKU if no barcode set
 * Removes special characters that might not scan well
 */
export function normalizeBarcodeValue(barcode: string | undefined, sku: string): string {
  const value = barcode || sku || '';
  // Remove characters that cause scanning issues
  return value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
}

/**
 * Label print data with formatted values
 */
export interface FormattedLabel extends LabelData {
  formattedPrice: string;
  formattedCurrentPrice: string;
  truncatedName: string;
  barcodeValue: string;
}

/**
 * Format label data for printing
 * Use with JsBarcode or similar library
 *
 * @example
 * const labels = await posApi.getLabelData({ token, productIds: ['123'] });
 * const formatted = labels.data.map(l => formatLabelForPrint(l, 'STANDARD'));
 * // Render with JsBarcode:
 * // JsBarcode('#barcode', formatted.barcodeValue, { format: 'CODE128' });
 */
export function formatLabelForPrint(
  label: LabelData,
  size: LabelSize = 'STANDARD'
): FormattedLabel {
  const maxNameLength = size === 'SMALL' ? 15 : size === 'STANDARD' ? 25 : 40;

  return {
    ...label,
    formattedPrice: formatLabelPrice(label.price),
    formattedCurrentPrice: formatLabelPrice(label.currentPrice),
    truncatedName: truncateForLabel(label.name, maxNameLength),
    barcodeValue: normalizeBarcodeValue(label.barcode, label.sku || label.variantSku || ''),
  };
}

/**
 * CSS for printing labels (inject into document)
 * Use with window.print() for browser-based printing
 */
export const LABEL_PRINT_CSS = `
@media print {
  @page {
    size: auto;
    margin: 0;
  }
  body {
    margin: 0;
    padding: 0;
  }
  .label-container {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4mm;
  }
  .label-name {
    font-size: 10pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 2mm;
  }
  .label-variant {
    font-size: 8pt;
    color: #666;
    margin-bottom: 2mm;
  }
  .label-barcode {
    margin: 2mm 0;
  }
  .label-price {
    font-size: 12pt;
    font-weight: bold;
  }
  .label-sku {
    font-size: 7pt;
    color: #999;
  }
}
`;
