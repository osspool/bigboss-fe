import { z } from "zod";
import { objectIdStringSchema, optionalObjectIdString } from "@/lib/utils/zod-utils";
import {
  TRANSACTION_CATEGORY_VALUES,
  TRANSACTION_FLOW_VALUES,
  TRANSACTION_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
  PAYMENT_GATEWAY_TYPE_VALUES,
  COMMISSION_STATUS_VALUES,
  ORDER_SOURCE_VALUES,
} from "@/constants/enums/monetization.enum";

/**
 * Payment details schema matching backend structure
 */
export const transactionPaymentDetails = z.object({
  walletNumber: z.string().optional(),
  walletType: z.enum(['personal', 'merchant']).optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  proofUrl: z.string().optional(), // Screenshot or proof URL
}).optional();

/**
 * Tax details schema matching backend structure
 */
export const taxDetailsSchema = z.object({
  type: z.enum(['vat', 'gst', 'sales_tax']).optional(),
  rate: z.number().optional(), // Decimal (0.15 = 15%)
  isInclusive: z.boolean().optional(), // Prices include tax
  jurisdiction: z.string().optional(), // Tax jurisdiction (e.g., 'BD')
}).optional();

/**
 * Transaction create schema (for manual operational transactions)
 * Per API guide: FE can only create manual transactions
 * Library-managed transactions (SUBSCRIPTION, MEMBERSHIP, REFUND, HRM) are created by workflows
 *
 * Manual categories: rent, utilities, equipment, supplies, maintenance, marketing,
 * other_expense, capital_injection, retained_earnings, other_income, adjustment
 *
 * Backend auto-injects:
 * - organizationId (from auth context)
 * - type (derived from category)
 * - status (defaults to 'pending' if not provided)
 * - verifiedAt, verifiedBy (null initially)
 * - commission, gateway, webhook (system-managed)
 */
export const transactionCreateSchema = z
  .object({})
  .refine(() => false, {
    message: "Transactions are system-managed and cannot be created from the frontend.",
  });

/**
 * Transaction update schema (for API updates)
 * Per API guide:
 * - Library-managed: Only notes allowed (status managed by webhooks)
 * - Manual (status=pending): status, amount, method, reference, paymentDetails, notes, date
 * - Manual (verified/completed): status, notes, reference, paymentDetails
 *
 * Frontend will conditionally enable/disable fields based on category and status
 */
export const transactionUpdateSchema = z.object({
  notes: z.string().optional(),
});

/**
 * Transaction view schema (for displaying transaction data)
 * Includes all fields returned by backend
 *
 * Key fields per API docs:
 * - flow: Direction of money ('inflow' = income, 'outflow' = expense)
 * - type: Category string (order_purchase, refund, inventory_purchase, etc.)
 * - amount: Gross amount in smallest unit (paisa)
 * - net: Amount after fees (amount - fee)
 * - sourceModel/sourceId: Polymorphic reference to source document
 */
export const transactionViewSchema = z.object({
  _id: z.string(),
  organizationId: objectIdStringSchema,
  customerId: optionalObjectIdString,
  handledBy: optionalObjectIdString,

  // === CLASSIFICATION ===
  // Flow: direction of money (inflow = income, outflow = expense)
  flow: z.enum(TRANSACTION_FLOW_VALUES),
  // Type: category of transaction (order_purchase, refund, inventory_purchase, etc.)
  type: z.string(), // Allow any category string from backend
  status: z.enum(TRANSACTION_STATUS_VALUES),

  // === AMOUNTS (in smallest currency unit - paisa for BDT) ===
  amount: z.number().min(0), // Gross amount
  fee: z.number().optional().default(0), // Gateway/platform fees
  tax: z.number().optional().default(0), // Tax amount (informational for VAT)
  net: z.number().optional(), // Net amount after fees (amount - fee)
  currency: z.string().optional().default('BDT'),

  // Tax details for finance reporting
  taxDetails: taxDetailsSchema,

  // === PAYMENT ===
  method: z.enum([...PAYMENT_METHOD_VALUES, 'split']),
  // Payment gateway integration (system-managed)
  gateway: z.object({
    type: z.string().optional(), // manual, stripe, sslcommerz, etc.
    paymentIntentId: z.string().optional(),
    sessionId: z.string().optional(),
    paymentUrl: z.string().optional(),
    expiresAt: z.date().optional(),
    metadata: z.any().optional(),
  }).optional(),
  // Customer-provided payment reference
  reference: z.string().optional(),
  // Payment details (wallet, bank info)
  paymentDetails: transactionPaymentDetails,

  // === SOURCE & BRANCH ===
  // Source channel: where the transaction originated
  source: z.enum(ORDER_SOURCE_VALUES).optional(), // 'web', 'pos', 'api'
  // Branch reference for POS/multi-location
  branch: optionalObjectIdString,

  // === POLYMORPHIC REFERENCE ===
  // Links to source document (Order, Purchase, etc.)
  sourceModel: z.string().optional(), // 'Order', 'Purchase', 'Manual'
  sourceId: optionalObjectIdString, // Source document ID

  // Related transaction (for refunds linking to original)
  relatedTransactionId: optionalObjectIdString,

  // === METADATA ===
  metadata: z.any().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),

  // Idempotency key (for safe retries)
  idempotencyKey: z.string().optional(),

  // Webhook handling (system-managed)
  webhook: z.object({
    eventId: z.string().optional(),
    eventType: z.string().optional(),
    receivedAt: z.date().optional(),
    processedAt: z.date().optional(),
    payload: z.any().optional(),
  }).optional(),

  // === TIMESTAMPS ===
  // Transaction date (when it occurred)
  date: z.date().optional(),
  transactionDate: z.date().optional(),

  // Verification tracking
  verifiedAt: z.date().optional(),
  verifiedBy: optionalObjectIdString,

  // Status timestamps
  initiatedAt: z.date().optional(),
  completedAt: z.date().optional(),
  failedAt: z.date().optional(),
  failureReason: z.string().optional(),

  // Refund tracking
  refundedAt: z.date().optional(),
  refundedAmount: z.number().optional().default(0),

  // === COMMISSION (for marketplace use) ===
  commission: z.object({
    rate: z.number().optional(),
    grossAmount: z.number().optional(),
    gatewayFeeRate: z.number().optional(),
    gatewayFeeAmount: z.number().optional(),
    netAmount: z.number().optional(),
    status: z.enum(COMMISSION_STATUS_VALUES).optional(),
    dueDate: z.date().optional(),
    paidDate: z.date().optional(),
    paidBy: optionalObjectIdString,
    notes: z.string().optional(),
  }).optional(),

  // === RECONCILIATION ===
  reconciliation: z.object({
    isReconciled: z.boolean().optional(),
    reconciledAt: z.date().optional(),
    reconciledBy: optionalObjectIdString,
    bankStatementRef: z.string().optional(),
  }).optional(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});


