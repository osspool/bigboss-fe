// @/api/inventory/request-api.ts
import { BaseApi, type ApiResponse, type PaginatedResponse, type RequestOptions } from '../api-factory';
import { handleApiRequest } from '../api-handler';
import type {
  StockRequest,
  CreateStockRequestPayload,
} from '@/types/inventory.types';

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

/**
 * Stock Request API - Sub-branch → Head Office requests
 *
 * Handles stock requests from sub-branches following the Stripe action-based pattern.
 * Status flow: pending → approved → fulfilled (or rejected/cancelled)
 *
 * @see docs/api/commerce/inventory.md
 */
class RequestApi extends BaseApi<StockRequest, CreateStockRequestPayload> {
  constructor(config = {}) {
    super('inventory/requests', config);
  }

  /**
   * List stock requests
   * GET /inventory/requests
   */
  async list({
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

    return handleApiRequest('GET', `${this.baseUrl}?${queryString}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * List pending stock requests
   * GET /inventory/requests?status=pending
   */
  async listPending({
    token,
    options = {},
  }: {
    token: string;
    options?: FetchOptions;
  }): Promise<PaginatedResponse<StockRequest>> {
    return this.list({ token, params: { status: 'pending' }, options });
  }

  /**
   * Get stock request by ID
   * GET /inventory/requests/:id
   */
  async getById({
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

    return handleApiRequest('GET', `${this.baseUrl}/${id}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Create a stock request
   * POST /inventory/requests
   */
  async create({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: CreateStockRequestPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<StockRequest>> {
    return handleApiRequest('POST', this.baseUrl, {
      token,
      body: data,
      cache: this.config.cache,
      ...options,
    });
  }

  // ==================== Stock Request Actions ====================

  /**
   * Generic action endpoint
   * POST /inventory/requests/:id/action
   */
  async action({
    token,
    id,
    action,
    data = {},
    options = {},
  }: {
    token: string;
    id: string;
    action: 'approve' | 'reject' | 'fulfill' | 'cancel';
    data?: Record<string, unknown>;
    options?: FetchOptions;
  }): Promise<ApiResponse<StockRequest>> {
    if (!id) {
      throw new Error('Request ID is required');
    }

    return handleApiRequest('POST', `${this.baseUrl}/${id}/action`, {
      token,
      body: { action, ...data },
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Approve a stock request
   */
  async approve({
    token,
    id,
    items,
    reviewNotes,
    notes,
    options = {},
  }: {
    token: string;
    id: string;
    items?: { productId: string; variantSku?: string; quantityApproved: number }[];
    reviewNotes?: string;
    notes?: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<StockRequest>> {
    return this.action({
      token,
      id,
      action: 'approve',
      data: { items, reviewNotes: reviewNotes ?? notes },
      options,
    });
  }

  /**
   * Reject a stock request
   */
  async reject({
    token,
    id,
    reason,
    options = {},
  }: {
    token: string;
    id: string;
    reason: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<StockRequest>> {
    return this.action({ token, id, action: 'reject', data: { reason }, options });
  }

  /**
   * Fulfill a stock request (creates a transfer)
   */
  async fulfill({
    token,
    id,
    remarks,
    documentType,
    items,
    options = {},
  }: {
    token: string;
    id: string;
    remarks?: string;
    documentType?: string;
    items?: { productId: string; variantSku?: string; quantity: number }[];
    options?: FetchOptions;
  }): Promise<ApiResponse<StockRequest>> {
    return this.action({
      token,
      id,
      action: 'fulfill',
      data: { remarks, documentType, items },
      options,
    });
  }

  /**
   * Cancel a stock request
   */
  async cancel({
    token,
    id,
    reason,
    options = {},
  }: {
    token: string;
    id: string;
    reason?: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<StockRequest>> {
    return this.action({ token, id, action: 'cancel', data: { reason }, options });
  }
}

export const requestApi = new RequestApi();
export { RequestApi };
