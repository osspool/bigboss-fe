// @/api/inventory/movement-api.ts
import { BaseApi, type ApiResponse, type PaginatedResponse, type RequestOptions } from '../api-factory';
import { handleApiRequest } from '../api-handler';
import type {
  StockMovement,
  MovementQueryParams,
  LowStockItem,
} from '@/types/inventory.types';

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

/**
 * Movement API - Stock Audit Trail
 *
 * Every stock change creates an immutable StockMovement record.
 * Types: purchase, sale, return, adjustment, transfer_in, transfer_out, initial, recount
 *
 * @see docs/api/commerce/inventory/stock-movements.md
 */
class MovementApi extends BaseApi<StockMovement> {
  constructor(config = {}) {
    super('inventory/movements', config);
  }

  /**
   * Get stock movements (audit trail)
   * GET /inventory/movements
   *
   * @param params - Filters (productId, branchId, type, startDate, endDate, page, limit, sort, after/cursor)
   */
  async list({
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

    return handleApiRequest('GET', `${this.baseUrl}?${queryString}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get movements by type
   * GET /inventory/movements?type=<type>
   */
  async listByType({
    token,
    type,
    params = {},
    options = {},
  }: {
    token: string;
    type: StockMovement['type'];
    params?: Omit<MovementQueryParams, 'type'>;
    options?: FetchOptions;
  }): Promise<PaginatedResponse<StockMovement>> {
    return this.list({ token, params: { ...params, type }, options });
  }

  /**
   * Get movements for a specific product
   * GET /inventory/movements?productId=<id>
   */
  async listByProduct({
    token,
    productId,
    params = {},
    options = {},
  }: {
    token: string;
    productId: string;
    params?: Omit<MovementQueryParams, 'productId'>;
    options?: FetchOptions;
  }): Promise<PaginatedResponse<StockMovement>> {
    return this.list({ token, params: { ...params, productId }, options });
  }

  /**
   * Get low stock items
   * GET /inventory/low-stock
   */
  async lowStock({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: { branchId?: string; threshold?: number };
    options?: FetchOptions;
  }): Promise<ApiResponse<LowStockItem[]>> {
    const processedParams = this.prepareParams(params);
    const queryString = this.createQueryString(processedParams);
    const baseUrl = this.baseUrl.replace('/movements', '/low-stock');

    return handleApiRequest('GET', `${baseUrl}?${queryString}`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }
}

export const movementApi = new MovementApi();
export { MovementApi };
