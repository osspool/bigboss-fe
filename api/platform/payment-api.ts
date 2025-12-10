// @/api/platform/payment-api.ts
import { handleApiRequest } from "../api-handler";
import type { ApiResponse } from "../api-factory";

// ==================== Types ====================

export type PaymentStatus = "pending" | "verified" | "failed" | "refunded" | "partially_refunded" | "cancelled";

/**
 * Transaction reference info
 */
export interface TransactionEntity {
  referenceModel: "Order";
  referenceId: string;
}

/**
 * Verification result returned from backend
 */
export interface VerificationResult {
  transactionId: string;
  status: PaymentStatus;
  amount: number; // In paisa
  category: string;
  verifiedAt: string;
  verifiedBy: string;
  entity: TransactionEntity | null;
}

/**
 * Reject result returned from backend
 */
export interface RejectResult {
  transactionId: string;
  status: "failed";
  failedAt: string;
  failureReason: string;
}

// ==================== Request Payloads ====================

/**
 * Verify payment request payload
 */
export interface VerifyPaymentPayload {
  /** Transaction ID (MongoDB ObjectId) */
  transactionId: string;
  /** Optional verification notes */
  notes?: string;
}

/**
 * Reject payment request payload
 */
export interface RejectPaymentPayload {
  /** Transaction ID (MongoDB ObjectId) */
  transactionId: string;
  /** Reason for rejection */
  reason: string;
}

// ==================== Request Options ====================

interface FetchOptions {
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
}

// ==================== Payment API ====================

/**
 * Payment API for admin payment management
 *
 * Manual Payment Verification Flow:
 * 1. Customer places order → Transaction created with status 'pending'
 * 2. Customer pays via bKash/Nagad/bank transfer/cash
 * 3. Admin verifies payment via verifyPayment() endpoint
 * 4. Backend updates transaction to 'verified'
 * 5. Order status auto-updates to 'confirmed', payment status to 'verified'
 *
 * Endpoints:
 * - POST /webhooks/payments/manual/verify - Verify pending payment (superadmin)
 * - POST /webhooks/payments/manual/reject - Reject pending payment (superadmin)
 */
class PaymentApi {
  private baseUrl = "/webhooks/payments";

  /**
   * Verify a manual payment (Admin/Superadmin only)
   * POST /webhooks/payments/manual/verify
   *
   * Use this when admin confirms a customer's manual payment
   * (bKash, Nagad, bank transfer, cash, etc.)
   *
   * After verification:
   * - Transaction status → 'verified'
   * - Order payment status → 'verified'
   * - Order status → 'confirmed' (if was 'pending')
   *
   * @example
   * const result = await paymentApi.verifyPayment({
   *   token: adminToken,
   *   data: {
   *     transactionId: '507f1f77bcf86cd799439011',
   *     notes: 'Verified bKash payment TrxID: ABC123'
   *   }
   * });
   */
  async verifyPayment({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: VerifyPaymentPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<VerificationResult>> {
    if (!data.transactionId) {
      throw new Error("Transaction ID is required");
    }

    return handleApiRequest("POST", `${this.baseUrl}/manual/verify`, {
      token,
      body: {
        transactionId: data.transactionId,
        ...(data.notes && { notes: data.notes }),
      },
      cache: "no-store",
      ...options,
    });
  }

  /**
   * Reject a manual payment (Admin/Superadmin only)
   * POST /webhooks/payments/manual/reject
   *
   * Use this when admin rejects a customer's payment claim
   * (invalid reference, insufficient amount, fraud, etc.)
   *
   * After rejection:
   * - Transaction status → 'failed'
   * - Order payment status → 'failed'
   * - Reason recorded in transaction
   *
   * @example
   * const result = await paymentApi.rejectPayment({
   *   token: adminToken,
   *   data: {
   *     transactionId: '507f1f77bcf86cd799439011',
   *     reason: 'Invalid bKash TrxID - payment not found'
   *   }
   * });
   */
  async rejectPayment({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: RejectPaymentPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<RejectResult>> {
    if (!data.transactionId) {
      throw new Error("Transaction ID is required");
    }
    if (!data.reason) {
      throw new Error("Rejection reason is required");
    }

    return handleApiRequest("POST", `${this.baseUrl}/manual/reject`, {
      token,
      body: {
        transactionId: data.transactionId,
        reason: data.reason,
      },
      cache: "no-store",
      ...options,
    });
  }
}

// Create and export singleton instance
export const paymentApi = new PaymentApi();
export { PaymentApi };
