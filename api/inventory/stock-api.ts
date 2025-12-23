// @/api/inventory/stock-api.ts
import { BaseApi, type ApiResponse, type PaginatedResponse, type RequestOptions } from '../api-factory';
import { handleApiRequest } from '../api-handler';
import type { StockEntry } from '@/types/inventory.types';

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

/**
 * Stock API - Stock Entry Management
 *
 * Provides access to stock entry records.
 * Stock entries track quantity per product/variant/branch combination.
 *
 * @see docs/api/commerce/inventory.md
 */
class StockApi extends BaseApi<StockEntry> {
  constructor(config = {}) {
    super('inventory', config);
  }

  /**
   * List stock entries
   * GET /inventory
   */
  async list({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: Record<string, unknown>;
    options?: FetchOptions;
  }): Promise<PaginatedResponse<StockEntry>> {
    const processedParams = this.prepareParams(params);
    const queryString = this.createQueryString(processedParams);

    return handleApiRequest('GET', `${this.baseUrl}?${queryString}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get stock entry by ID
   * GET /inventory/:id
   */
  async getById({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<StockEntry>> {
    if (!id) {
      throw new Error('Stock entry ID is required');
    }

    return handleApiRequest('GET', `${this.baseUrl}/${id}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get stock for a specific product
   * GET /inventory?productId=<id>
   */
  async getByProduct({
    token,
    productId,
    branchId,
    options = {},
  }: {
    token: string;
    productId: string;
    branchId?: string;
    options?: FetchOptions;
  }): Promise<PaginatedResponse<StockEntry>> {
    const params: Record<string, unknown> = { productId };
    if (branchId) params.branchId = branchId;

    return this.list({ token, params, options });
  }

  /**
   * Get stock for a specific branch
   * GET /inventory?branchId=<id>
   */
  async getByBranch({
    token,
    branchId,
    params = {},
    options = {},
  }: {
    token: string;
    branchId: string;
    params?: Record<string, unknown>;
    options?: FetchOptions;
  }): Promise<PaginatedResponse<StockEntry>> {
    return this.list({ token, params: { ...params, branchId }, options });
  }
}

export const stockApi = new StockApi();
export { StockApi };
