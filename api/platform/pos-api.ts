import { BaseApi } from '@/api/api-factory';
import type {
  PosProductsResponse,
  PosLookupResponse,
  PosOrderPayload,
  CreateAdjustmentPayload,
  BulkAdjustmentPayload,
} from '@/types/pos.types';

/**
 * POS API Client
 *
 * Follows BaseApi pattern: all methods accept { token, ...params/data }
 */
class PosApi extends BaseApi {

  /**
   * Browse products with branch-specific stock
   * GET /api/v1/pos/products
   */
  async getProducts(options: {
    token: string;
    branchId?: string;
    /** Filter by category slug (matches both parent and child categories) */
    category?: string;
    search?: string;
    inStockOnly?: boolean;
    lowStockOnly?: boolean;
    sort?: string;
    after?: string;
    limit?: number;
  }) {
    const { token, ...params } = options;
    return this.request<PosProductsResponse>('GET', `${this.config.basePath}/pos/products`, {
      params,
      token
    });
  }

  /**
   * Fast Lookup by Barcode/SKU
   * GET /api/v1/pos/lookup
   */
  async lookup(options: {
    token: string;
    code: string;
    branchId?: string;
  }) {
    const { token, ...params } = options;
    return this.request<PosLookupResponse>('GET', `${this.config.basePath}/pos/lookup`, {
      params,
      token
    });
  }

  /**
   * Create POS Order
   * POST /api/v1/pos/orders
   */
  async createOrder(options: {
    token: string;
    data: PosOrderPayload;
  }) {
    const { token, data } = options;
    return this.request('POST', `${this.config.basePath}/pos/orders`, {
      data: data as unknown as Record<string, unknown>,
      token
    });
  }

  /**
   * Get Receipt Data
   * GET /api/v1/pos/orders/:orderId/receipt
   */
  async getReceipt(options: {
    token: string;
    orderId: string;
  }) {
    const { token, orderId } = options;
    return this.request('GET', `${this.config.basePath}/pos/orders/${orderId}/receipt`, {
      token
    });
  }

  /**
   * Adjust Stock (Quick Adjustment from POS)
   * POST /api/v1/pos/stock/adjust
   */
  async adjustStock(options: {
    token: string;
    data: CreateAdjustmentPayload;
  }) {
    const { token, data } = options;
    return this.request('POST', `${this.config.basePath}/pos/stock/adjust`, {
      data: data as unknown as Record<string, unknown>,
      token
    });
  }

  /**
   * Set stock level directly (POS adjustment alias)
   * POST /api/v1/pos/stock/adjust
   */
  async setStock(options: {
    token: string;
    productId: string;
    data: {
      quantity: number;
      branchId?: string;
      variantSku?: string;
      reason?: string;
      notes?: string;
    };
  }) {
    const { token, productId, data } = options;
    return this.request('POST', `${this.config.basePath}/pos/stock/adjust`, {
      data: {
        productId,
        quantity: data.quantity,
        variantSku: data.variantSku,
        branchId: data.branchId,
        mode: 'set',
        reason: data.reason ?? data.notes,
      },
      token,
    });
  }

  /**
   * Bulk adjustments (POS adjustment alias)
   * POST /api/v1/pos/stock/adjust
   */
  async bulkAdjust(options: {
    token: string;
    data: BulkAdjustmentPayload;
  }) {
    const { token, data } = options;
    return this.request('POST', `${this.config.basePath}/pos/stock/adjust`, {
      data: data as unknown as Record<string, unknown>,
      token,
    });
  }
}

export const posApi = new PosApi('pos');
export default posApi;
