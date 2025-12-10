import { z } from "zod";
import { coerceToIsoDateTimeString, objectIdStringSchema, optionalObjectIdString } from "@/lib/utils/zod-utils";
import {
  TRANSACTION_CATEGORY_VALUES,
  MANUAL_CATEGORY_VALUES,
  TRANSACTION_TYPE_VALUES,
  TRANSACTION_STATUS_VALUES,
  TRANSACTION_TARGET_MODEL_VALUES,
  PAYMENT_METHOD_VALUES,
  PAYMENT_GATEWAY_TYPE_VALUES,
  COMMISSION_STATUS_VALUES,
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
export const transactionCreateSchema = z.object({
  customerId: optionalObjectIdString,
  handledBy: optionalObjectIdString,

  // Category is required and must be from manual categories
  category: z.enum(MANUAL_CATEGORY_VALUES, {
    errorMap: () => ({ message: "Only manual operational categories can be created via frontend" })
  }),

  amount: z.number().min(0, "Amount must be non-negative"),
  method: z.enum(PAYMENT_METHOD_VALUES),

  // Optional status (defaults to 'pending' if not provided)
  status: z.enum(TRANSACTION_STATUS_VALUES).optional(),

  // Customer-provided payment reference (bKash trxId, bank reference, etc.)
  reference: z.string().optional(),

  // Additional payment details (wallet/bank info)
  paymentDetails: transactionPaymentDetails,

  notes: z.string().optional(),
  description: z.string().optional(),
  date: coerceToIsoDateTimeString.optional(),

  // Polymorphic reference (optional - for linking to specific entities)
  referenceId: optionalObjectIdString,
  referenceModel: z.enum(TRANSACTION_TARGET_MODEL_VALUES).optional(),
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
  status: z.enum(TRANSACTION_STATUS_VALUES).optional(),
  amount: z.number().min(0, "Amount must be non-negative").optional(),
  method: z.enum(PAYMENT_METHOD_VALUES).optional(),
  reference: z.string().optional(),
  paymentDetails: transactionPaymentDetails,
  notes: z.string().optional(),
  description: z.string().optional(),
  date: coerceToIsoDateTimeString.optional(),
});

/**
 * Transaction view schema (for displaying transaction data)
 * Includes all fields returned by backend
 */
export const transactionViewSchema = z.object({
  _id: z.string(),
  organizationId: objectIdStringSchema,
  customerId: optionalObjectIdString,
  handledBy: optionalObjectIdString,

  type: z.enum(TRANSACTION_TYPE_VALUES),
  category: z.enum(TRANSACTION_CATEGORY_VALUES).optional(),
  status: z.enum(TRANSACTION_STATUS_VALUES),
  amount: z.number().min(0),
  method: z.enum(PAYMENT_METHOD_VALUES),

  // Idempotency key (for safe retries)
  idempotencyKey: z.string().optional(),

  // Payment gateway integration (system-managed)
  gateway: z.object({
    type: z.enum(PAYMENT_GATEWAY_TYPE_VALUES).optional(),
    paymentIntentId: z.string().optional(),  // Stripe: pi_xxx, SSLCommerz: session_id
    sessionId: z.string().optional(),        // Checkout session ID
    paymentUrl: z.string().optional(),       // Customer redirect URL
    expiresAt: z.date().optional(),          // Payment intent expiry
    metadata: z.any().optional(),            // Gateway-specific data
  }).optional(),

  // Webhook handling (system-managed)
  webhook: z.object({
    eventId: z.string().optional(),      // For idempotency
    receivedAt: z.date().optional(),     // When webhook was received
    processedAt: z.date().optional(),    // When webhook was processed
    payload: z.any().optional(),         // Raw webhook payload
  }).optional(),

  // Customer-provided payment reference
  reference: z.string().optional(),

  // Payment details
  paymentDetails: transactionPaymentDetails,

  notes: z.string().optional(),
  date: z.date().optional(),

  // Verification tracking (system-managed)
  verifiedAt: z.date().optional(),
  verifiedBy: optionalObjectIdString,

  // Commission tracking (system-managed)
  commission: z.object({
    rate: z.number().optional(),           // Commission rate (0.05 = 5%, 0.10 = 10%)
    grossAmount: z.number().optional(),    // Gross commission amount
    gatewayFeeRate: z.number().optional(), // Gateway fee rate
    gatewayFeeAmount: z.number().optional(), // Gateway fee amount
    netAmount: z.number().optional(),      // Actual platform revenue
    status: z.enum(COMMISSION_STATUS_VALUES).optional(),
    dueDate: z.date().optional(),
    paidDate: z.date().optional(),
    paidBy: optionalObjectIdString,
    notes: z.string().optional(),
  }).optional(),

  // Polymorphic reference
  referenceId: optionalObjectIdString,
  referenceModel: z.enum(TRANSACTION_TARGET_MODEL_VALUES).optional(),

  // Additional metadata (system-managed)
  metadata: z.any().optional(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});


