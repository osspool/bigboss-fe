import { BaseApi } from '../api-factory';
import {
  Transaction,
  CreateTransactionPayload,
  FinancialReport,
  CashFlowReport,
  CategoryReport,
  StatementResponse,
} from '@/types/transaction.types';

/**
 * Statement Query Params
 */
interface StatementParams {
  startDate?: string;
  endDate?: string;
  branchId?: string;
  source?: 'web' | 'pos' | 'api';
  status?: string;
  format?: 'csv' | 'json';
  [key: string]: unknown;
}

/**
 * Report Query Params
 */
interface ReportParams {
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}

interface CashFlowParams {
  months?: number; // 1-12, default: 6
  [key: string]: unknown;
}

interface CategoryParams extends ReportParams {
  type?: 'income' | 'expense';
  limit?: number; // default: 10
}

/**
 * Transaction API Client
 *
 * CRUD (via BaseApi):
 * - getAll(params) - List transactions
 * - getById(id) - Get transaction
 *
 * Reports:
 * - getProfitLoss(params) - P&L statement
 * - getCashFlow(params) - Monthly trend
 * - getCategoryReport(params) - Category breakdown
 *
 * Export:
 * - getStatement(params) - CSV/JSON export for accountants
 */
class TransactionApi extends BaseApi<Transaction, CreateTransactionPayload, Partial<CreateTransactionPayload>> {

  /**
   * Get Profit & Loss Report
   * Returns income, expenses, and net profit for a date range
   */
  async getProfitLoss(params: ReportParams = {}, options = {}) {
    return this.request<FinancialReport>('GET', `${this.baseUrl}/reports/profit-loss`, {
      params,
      ...options,
    });
  }

  /**
   * Get Cash Flow Report
   * Returns monthly income, expenses, and net profit trend
   */
  async getCashFlow(params: CashFlowParams = {}, options = {}) {
    return this.request<CashFlowReport>('GET', `${this.baseUrl}/reports/cash-flow`, {
      params,
      ...options,
    });
  }

  /**
   * Get Category Breakdown
   * Returns top spending/income categories for a date range
   */
  async getCategoryReport(params: CategoryParams = {}, options = {}) {
    return this.request<CategoryReport>('GET', `${this.baseUrl}/reports/categories`, {
      params,
      ...options,
    });
  }

  /**
   * Get Statement Export
   * Accountant-friendly export with branch + VAT invoice references
   *
   * @param params.format - 'csv' (default) or 'json'
   * @returns CSV blob (format=csv) or StatementResponse (format=json)
   */
  async getStatement(params: StatementParams = {}, options = {}) {
    if (params.format === 'json') {
      return this.request<StatementResponse>('GET', `${this.baseUrl}/statement`, {
        params,
        ...options,
      });
    }
    // For CSV, caller should handle blob response
    return this.request<Blob>('GET', `${this.baseUrl}/statement`, {
      params: { ...params, format: 'csv' },
      options: { responseType: 'blob', ...options },
    });
  }
}

export const transactionApi = new TransactionApi('transactions');
export default transactionApi;
