// @/api/platform/transaction-api.ts
import {
  BaseApi,
  type ApiResponse,
  type PaginatedResponse,
  type RequestOptions,
} from "../api-factory";
import { handleApiRequest } from "../api-handler";
import type {
  Transaction,
  TransactionPayload,
  TransactionQueryParams,
  ProfitLossReport,
  CategoryReport,
  CashFlowReport,
} from "@/types/transaction.types";

type FetchOptions = Omit<RequestOptions, "token" | "organizationId">;

/**
 * Transaction API - CRUD + Financial Reports
 *
 * Usage:
 * - transactionApi.getAll({ token, params: { status: 'pending' }})
 * - transactionApi.getById({ token, id: '...' })
 * - transactionApi.create({ token, data: {...} })
 * - transactionApi.update({ token, id: '...', data: {...} })
 * - transactionApi.getProfitLossReport({ token, params: { startDate, endDate } })
 * - transactionApi.getCategoriesReport({ token, params: { type: 'income' } })
 * - transactionApi.getCashFlowReport({ token, params: { months: 6 } })
 */
class TransactionApi extends BaseApi<
  Transaction,
  TransactionPayload,
  TransactionPayload
> {
  constructor(config = {}) {
    super("transactions", config);
  }

  /**
   * Get all transactions with filtering
   * @example
   * transactionApi.getAll({
   *   token: 'xxx',
   *   params: {
   *     status: 'verified',
   *     type: 'income',
   *     category: 'order_purchase',
   *     transactionDate: '2025-12-01',
   *   }
   * })
   */
  async getAll({
    token = null,
    organizationId = null,
    params = {},
    options = {},
  }: {
    token?: string | null;
    organizationId?: string | null;
    params?: TransactionQueryParams;
    options?: FetchOptions;
  } = {}): Promise<PaginatedResponse<Transaction>> {
    return super.getAll({ token, organizationId, params, options });
  }

  /**
   * Get Profit & Loss report
   * GET /transactions/reports/profit-loss
   *
   * @example
   * transactionApi.getProfitLossReport({
   *   token: 'xxx',
   *   params: {
   *     startDate: '2025-12-01T00:00:00Z',
   *     endDate: '2025-12-31T23:59:59Z'
   *   }
   * })
   */
  async getProfitLossReport({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: {
      startDate?: string; // ISO 8601 date-time
      endDate?: string; // ISO 8601 date-time
    };
    options?: FetchOptions;
  }): Promise<ApiResponse<ProfitLossReport>> {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    const url = queryString
      ? `${this.baseUrl}/reports/profit-loss?${queryString}`
      : `${this.baseUrl}/reports/profit-loss`;

    return handleApiRequest("GET", url, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get category breakdown report
   * GET /transactions/reports/categories
   *
   * @example
   * transactionApi.getCategoriesReport({
   *   token: 'xxx',
   *   params: {
   *     type: 'income',
   *     startDate: '2025-12-01T00:00:00Z',
   *     endDate: '2025-12-31T23:59:59Z',
   *     limit: 10
   *   }
   * })
   */
  async getCategoriesReport({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: {
      startDate?: string;
      endDate?: string;
      type?: "income" | "expense";
      limit?: number;
    };
    options?: FetchOptions;
  }): Promise<ApiResponse<CategoryReport>> {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    const url = queryString
      ? `${this.baseUrl}/reports/categories?${queryString}`
      : `${this.baseUrl}/reports/categories`;

    return handleApiRequest("GET", url, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Get cash flow trend report
   * GET /transactions/reports/cash-flow
   *
   * @example
   * transactionApi.getCashFlowReport({
   *   token: 'xxx',
   *   params: { months: 6 }
   * })
   */
  async getCashFlowReport({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: {
      months?: number; // Default 6, max 12
    };
    options?: FetchOptions;
  }): Promise<ApiResponse<CashFlowReport>> {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    const url = queryString
      ? `${this.baseUrl}/reports/cash-flow?${queryString}`
      : `${this.baseUrl}/reports/cash-flow`;

    return handleApiRequest("GET", url, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }
}

// Create and export a singleton instance
export const transactionApi = new TransactionApi();
export { TransactionApi };
