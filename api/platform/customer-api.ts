// @/api/platform/customer-api.ts
import { BaseApi, type ApiResponse, type RequestOptions } from "../api-factory";
import { handleApiRequest } from "../api-handler";
import type { Customer, CustomerPayload, CustomerQueryParams } from "@/types/customer.types";

type FetchOptions = Omit<RequestOptions, "token" | "organizationId">;

/**
 * Customer API - CRUD + helper endpoint
 *
 * Standard CRUD (inherited from BaseApi):
 * - getAll({ token, params }) - list with filtering/search/pagination
 * - getById({ token, id }) - get by ID
 * - update({ token, id, data }) - update (admin/staff rules apply)
 * - delete({ token, id }) - delete (admin only)
 *
 * Notes:
 * - Customers may be auto-created by backend workflows; some environments may not expose create.
 *
 * Extra endpoint:
 * - getMe({ token }) - current user's customer profile
 */
class CustomerApi extends BaseApi<Customer, CustomerPayload, CustomerPayload> {
  constructor(config = {}) {
    super("customers", config);
  }

  /**
   * Get current user's customer profile
   * GET /customers/me
   */
  async getMe({
    token,
    options = {},
  }: {
    token: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Customer>> {
    if (!token) {
      throw new Error("Authentication required");
    }

    return handleApiRequest("GET", `${this.baseUrl}/me`, {
      token,
      cache: this.config.cache,
      ...options,
    });
  }
}

export const customerApi = new CustomerApi();
export { CustomerApi };
export type { CustomerQueryParams };

