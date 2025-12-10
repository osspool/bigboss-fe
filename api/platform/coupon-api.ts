// @/api/platform/coupon-api.ts
import { BaseApi, type ApiResponse, type PaginatedResponse, type RequestOptions } from "../api-factory";
import { handleApiRequest } from "../api-handler";
import type {
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponValidationResult,
  ValidateCouponPayload,
} from "@/types/coupon.types";

type FetchOptions = Omit<RequestOptions, "token" | "organizationId">;

/**
 * Coupon API - CRUD + validate
 */
class CouponApi extends BaseApi<Coupon, CreateCouponPayload, UpdateCouponPayload> {
  constructor(config = {}) {
    super("coupons", config);
  }

  /**
   * Validate coupon by code with order amount
   * POST /coupons/validate/:code
   */
  async validateCoupon({
    code,
    data,
    options = {},
  }: {
    code: string;
    data: ValidateCouponPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<CouponValidationResult>> {
    return handleApiRequest("POST", `${this.baseUrl}/validate/${code}`, {
      cache: this.config.cache,
      body: data,
      ...options,
    });
  }
}

// Create and export a singleton instance
export const couponApi = new CouponApi();
export { CouponApi };
