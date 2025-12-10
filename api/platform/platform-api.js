// @/api/platform/platform-api.js
import { handleApiRequest } from "../api-handler";

/**
 * Platform Configuration API
 * Handles platform-level configuration including payment methods, delivery options, and policies
 */
class PlatformApi {
  constructor(config = {}) {
    this.baseUrl = "/api/v1/platform";
    this.config = {
      cache: "no-store",
      ...config,
    };
  }

  /**
   * Get platform configuration
   * GET /api/platform/config
   * Public endpoint - returns platform configuration
   * @param {string} [token] - Optional access token
   * @param {string} [select] - Optional field selection (e.g., "payment,deliveryOptions")
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Platform configuration
   */
  async getConfig(token = null, select = null, options = {}) {
    const queryParams = select ? `?select=${select}` : "";
    return handleApiRequest("GET", `${this.baseUrl}/config${queryParams}`, {
      cache: token ? "no-store" : "force-cache",
      revalidate: token ? undefined : 3600,
      tags: ["platform-config"],
      ...options,
      ...(token && { token }),
    });
  }

  /**
   * Update platform configuration
   * PATCH /api/platform/config
   * Admin only - partial update of platform config
   * @param {Object} data - Configuration data to update
   * @param {string} token - Admin access token (required)
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Updated platform configuration
   */
  async updateConfig(data, token, options = {}) {
    return handleApiRequest("PATCH", `${this.baseUrl}/config`, {
      token,
      body: data,
      tags: ["platform-config"],
      ...options,
    });
  }

}

// Create and export a singleton instance of the PlatformApi
export const platformApi = new PlatformApi();

// Legacy export for backwards compatibility
export const businessApi = platformApi;
