// @/api/platform/platform-api.ts
import { handleApiRequest } from "../api-handler";
import type { ApiResponse } from "../api-factory";
import type {
  PlatformConfig,
  UpdatePlatformConfigPayload,
} from "@/types/platform.types";

/**
 * Platform Configuration API
 *
 * Singleton platform configuration - stores all platform-wide settings.
 *
 * Endpoints:
 * - GET  /api/v1/platform/config - Get platform config (supports field selection)
 * - PATCH /api/v1/platform/config - Update platform config (admin only)
 *
 * Field Selection:
 * - ?select=paymentMethods
 * - ?select=checkout,vat
 * - ?select=policies
 */
class PlatformApi {
  readonly baseUrl = "/api/v1/platform";

  /**
   * Get platform configuration
   *
   * @param options.token - Optional access token (public without, authenticated with)
   * @param options.select - Optional field selection (e.g., "paymentMethods", "checkout,vat")
   * @returns Platform configuration (full or selected fields)
   *
   * @example
   * // Full config (public)
   * const config = await platformApi.getConfig({});
   *
   * // Selected fields (public)
   * const config = await platformApi.getConfig({ select: "paymentMethods" });
   *
   * // Authenticated (admin sees more fields)
   * const config = await platformApi.getConfig({ token, select: "checkout,vat" });
   */
  async getConfig({
    token,
    select,
  }: {
    token?: string | null;
    select?: string | null;
  } = {}): Promise<ApiResponse<PlatformConfig>> {
    const queryParams = select ? `?select=${select}` : "";

    return handleApiRequest("GET", `${this.baseUrl}/config${queryParams}`, {
      token: token ?? undefined,
      cache: token ? "no-store" : "force-cache",
      revalidate: token ? undefined : 3600, // 1 hour for public
      tags: ["platform-config"],
    });
  }

  /**
   * Update platform configuration
   *
   * @param options.token - Admin access token (required)
   * @param options.data - Configuration data to update (partial update)
   * @returns Updated platform configuration
   *
   * @example
   * // Update payment methods
   * await platformApi.updateConfig({
   *   token,
   *   data: {
   *     paymentMethods: [
   *       { type: 'cash', name: 'Cash on Delivery', isActive: true },
   *       { type: 'mfs', provider: 'bkash', name: 'bKash', walletNumber: '01712345678' },
   *     ]
   *   }
   * });
   *
   * // Update checkout settings
   * await platformApi.updateConfig({
   *   token,
   *   data: {
   *     checkout: {
   *       freeDeliveryThreshold: 2000,
   *       deliveryZones: [
   *         { name: 'Dhaka', region: 'dhaka', price: 60, estimatedDays: 2, isActive: true }
   *       ]
   *     }
   *   }
   * });
   */
  async updateConfig({
    token,
    data,
  }: {
    token: string;
    data: UpdatePlatformConfigPayload;
  }): Promise<ApiResponse<PlatformConfig>> {
    if (!token) {
      throw new Error("Authentication required to update platform config");
    }

    return handleApiRequest("PATCH", `${this.baseUrl}/config`, {
      token,
      body: data,
      tags: ["platform-config"],
    });
  }

  /**
   * Get payment methods only
   * Convenience method for checkout/POS
   *
   * @param options.token - Optional access token
   * @returns Platform config with only paymentMethods field
   */
  async getPaymentMethods({
    token,
  }: {
    token?: string | null;
  } = {}): Promise<ApiResponse<Pick<PlatformConfig, "paymentMethods">>> {
    return this.getConfig({ token, select: "paymentMethods" });
  }

  /**
   * Get checkout settings only
   * Convenience method for checkout flow
   *
   * @param options.token - Optional access token
   * @returns Platform config with only checkout field
   */
  async getCheckoutSettings({
    token,
  }: {
    token?: string | null;
  } = {}): Promise<ApiResponse<Pick<PlatformConfig, "checkout">>> {
    return this.getConfig({ token, select: "checkout" });
  }

  /**
   * Get delivery zones
   * Convenience method for delivery selection
   *
   * @param options.token - Optional access token
   * @returns Platform config with checkout.deliveryZones
   */
  async getDeliveryZones({
    token,
  }: {
    token?: string | null;
  } = {}): Promise<ApiResponse<Pick<PlatformConfig, "checkout">>> {
    return this.getConfig({ token, select: "checkout" });
  }

  /**
   * Get VAT configuration
   * Convenience method for invoice/tax calculations
   *
   * @param options.token - Optional access token
   * @returns Platform config with only vat field
   */
  async getVatConfig({
    token,
  }: {
    token?: string | null;
  } = {}): Promise<ApiResponse<Pick<PlatformConfig, "vat">>> {
    return this.getConfig({ token, select: "vat" });
  }
}

// Create and export singleton instance
export const platformApi = new PlatformApi();

// Legacy export for backwards compatibility
export const businessApi = platformApi;
