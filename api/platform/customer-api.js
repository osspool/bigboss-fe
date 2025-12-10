// @/api/platform/customer-api.js
import { BaseApi } from "../api-factory";
import { handleApiRequest } from "../api-handler";

/**
 * Customer API - uses base CRUD + helper aliases
 * GET /customers with query params (use base getAll)
 * GET /customers/:id (use base getById)
 * GET /customers/me (get current user's customer profile)
 * PATCH /customers/:id (use base update)
 * DELETE /customers/:id (use base delete - admin only)
 */
class CustomerApi extends BaseApi {
  constructor(config = {}) {
    super('customers', config);
  }

  /**
   * Get current user's customer profile
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Customer data
   */
  async getMe({ token }) {
    if (!token) {
      throw new Error("Authentication required");
    }

    return handleApiRequest("GET", `${this.baseUrl}/me`, { token });
  }

  // Use getAll() with params for filtering:
  // - getAll({ token, params: { name: '...', phone: '...', email: '...', populate: 'userId' }})
}

// Create and export a singleton instance of the CustomerApi
export const customerApi = new CustomerApi();
