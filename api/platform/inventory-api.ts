// @/api/platform/inventory-api.ts
import { BaseApi, type ApiResponse, type PaginatedResponse, type RequestOptions } from '../api-factory';
import { handleApiRequest } from '../api-handler';
import type {
  // Purchases
  CreatePurchasePayload,
  RecordPurchasePayload,
  StockMovement,
  MovementQueryParams,

  // Transfers
  Transfer,
  CreateTransferPayload,
  UpdateTransferPayload,
  DispatchTransferPayload,
  ReceiveTransferPayload,
  TransferStats,

  // Stock Requests
  StockRequest,
  CreateStockRequestPayload,

  // Adjustments
  CreateAdjustmentPayload,
  AdjustStockPayload,
  AdjustStockResult,

  // Low Stock
  LowStockItem,

  // Stock Entry
  StockEntry,
} from '@/types/inventory.types';

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

/**
 * Inventory API - Supply Chain & Stock Management
 *
 * Follows the Bangladesh retail flow:
 * - Head Office purchases stock
 * - Transfers distribute to sub-branches
 * - Sub-branches can request stock
 * - Stock movements tracked for audit
 *
 * Standard CRUD endpoints use BaseApi pattern.
 * Custom endpoints follow Stripe action-based pattern for state transitions.
 *
 * @see docs/api/commerce/inventory.md
 */
class InventoryApi extends BaseApi<StockEntry> {
  constructor(config = {}) {
    super('inventory', config);
  }

  // ==================== Purchases (Head Office Stock Entry) ====================

