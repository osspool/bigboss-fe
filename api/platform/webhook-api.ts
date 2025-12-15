// @/api/platform/webhook-api.ts
import { handleApiRequest } from "../api-handler";
import type { ApiResponse } from "../api-factory";
import type {
  ManualVerifyPayload,
  ManualRejectPayload,
  ManualVerifyResponse,
  ManualRejectResponse,
  ManualVerifyResponseData,
  ManualRejectResponseData,
} from "@/types/webhook.types";

// ==================== Request Options ====================

type FetchOptions = Omit<RequestInit, 'body' | 'method'>;

// ==================== Webhook API ====================

/**
 * Payment Webhook API
 *
 * Handles manual payment verification/rejection for superadmins.
 *
 * Routes:
 * - POST /webhooks/payments/manual/verify - Verify manual payment (superadmin)
 * - POST /webhooks/payments/manual/reject - Reject manual payment (superadmin)
 *
 * Note: Provider webhooks (POST /webhooks/payments/:provider) are called
 * directly by payment providers (Stripe, SSLCommerz, etc.) and don't need
 * a frontend client method.
 */
class WebhookApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "/webhooks/payments";
  }

  // ==================== Manual Verification ====================

  /**
   * Verify a manual payment (superadmin only)
   * POST /webhooks/payments/manual/verify
   *
   * Flow:
   * 1. Customer places order with manual payment (cash, bKash, Nagad, bank)
   * 2. Customer pays and provides transaction reference
   * 3. Admin verifies payment via this endpoint
   * 4. Transaction status → 'verified'
   * 5. Order payment status → 'verified', order status → 'confirmed'
   *
   * @param params.transactionId - Transaction ID to verify
   * @param params.notes - Optional verification notes
   * @param params.token - Auth token (superadmin required)
   * @param params.options - Additional fetch options
   * @returns Verification result with transaction details
   *
   * @example
   * ```typescript
   * const result = await webhookApi.verifyPayment({
   *   token: adminToken,
   *   transactionId: '507f1f77bcf86cd799439011',
   *   notes: 'Verified bKash TrxID via app',
   * });
   * ```
   */
  async verifyPayment({
    token,
    transactionId,
    notes,
    options = {},
  }: {
    token: string;
    transactionId: string;
    notes?: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<ManualVerifyResponseData>> {
    if (!transactionId) throw new Error("Transaction ID is required");
    if (!token) throw new Error("Authentication required");

    const body: ManualVerifyPayload = { transactionId };
    if (notes) body.notes = notes;

    return handleApiRequest("POST", `${this.baseUrl}/manual/verify`, {
      token,
      body,
      cache: "no-store",
      ...options,
    });
  }

  /**
   * Reject a manual payment (superadmin only)
   * POST /webhooks/payments/manual/reject
   *
   * Flow:
   * 1. Customer claims to have paid but admin finds issue
   * 2. Admin rejects payment with reason via this endpoint
   * 3. Transaction status → 'failed', failureReason recorded
   * 4. Order payment status → 'failed'
   *
   * Common rejection reasons:
   * - Invalid transaction reference
   * - Amount mismatch
   * - Duplicate claim
   * - Suspected fraud
   * - Payment not received
   *
   * @param params.transactionId - Transaction ID to reject
   * @param params.reason - Rejection reason (required)
   * @param params.token - Auth token (superadmin required)
   * @param params.options - Additional fetch options
   * @returns Rejection result with failure details
   *
   * @example
   * ```typescript
   * const result = await webhookApi.rejectPayment({
   *   token: adminToken,
   *   transactionId: '507f1f77bcf86cd799439011',
   *   reason: 'Invalid bKash TrxID - no matching transaction found',
   * });
   * ```
   */
  async rejectPayment({
    token,
    transactionId,
    reason,
    options = {},
  }: {
    token: string;
    transactionId: string;
    reason: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<ManualRejectResponseData>> {
    if (!transactionId) throw new Error("Transaction ID is required");
    if (!reason) throw new Error("Rejection reason is required");
    if (!token) throw new Error("Authentication required");

    const body: ManualRejectPayload = { transactionId, reason };

    return handleApiRequest("POST", `${this.baseUrl}/manual/reject`, {
      token,
      body,
      cache: "no-store",
      ...options,
    });
  }

  // ==================== Convenience Methods ====================

  /**
   * Alias for verifyPayment - more explicit naming
   * @deprecated Use verifyPayment instead
   */
  async verifyManualPayment(
    params: Parameters<typeof this.verifyPayment>[0]
  ): Promise<ApiResponse<ManualVerifyResponseData>> {
    return this.verifyPayment(params);
  }

  /**
   * Alias for rejectPayment - more explicit naming
   * @deprecated Use rejectPayment instead
   */
  async rejectManualPayment(
    params: Parameters<typeof this.rejectPayment>[0]
  ): Promise<ApiResponse<ManualRejectResponseData>> {
    return this.rejectPayment(params);
  }
}

// Create and export singleton instance
export const webhookApi = new WebhookApi();

// Export class for custom configurations
export { WebhookApi };

// Re-export types for convenience
export type {
  ManualVerifyPayload,
  ManualRejectPayload,
  ManualVerifyResponse,
  ManualRejectResponse,
  ManualVerifyResponseData,
  ManualRejectResponseData,
} from "@/types/webhook.types";
