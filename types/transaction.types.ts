/**
 * Transaction Types
 *
 * Sources:
 * - modules/transaction/transaction.model.js
 * - common/revenue/enums.js
 */

import type { PaymentMethod, PaymentGatewayType } from "./common.types";

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PAYMENT_INITIATED = 'payment_initiated',
  PROCESSING = 'processing',
  REQUIRES_ACTION = 'requires_action',
  VERIFIED = 'verified',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

/**
 * Transaction Categories
 * Maps to common/revenue/enums.js TRANSACTION_CATEGORY
 */
export enum TransactionCategory {
  // Revenue
  ORDER_PURCHASE = 'order_purchase',
  ORDER_SUBSCRIPTION = 'order_subscription',
  WHOLESALE_SALE = 'wholesale_sale',
  PLATFORM_SUBSCRIPTION = 'platform_subscription',
  CREATOR_SUBSCRIPTION = 'creator_subscription',
  ENROLLMENT_PURCHASE = 'enrollment_purchase',
  ENROLLMENT_SUBSCRIPTION = 'enrollment_subscription',

  // Inventory
  INVENTORY_PURCHASE = 'inventory_purchase',
  PURCHASE_RETURN = 'purchase_return',
  INVENTORY_LOSS = 'inventory_loss',
  INVENTORY_ADJUSTMENT = 'inventory_adjustment',
  COGS = 'cogs',

  // Operational Expenses
  RENT = 'rent',
  UTILITIES = 'utilities',
  EQUIPMENT = 'equipment',
  SUPPLIES = 'supplies',
  MAINTENANCE = 'maintenance',
  MARKETING = 'marketing',
  OTHER_EXPENSE = 'other_expense',

  // Operational Income
  CAPITAL_INJECTION = 'capital_injection',
  RETAINED_EARNINGS = 'retained_earnings',
  TIP_INCOME = 'tip_income',
  OTHER_INCOME = 'other_income',
}

export interface TransactionPaymentDetails {
  walletNumber?: string;
  walletType?: 'personal' | 'merchant';
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  proofUrl?: string;
}

/**
 * Transaction Document
 */
export interface Transaction {
  _id: string;
  organizationId?: string;
  customerId?: string | null;
  handledBy?: string | null;
  amount: number; // In smallest unit (e.g. paisa)
  type: TransactionType | string;
  method: PaymentMethod | string;
  status: TransactionStatus | string;

  category: string; // e.g. 'order_purchase', 'rent', 'cogs'

  source: 'web' | 'pos' | 'api';

  reference?: string;
  referenceModel: string;
  referenceId: string;

  branch?: string;
  currency?: string; // Default: 'BDT'

  gateway?: {
    type: PaymentGatewayType | string;
    paymentUrl?: string;
    transactionId?: string;
    sessionId?: string;
    paymentIntentId?: string;
  };

  paymentDetails?: TransactionPaymentDetails;

  metadata?: Record<string, any>;

  // Verification
  verifiedBy?: string;
  verifiedAt?: string;
  paidAt?: string;

  // Failure tracking
  failedAt?: string;
  failureReason?: string;

  // Refund tracking
  refundedAt?: string;
  refundedAmount?: number;
  refundReason?: string;

  notes?: string;

  date?: string;
  transactionDate?: string;
  createdAt: string;
  updatedAt: string;

  // Virtuals
  isPaid?: boolean;
  amountInUnits?: number;
}

/**
 * Payload to create a Manual Transaction (OpEx, CapEx)
 */
export interface CreateTransactionPayload {
  // Transactions are system-managed; create is blocked.
  notes?: string;
}

/**
 * Financial Report Response
 */
export interface FinancialReport {
  income: number;
  expense: number;
  net: number;
  breakdown: Record<string, number>;
}

/**
 * Statement Row (for CSV/JSON export)
 * GET /transactions/statement
 */
export interface StatementRow {
  transactionId: string;
  transactionDate: string | null;
  createdAt: string | null;
  status: string;
  type: string;
  source: string;
  branchCode: string | null;
  branchId: string | null;
  method: string;
  amountBdt: number;
  currency: string;
  referenceModel: string;
  referenceId: string | null;
  orderId: string | null;
  orderCustomerName: string | null;
  vatInvoiceNumber: string | null;
  vatSellerBin: string | null;
  paymentReference: string | null;
  narration: string | null;
}

/**
 * Statement Export Response (JSON format)
 */
export interface StatementResponse {
  success: boolean;
  count: number;
  data: StatementRow[];
}

/**
 * Cash Flow Report Response
 */
export interface CashFlowReport {
  months: {
    month: string;
    income: number;
    expense: number;
    net: number;
  }[];
}

/**
 * Category Report Response
 */
export interface CategoryReport {
  categories: {
    category: string;
    total: number;
    count: number;
  }[];
}
