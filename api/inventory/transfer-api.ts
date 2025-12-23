// @/api/inventory/transfer-api.ts
import { BaseApi, type ApiResponse, type PaginatedResponse, type RequestOptions } from '../api-factory';
import { handleApiRequest } from '../api-handler';
import type {
  Transfer,
  CreateTransferPayload,
  UpdateTransferPayload,
  DispatchTransferPayload,
  ReceiveTransferPayload,
  TransferStats,
} from '@/types/inventory.types';

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

/**
 * Transfer API - Inter-branch Stock Movement
 *
 * Handles challan/transfer documents following the Stripe action-based pattern.
 * Status flow: draft → approved → dispatched → in_transit → received
 *
 * @see docs/api/commerce/inventory/challan.md
 */
class TransferApi extends BaseApi<Transfer, CreateTransferPayload, UpdateTransferPayload> {
  constructor(config = {}) {
    super('inventory/transfers', config);
  }

  /**
   * List transfers with filtering
   * GET /inventory/transfers
   */
  async list({
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

    return handleApiRequest('GET', `${this.baseUrl}?${queryString}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get transfer by ID or challan number
   * GET /inventory/transfers/:id
   */
  async getById({
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

    return handleApiRequest('GET', `${this.baseUrl}/${id}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Create a new transfer (draft)
   * POST /inventory/transfers
   */
  async create({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: CreateTransferPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Transfer>> {
    return handleApiRequest('POST', this.baseUrl, {
      token,
      body: data,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Update a draft transfer
   * PATCH /inventory/transfers/:id
   */
  async update({
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

    return handleApiRequest('PATCH', `${this.baseUrl}/${id}`, {
      token,
      body: data,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get transfer statistics
   * GET /inventory/transfers/stats
   */
  async stats({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: { branchId?: string };
    options?: FetchOptions;
  }): Promise<ApiResponse<TransferStats>> {
    const queryString = this.createQueryString(params);
    const url = queryString ? `${this.baseUrl}/stats?${queryString}` : `${this.baseUrl}/stats`;

    return handleApiRequest('GET', url, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  // ==================== Transfer Actions (Stripe Pattern) ====================

  /**
   * Generic action endpoint
   * POST /inventory/transfers/:id/action
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
    action: 'approve' | 'dispatch' | 'in-transit' | 'receive' | 'cancel';
    data?: Record<string, unknown>;
    options?: FetchOptions;
  }): Promise<ApiResponse<Transfer>> {
    if (!id) {
      throw new Error('Transfer ID is required');
    }

    return handleApiRequest('POST', `${this.baseUrl}/${id}/action`, {
      token,
      body: { action, ...data },
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Approve a transfer (validates stock availability)
   */
  async approve({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Transfer>> {
    return this.action({ token, id, action: 'approve', options });
  }

  /**
   * Dispatch a transfer (decrements sender stock)
   */
  async dispatch({
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
    return this.action({ token, id, action: 'dispatch', data: data as Record<string, unknown>, options });
  }

  /**
   * Mark transfer as in-transit
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
    return this.action({ token, id, action: 'in-transit', options });
  }

  /**
   * Receive a transfer (increments receiver stock)
   */
  async receive({
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
    return this.action({ token, id, action: 'receive', data: data as Record<string, unknown>, options });
  }

  /**
   * Cancel a transfer
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
  }): Promise<ApiResponse<Transfer>> {
    return this.action({ token, id, action: 'cancel', data: { reason }, options });
  }
}

export const transferApi = new TransferApi();
export { TransferApi };
