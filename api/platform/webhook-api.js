// @/api/platform/webhook-api.js
import { handleApiRequest } from "../api-handler";

/**
 * Webhook API for payment processing
 * Handles manual payment verification and automated gateway webhooks
 */
class WebhookApi {
  constructor() {
    this.baseUrl = '/webhooks';
  }

  /**
   * Verify or reject payment manually (Admin/Superadmin)
   * POST /api/v1/webhooks/payments/manual
   *
   * This is the primary endpoint for manual payment verification
   * Used by admins to verify OR reject bKash, Nagad, bank transfers, etc.
   *
   * Backend expects webhook format:
   * {
   *   "event": "payment.verified" | "payment.failed",
   *   "data": {
   *     "transactionId": "...",
   *     "verifiedBy": "admin-user-id",
   *     "notes": "Optional notes"
   *   }
   * }
   *
   * @param {Object} params
   * @param {string} params.transactionId - Transaction ID to verify
   * @param {string} params.status - Optional: 'failed' to reject payment (default: verify)
   * @param {string} params.reason - Optional: Reason for rejection (only if status='failed')
   * @param {string} params.notes - Optional: Additional notes for verification
   * @param {string} params.verifiedBy - Optional: Admin user ID (usually auto-detected from token)
   * @param {string} params.token - Auth token (required)
   * @param {Object} params.options - Request options
   * @returns {Promise} Verification result
   */
  async verifyPaymentManually({ transactionId, status, reason, notes, verifiedBy, token, options = {} } = {}) {
    if (!transactionId) throw new Error('Transaction ID is required');
    if (!token) throw new Error('Authentication required');

    // Build webhook payload matching backend format
    const body = {
        transactionId,
    };

    // Add optional fields
    if (verifiedBy) {
      body.verifiedBy = verifiedBy;
    }

    // Add notes (use reason if provided for failed payments)
    if (notes || reason) {
      body.notes = notes || reason || (status === 'failed' ? 'Payment verification failed' : 'Payment verified manually');
    }

    const requestOptions = {
      cache: 'no-store',
      token,
      body,
      ...options,
    };

    return handleApiRequest(
      'POST',
      `${this.baseUrl}/payments/manual/verify`,
      requestOptions
    );
  }

}

// Create and export a singleton instance
export const webhookApi = new WebhookApi();