  /**
   * Record a stock purchase (Head Office only)
   * POST /inventory/purchases
   *
   * @param token - Auth token
   * @param data - Purchase data with items
   * @param options - Request options
   * @returns Stock entries and movements created
   *
   * @example
   * inventoryApi.recordPurchase({
   *   token,
   *   data: {
   *     items: [
   *       { productId: '...', quantity: 100, costPrice: 500 }
   *     ],
   *     createTransaction: false // Default: false for manufacturing
   *   }
   * })
   */
  async recordPurchase({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: RecordPurchasePayload | CreatePurchasePayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<{
    stockEntries: StockEntry[];
    movements: StockMovement[];
  }>> {
    return handleApiRequest('POST', `${this.baseUrl}/purchases`, {
      token,
      body: data,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get purchase history via stock movements
   * GET /inventory/purchases/history
   *
   * @param token - Auth token
   * @param params - Query parameters (branchId, date range, etc.)
   * @param options - Request options
   * @returns Paginated stock movements
   */
  async purchaseHistory({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: MovementQueryParams;
    options?: FetchOptions;
  }): Promise<PaginatedResponse<StockMovement>> {
    const queryParams = { ...params, type: 'purchase' };
    const processedParams = this.prepareParams(queryParams);
    const queryString = this.createQueryString(processedParams);

    return handleApiRequest('GET', `${this.baseUrl}/purchases/history?${queryString}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  // ==================== Transfers (Inter-branch Movement) ====================

  /**
   * List transfers with filtering
   * GET /inventory/transfers
   *
   * @param token - Auth token
   * @param params - Filters (status, senderBranch, receiverBranch, challanNumber, documentType)
   * @param options - Request options
   * @returns Paginated transfers
   */
  async listTransfers({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: Record<string, unknown>;
    options?: FetchOptions;
  }): Promise<PaginatedResponse<Transfer>> {
    const processedParams = this.prepareParams(params);
    const queryString = this.createQueryString(processedParams);

    return handleApiRequest('GET', `${this.baseUrl}/transfers?${queryString}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get transfer by ID or challan number
   * GET /inventory/transfers/:id
   *
   * @param token - Auth token
   * @param id - Transfer ID or challan number (e.g., 'CHN-202512-0042')
   * @param options - Request options
   * @returns Transfer details
   */
  async getTransfer({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Transfer>> {
    if (!id) {
      throw new Error('Transfer ID or challan number is required');
    }

    return handleApiRequest('GET', `${this.baseUrl}/transfers/${id}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Create a new transfer (draft)
   * POST /inventory/transfers
   *
   * @param token - Auth token
   * @param data - Transfer data
   * @param options - Request options
   * @returns Created transfer
   *
   * @example
   * inventoryApi.createTransfer({
   *   token,
   *   data: {
   *     receiverBranchId: 'SUB_BRANCH_ID',
   *     items: [
   *       { productId: '...', variantSku: 'SKU-RED-M', quantity: 10 }
   *     ],
   *     remarks: 'Weekly replenishment'
   *   }
   * })
   */
  async createTransfer({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: CreateTransferPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Transfer>> {
    return handleApiRequest('POST', `${this.baseUrl}/transfers`, {
      token,
      body: data,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Update a draft transfer
   * PATCH /inventory/transfers/:id
   *
   * @param token - Auth token
   * @param id - Transfer ID
   * @param data - Update data
   * @param options - Request options
   * @returns Updated transfer
   */
  async updateTransfer({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data: UpdateTransferPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Transfer>> {
    if (!id) {
      throw new Error('Transfer ID is required');
    }

    return handleApiRequest('PATCH', `${this.baseUrl}/transfers/${id}`, {
      token,
      body: data,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get transfer statistics
   * GET /inventory/transfers/stats
   *
   * @param token - Auth token
   * @param params - Filters (branchId)
   * @param options - Request options
   * @returns Transfer stats
   */
  async transferStats({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: { branchId?: string };
    options?: FetchOptions;
  }): Promise<ApiResponse<TransferStats>> {
    const queryString = this.createQueryString(params);
    const url = queryString
      ? `${this.baseUrl}/transfers/stats?${queryString}`
      : `${this.baseUrl}/transfers/stats`;

    return handleApiRequest('GET', url, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  // ==================== Transfer Actions (Stripe Pattern) ====================

  /**
   * Approve a transfer (validates stock availability)
   * POST /inventory/transfers/:id/action { action: 'approve' }
   *
   * @param token - Auth token
   * @param id - Transfer ID
   * @param options - Request options
   * @returns Approved transfer
   */
  async approveTransfer({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Transfer>> {
    if (!id) {
      throw new Error('Transfer ID is required');
    }

    return handleApiRequest('POST', `${this.baseUrl}/transfers/${id}/action`, {
      token,
      body: { action: 'approve' },
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Dispatch a transfer (decrements sender stock)
   * POST /inventory/transfers/:id/action { action: 'dispatch', transport: {...} }
   *
   * @param token - Auth token
   * @param id - Transfer ID
   * @param data - Transport details (optional)
   * @param options - Request options
   * @returns Dispatched transfer
   *
   * @example
   * inventoryApi.dispatchTransfer({
   *   token,
   *   id: 'transfer_123',
   *   data: {
   *     transport: {
   *       vehicleNumber: 'DHA-1234',
   *       driverName: 'Rahim',
   *       driverPhone: '017XXXXXXXX'
   *     }
   *   }
   * })
   */
  async dispatchTransfer({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data?: DispatchTransferPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Transfer>> {
    if (!id) {
      throw new Error('Transfer ID is required');
    }

    return handleApiRequest('POST', `${this.baseUrl}/transfers/${id}/action`, {
      token,
      body: { action: 'dispatch', ...data },
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Mark transfer as in-transit
   * POST /inventory/transfers/:id/action { action: 'in-transit' }
   *
   * @param token - Auth token
   * @param id - Transfer ID
   * @param options - Request options
   * @returns Updated transfer
   */
  async markInTransit({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Transfer>> {
    if (!id) {
      throw new Error('Transfer ID is required');
    }

    return handleApiRequest('POST', `${this.baseUrl}/transfers/${id}/action`, {
      token,
      body: { action: 'in-transit' },
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Receive a transfer (increments receiver stock)
   * POST /inventory/transfers/:id/action { action: 'receive', items: [...] }
   *
   * @param token - Auth token
   * @param id - Transfer ID
   * @param data - Receipt data (optional for partial receipt)
   * @param options - Request options
   * @returns Received transfer
   *
   * @example
   * // Full receipt
   * inventoryApi.receiveTransfer({ token, id: 'transfer_123' })
   *
   * // Partial receipt
   * inventoryApi.receiveTransfer({
   *   token,
   *   id: 'transfer_123',
   *   data: {
   *     items: [
   *       { productId: '...', variantSku: 'SKU-RED-M', quantityReceived: 8 }
   *     ]
   *   }
   * })
   */
  async receiveTransfer({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data?: ReceiveTransferPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Transfer>> {
    if (!id) {
      throw new Error('Transfer ID is required');
    }

    return handleApiRequest('POST', `${this.baseUrl}/transfers/${id}/action`, {
      token,
      body: { action: 'receive', ...data },
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Cancel a transfer
   * POST /inventory/transfers/:id/action { action: 'cancel', reason: '...' }
   *
   * @param token - Auth token
   * @param id - Transfer ID
   * @param data - Cancellation reason
   * @param options - Request options
   * @returns Cancelled transfer
   */
  async cancelTransfer({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data?: { reason?: string };
    options?: FetchOptions;
  }): Promise<ApiResponse<Transfer>> {
    if (!id) {
      throw new Error('Transfer ID is required');
    }

    return handleApiRequest('POST', `${this.baseUrl}/transfers/${id}/action`, {
      token,
      body: { action: 'cancel', ...data },
      cache: this.config.cache,
      ...options,
    });
  }

  // ==================== Stock Requests (Sub-branch → Head Office) ====================

  /**
   * List stock requests
   * GET /inventory/requests
   *
   * @param token - Auth token
   * @param params - Filters (status, branchId, etc.)
   * @param options - Request options
   * @returns Paginated stock requests
   */
  async listRequests({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: Record<string, unknown>;
    options?: FetchOptions;
  }): Promise<PaginatedResponse<StockRequest>> {
    const processedParams = this.prepareParams(params);
    const queryString = this.createQueryString(processedParams);

    return handleApiRequest('GET', `${this.baseUrl}/requests?${queryString}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * List pending stock requests
   * GET /inventory/requests?status=pending
   *
   * @param token - Auth token
   * @param options - Request options
   * @returns Pending requests
   */
  async listPendingRequests({
    token,
    options = {},
  }: {
    token: string;
    options?: FetchOptions;
  }): Promise<PaginatedResponse<StockRequest>> {
    return this.listRequests({ token, params: { status: 'pending' }, options });
  }

  /**
   * Get stock request by ID
   * GET /inventory/requests/:id
   *
   * @param token - Auth token
   * @param id - Request ID
   * @param options - Request options
   * @returns Request details
   */
  async getRequest({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<StockRequest>> {
    if (!id) {
      throw new Error('Request ID is required');
    }

    return handleApiRequest('GET', `${this.baseUrl}/requests/${id}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Create a stock request
   * POST /inventory/requests
   *
   * @param token - Auth token
   * @param data - Request data
   * @param options - Request options
   * @returns Created request
   */
  async createRequest({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: CreateStockRequestPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<StockRequest>> {
    return handleApiRequest('POST', `${this.baseUrl}/requests`, {
      token,
      body: data,
      cache: this.config.cache,
      ...options,
    });
  }

  // ==================== Stock Request Actions ====================

  /**
   * Approve a stock request
   * POST /inventory/requests/:id/action { action: 'approve', items: [...] }
   *
   * @param token - Auth token
   * @param id - Request ID
   * @param data - Approval data (optional modified quantities)
   * @param options - Request options
   * @returns Approved request
   */
  async approveRequest({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data?: { items?: { productId: string; variantSku?: string; approvedQuantity: number }[]; reviewNotes?: string };
    options?: FetchOptions;
  }): Promise<ApiResponse<StockRequest>> {
    if (!id) {
      throw new Error('Request ID is required');
    }

    return handleApiRequest('POST', `${this.baseUrl}/requests/${id}/action`, {
      token,
      body: { action: 'approve', ...data },
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Reject a stock request
   * POST /inventory/requests/:id/action { action: 'reject', reason: '...' }
   *
   * @param token - Auth token
   * @param id - Request ID
   * @param data - Rejection reason
   * @param options - Request options
   * @returns Rejected request
   */
  async rejectRequest({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data: { reason: string };
    options?: FetchOptions;
  }): Promise<ApiResponse<StockRequest>> {
    if (!id) {
      throw new Error('Request ID is required');
    }

    return handleApiRequest('POST', `${this.baseUrl}/requests/${id}/action`, {
      token,
      body: { action: 'reject', ...data },
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Fulfill a stock request (creates a transfer)
   * POST /inventory/requests/:id/action { action: 'fulfill' }
   *
   * @param token - Auth token
   * @param id - Request ID
   * @param data - Fulfillment options
   * @param options - Request options
   * @returns Fulfilled request with transfer reference
   */
  async fulfillRequest({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data?: { remarks?: string; documentType?: string };
    options?: FetchOptions;
  }): Promise<ApiResponse<StockRequest>> {
    if (!id) {
      throw new Error('Request ID is required');
    }

    return handleApiRequest('POST', `${this.baseUrl}/requests/${id}/action`, {
      token,
      body: { action: 'fulfill', ...data },
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Cancel a stock request
   * POST /inventory/requests/:id/action { action: 'cancel', reason: '...' }
   *
   * @param token - Auth token
   * @param id - Request ID
   * @param data - Cancellation reason
   * @param options - Request options
   * @returns Cancelled request
   */
  async cancelRequest({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data?: { reason?: string };
    options?: FetchOptions;
  }): Promise<ApiResponse<StockRequest>> {
    if (!id) {
      throw new Error('Request ID is required');
    }

    return handleApiRequest('POST', `${this.baseUrl}/requests/${id}/action`, {
      token,
      body: { action: 'cancel', ...data },
      cache: this.config.cache,
      ...options,
    });
  }

  // ==================== Adjustments (Manual Corrections) ====================

  /**
   * Create a manual stock adjustment
   * POST /inventory/adjustments
   *
   * @param token - Auth token
   * @param data - Adjustment data
   * @param options - Request options
   * @returns Adjustment result
   *
   * @example
   * inventoryApi.createAdjustment({
   *   token,
   *   data: {
   *     productId: '...',
   *     variantSku: 'SKU-RED-M',
   *     quantity: 5,
   *     mode: 'remove',
   *     reason: 'damaged',
   *     lostAmount: 2500 // Creates expense transaction (opt-in)
   *   }
   * })
   */
  async createAdjustment({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: CreateAdjustmentPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<StockMovement>> {
    return handleApiRequest('POST', `${this.baseUrl}/adjustments`, {
      token,
      body: data,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Adjust stock (POS format)
   * POST /inventory/adjustments (single item)
   *
   * @param token - Auth token
   * @param data - Adjustment payload
   * @param options - Request options
   * @returns Adjustment result
   */
  async adjustStock({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: AdjustStockPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<AdjustStockResult>> {
    return handleApiRequest('POST', `${this.baseUrl}/adjustments`, {
      token,
      body: data,
      cache: this.config.cache,
      ...options,
    });
  }

  // ==================== Stock Viewing & Audit ====================

  /**
   * Get low stock items
   * GET /inventory/low-stock
   *
   * @param token - Auth token
   * @param params - Filters (branchId, threshold)
   * @param options - Request options
   * @returns Low stock items
   */
  async lowStock({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: { branchId?: string; threshold?: number };
    options?: FetchOptions;
  }): Promise<PaginatedResponse<LowStockItem>> {
    const processedParams = this.prepareParams(params);
    const queryString = this.createQueryString(processedParams);

    return handleApiRequest('GET', `${this.baseUrl}/low-stock?${queryString}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get stock movements (audit trail)
   * GET /inventory/movements
   *
   * @param token - Auth token
   * @param params - Filters (productId, branchId, type, date range)
   * @param options - Request options
   * @returns Paginated stock movements
   */
  async movements({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: MovementQueryParams;
    options?: FetchOptions;
  }): Promise<PaginatedResponse<StockMovement>> {
    const processedParams = this.prepareParams(params as Record<string, unknown>);
    const queryString = this.createQueryString(processedParams);

    return handleApiRequest('GET', `${this.baseUrl}/movements?${queryString}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }
}

// Create and export a singleton instance
export const inventoryApi = new InventoryApi();
export { InventoryApi };
