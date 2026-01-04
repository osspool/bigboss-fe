/**
 * Webhook Types
 *
 * Type definitions for payment webhook API endpoints.
 * Matches backend routes/webhooks/payment-webhook.plugin.js
 */

import type { TransactionStatus, TransactionCategory } from './index';

// ==================== Payment Gateway Types ====================

/**
 * Supported payment gateway providers
 * - manual: Built-in manual verification (cash, bank transfer, mobile money)
 * - stripe: Stripe payment gateway
 * - sslcommerz: SSLCommerz (Bangladesh)
 * - bkash: bKash API integration
 * - nagad: Nagad API integration
 */
export type PaymentGatewayProvider =
  | 'manual'
  | 'stripe'
  | 'sslcommerz'
  | 'bkash'
  | 'nagad';

// ==================== Manual Verification Types ====================

/**
 * Request payload for manual payment verification
 * POST /webhooks/payments/manual/verify
 *
 * Used by superadmin to verify manual payments (cash, bank transfer, bKash, Nagad)
 */
export interface ManualVerifyPayload {
  /** Transaction ID to verify (MongoDB ObjectId as string) */
  transactionId: string;
  /** Optional verification notes */
  notes?: string;
}

/**
 * Request payload for manual payment rejection
 * POST /webhooks/payments/manual/reject
 *
 * Used by superadmin to reject invalid payments (fraud, invalid reference, etc.)
 */
export interface ManualRejectPayload {
  /** Transaction ID to reject (MongoDB ObjectId as string) */
  transactionId: string;
  /** Reason for rejection (required) */
  reason: string;
}

// ==================== Entity Reference ====================

/**
 * Entity reference information from transaction
 */
export interface TransactionEntityRef {
  /** Reference model type (Order, Commission, etc.) */
  referenceModel: string;
  /** Reference document ID */
  referenceId: string;
}

// ==================== Response Types ====================

/**
 * Successful verification response data
 */
export interface ManualVerifyResponseData {
  /** Transaction ID */
  transactionId: string;
  /** New transaction status */
  status: TransactionStatus;
  /** Transaction amount (in smallest currency unit) */
  amount: number;
  /** Transaction category */
  category: TransactionCategory | string;
  /** Verification timestamp (ISO 8601) */
  verifiedAt: string;
  /** User ID who verified */
  verifiedBy: string;
  /** Linked entity (Order, etc.) if exists */
  entity: TransactionEntityRef | null;
}

/**
 * Successful rejection response data
 */
export interface ManualRejectResponseData {
  /** Transaction ID */
  transactionId: string;
  /** Transaction status (always 'failed') */
  status: 'failed';
  /** Failure timestamp (ISO 8601) */
  failedAt: string;
  /** Rejection reason */
  failureReason: string;
}

/**
 * Provider webhook response data
 */
export interface ProviderWebhookResponseData {
  /** Webhook event type from provider */
  event: string;
  /** Provider's event ID */
  eventId: string;
  /** Transaction ID (if found) */
  transactionId?: string;
  /** Processing status */
  status: 'processed' | 'already_processed';
  /** Provider name */
  provider: PaymentGatewayProvider;
}

// ==================== Error Types ====================

/**
 * Webhook error names for error handling
 */
export type WebhookErrorName =
  | 'TransactionNotFoundError'
  | 'AlreadyVerifiedError'
  | 'AlreadyRejectedError'
  | 'PaymentVerificationError'
  | 'PaymentRejectionError'
  | 'ProviderNotFoundError'
  | 'ValidationError'
  | 'ProviderError';

/**
 * Webhook error response
 */
export interface WebhookErrorResponse {
  success: false;
  message: string;
  error: WebhookErrorName | string;
}

// ==================== API Response Wrappers ====================

/**
 * Manual verification API response
 */
export interface ManualVerifyResponse {
  success: true;
  message: string;
  data: ManualVerifyResponseData;
}

/**
 * Manual rejection API response
 */
export interface ManualRejectResponse {
  success: true;
  message: string;
  data: ManualRejectResponseData;
}

/**
 * Provider webhook API response
 */
export interface ProviderWebhookResponse {
  success: true;
  message: string;
  data: ProviderWebhookResponseData;
}

// ==================== Provider Webhook Types ====================

/**
 * Stripe webhook event types (common ones)
 */
export type StripeWebhookEventType =
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'checkout.session.completed'
  | 'checkout.session.expired'
  | 'charge.refunded'
  | 'charge.dispute.created';

/**
 * SSLCommerz IPN status values
 */
export type SSLCommerzStatus =
  | 'VALID'
  | 'FAILED'
  | 'CANCELLED'
  | 'UNATTEMPTED'
  | 'EXPIRED';

/**
 * Generic provider webhook payload
 * Each provider has different formats - this is the common interface
 */
export interface ProviderWebhookPayload {
  /** Provider-specific event/transaction ID */
  id?: string;
  /** Event type (provider-specific naming) */
  type?: string;
  /** Status (provider-specific) */
  status?: string;
  /** Nested data object (common in Stripe) */
  data?: {
    object?: {
      id?: string;
      payment_intent?: string;
      metadata?: Record<string, string>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  /** SSLCommerz specific fields */
  tran_id?: string;
  val_id?: string;
  /** Allow additional provider-specific fields */
  [key: string]: unknown;
}
