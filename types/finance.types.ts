// types/finance.types.ts

/**
 * Finance Types
 *
 * Types for finance statements, summaries, and exports
 */

// ============================================
// FINANCE STATEMENT TYPES
// ============================================

export interface FinanceStatement {
  _id: string;
  date: string;
  branchId?: string;
  branchCode?: string;
  branchName?: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  method: string;
  source: 'web' | 'pos' | 'api';
  status: string;
  invoiceNumber?: string;
  paymentReference?: string;
  orderReference?: {
    model: string;
    id: string;
  };
  description?: string;
  createdAt: string;
}

export interface FinanceStatementParams {
  startDate: string;
  endDate: string;
  branchId?: string;
  source?: 'web' | 'pos' | 'api';
  status?: string;
  format?: 'csv' | 'json';
  page?: number;
  limit?: number;
}

// ============================================
// FINANCE SUMMARY TYPES
// ============================================

export interface FinanceTotals {
  income: number;
  expense: number;
  net: number;
  count: number;
  currency: string;
}

export interface FinanceByMethod {
  method: string;
  income: number;
  expense: number;
  net: number;
  count: number;
}

export interface FinanceByDay {
  date: string;
  branchId?: string;
  branchCode?: string;
  branchName?: string;
  income: number;
  expense: number;
  net: number;
  count: number;
  byMethod: FinanceByMethod[];
}

export interface FinanceSummary {
  totals: FinanceTotals;
  byMethod: FinanceByMethod[];
  byDay: FinanceByDay[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface FinanceSummaryParams {
  startDate: string;
  endDate: string;
  branchId?: string;
  source?: 'web' | 'pos' | 'api';
  status?: string;
}
