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

  /**
   * Membership actions
   * POST /customers/:id/membership
   */
  async membershipAction({
    token,
    id,
    data,
  }: {
    token: string;
    id: string;
    data: {
      action: "enroll" | "deactivate" | "reactivate" | "adjust";
      points?: number;
      reason?: string;
      type?: "bonus" | "correction" | "manual_redemption" | "redemption" | "expiry";
    };
  }): Promise<ApiResponse<Customer>> {
    if (!token) {
      throw new Error("Authentication required");
    }

    return handleApiRequest("POST", `${this.baseUrl}/${id}/membership`, {
      token,
      body: data,
      cache: this.config.cache,
    });
  }
}

export const customerApi = new CustomerApi();
export { CustomerApi };
export type { CustomerQueryParams };
