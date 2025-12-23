// @/api/inventory/adjustment-api.ts
import { BaseApi, type ApiResponse, type RequestOptions } from '../api-factory';
import { handleApiRequest } from '../api-handler';
import type {
  CreateAdjustmentPayload,
  AdjustStockPayload,
  AdjustStockResult,
} from '@/types/inventory.types';

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

/**
 * Adjustment API - Manual Stock Corrections
 *
 * Handles manual stock adjustments (add, remove, set).
 * Creates adjustment movements and optionally expense transactions.
 *
 * @see docs/api/commerce/inventory.md
 */
class AdjustmentApi extends BaseApi<AdjustStockResult, CreateAdjustmentPayload> {
  constructor(config = {}) {
    super('inventory/adjustments', config);
  }

  /**
   * Create a manual stock adjustment
   * POST /inventory/adjustments
   *
   * @example Single item adjustment
   * adjustmentApi.create({
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
   *
   * @example Bulk adjustment
   * adjustmentApi.create({
   *   token,
   *   data: {
   *     adjustments: [
   *       { productId: '...', quantity: 5, mode: 'add' },
   *       { productId: '...', quantity: 3, mode: 'remove' }
   *     ],
   *     reason: 'inventory recount'
   *   }
   * })
   */
  async create({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: CreateAdjustmentPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<AdjustStockResult>> {
    return handleApiRequest('POST', this.baseUrl, {
      token,
      body: data,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Adjust stock (single item, POS format)
   * POST /inventory/adjustments
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
    return handleApiRequest('POST', this.baseUrl, {
      token,
      body: data,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Add stock to a product
   */
  async addStock({
    token,
    productId,
    variantSku,
    quantity,
    branchId,
    reason,
    options = {},
  }: {
    token: string;
    productId: string;
    variantSku?: string;
    quantity: number;
    branchId?: string;
    reason?: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<AdjustStockResult>> {
    return this.adjustStock({
      token,
      data: { productId, variantSku, quantity, mode: 'add', branchId, reason },
      options,
    });
  }

  /**
   * Remove stock from a product
   */
  async removeStock({
    token,
    productId,
    variantSku,
    quantity,
    branchId,
    reason,
    lostAmount,
    options = {},
  }: {
    token: string;
    productId: string;
    variantSku?: string;
    quantity: number;
    branchId?: string;
    reason?: string;
    lostAmount?: number;
    options?: FetchOptions;
  }): Promise<ApiResponse<AdjustStockResult>> {
    return this.create({
      token,
      data: { productId, variantSku, quantity, mode: 'remove', branchId, reason, lostAmount },
      options,
    });
  }

  /**
   * Set stock to a specific quantity
   */
  async setStock({
    token,
    productId,
    variantSku,
    quantity,
    branchId,
    reason,
    options = {},
  }: {
    token: string;
    productId: string;
    variantSku?: string;
    quantity: number;
    branchId?: string;
    reason?: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<AdjustStockResult>> {
    return this.adjustStock({
      token,
      data: { productId, variantSku, quantity, mode: 'set', branchId, reason },
      options,
    });
  }
}

export const adjustmentApi = new AdjustmentApi();
export { AdjustmentApi };
