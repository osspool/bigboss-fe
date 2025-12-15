// @/api/platform/transaction.types.ts
import type {
  PaymentMethod,
  PaymentDetails,
  GatewayInfo,
} from "./common.types";

/**
 * Transaction Types
 * Aligned with Transaction model and @classytic/revenue
 */

// ============ Enums/Unions ============

export type TransactionType = "income" | "expense";

export type TransactionStatus =
  | "pending"
  | "payment_initiated"
  | "processing"
  | "requires_action"
  | "verified"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded"
  | "partially_refunded";

export type TransactionCategory =
  | "order_purchase"
  | "order_refund"
  | "capital_injection"
  | "capital_withdrawal"
  | "expense"
  | "commission"
  | "other";

export type TransactionReferenceModel = "Order" | "Commission" | "Expense";

// ============ Interfaces ============

export interface TransactionWebhookData {
  eventId?: string;
  eventType?: string;
  receivedAt?: string;
  processedAt?: string;
  data?: unknown;
}

export interface TransactionEntity {
  referenceModel: TransactionReferenceModel;
  referenceId: string;
}

/**
 * Full Transaction document
 * Matches backend Transaction model schema
 */
export interface Transaction {
  _id: string;

  // Core fields
  amount: number; // smallest currency unit (e.g., paisa)
  type: TransactionType;
  method: PaymentMethod;
  status: TransactionStatus;
  category: TransactionCategory | string;
  currency: string; // e.g., BDT

  // Reference to related entity (polymorphic)
  referenceModel: TransactionReferenceModel;
  referenceId: string;

  // Source tracking (for channel analytics)
  source?: 'web' | 'pos' | 'api';

  // Branch reference (for multi-location tracking)
  branch?: string;

  // Payment information
  gateway?: GatewayInfo;
  paymentDetails?: PaymentDetails;
  metadata?: Record<string, unknown>;

  // Idempotency
  idempotencyKey?: string;

  // Webhook tracking
  webhook?: TransactionWebhookData;

  // Verification tracking
  verifiedBy?: string;
  verifiedAt?: string;

  // Status timestamps
  paidAt?: string;
  failedAt?: string;
  failureReason?: string;

  // Refund tracking
  refundedAt?: string;
  refundedAmount?: number;
  refundReason?: string;

  // Additional info
  notes?: string;
  transactionDate?: string; // When transaction occurred (vs createdAt)

  // Audit timestamps
  createdAt: string;
  updatedAt: string;

  // Virtuals
  isPaid?: boolean;
  amountInUnits?: number;
}

// ============ Request/Response Payloads ============

/**
 * Transaction payload for create/update
 * Most fields optional - backend handles validation via schema rules
 */
export interface TransactionPayload {
  amount?: number;
  type?: TransactionType;
  method?: PaymentMethod;
  status?: TransactionStatus;
  category?: TransactionCategory | string;
  currency?: string;
  referenceModel?: TransactionReferenceModel;
  referenceId?: string;
  source?: 'web' | 'pos' | 'api';
  branch?: string;
  paymentDetails?: PaymentDetails;
  metadata?: Record<string, unknown>;
  notes?: string;
  transactionDate?: string; // ISO 8601 date-time
  failureReason?: string;
  refundReason?: string;
}

/**
 * Query parameters for transaction filtering
 */
export interface TransactionQueryParams {
  // Pagination
  page?: number;
  limit?: number;
  after?: string;

  // Filters
  customerId?: string;
  orderId?: string;
  referenceId?: string;
  referenceModel?: TransactionReferenceModel;
  type?: TransactionType;
  method?: PaymentMethod;
  category?: string;
  status?: TransactionStatus;
  source?: 'web' | 'pos' | 'api';
  branch?: string;
  transactionDate?: string; // ISO date or range

  // Populate
  populate?: string | string[];

  // Sort
  sort?: string | Record<string, 1 | -1 | 'asc' | 'desc'>;

  // Allow extra filters without type errors
  [key: string]: unknown;
}

// ============ Report Types ============

/**
 * Profit & Loss Report
 */
export interface ProfitLossReport {
  startDate: string;
  endDate: string;
  income: {
    total: number;
    count: number;
    categories: Array<{
      category: string;
      amount: number;
      count: number;
    }>;
  };
  expenses: {
    total: number;
    count: number;
    categories: Array<{
      category: string;
      amount: number;
      count: number;
    }>;
  };
  netProfit: number;
}

/**
 * Category Breakdown Report
 */
export interface CategoryReport {
  startDate: string;
  endDate: string;
  type: TransactionType;
  categories: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  total: number;
}

/**
 * Cash Flow Report (monthly trend)
 */
export interface CashFlowReport {
  months: Array<{
    month: string; // YYYY-MM
    income: number;
    expenses: number;
    netProfit: number;
  }>;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    totalNetProfit: number;
    avgMonthlyIncome: number;
    avgMonthlyExpenses: number;
  };
}

// Re-export payment types for convenience
export type { PaymentMethod, PaymentDetails, GatewayInfo } from "./common.types";
