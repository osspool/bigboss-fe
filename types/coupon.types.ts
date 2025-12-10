/**
 * Coupon Types
 *
 * Type definitions for discount coupons and promotional codes.
 */

import type { DiscountType } from "./common.types";

// ==================== Coupon ====================

/**
 * Discount coupon/promo code
 */
export interface Coupon {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountAmount: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== Coupon Validation ====================

/**
 * Coupon validation result
 */
export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  error?: string;
  details?: {
    codeExists?: boolean;
    isActive?: boolean;
    notExpired?: boolean;
    meetsMinPurchase?: boolean;
    withinUsageLimit?: boolean;
  };
}

// ==================== Coupon API Payloads ====================

/**
 * Apply coupon request
 */
export interface ValidateCouponPayload {
  orderAmount: number;
}

/**
 * Create coupon request (admin)
 */
export interface CreateCouponPayload {
  code: string;
  discountType: DiscountType;
  discountAmount: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiresAt: string;
  usageLimit?: number;
  isActive?: boolean;
}

/**
 * Update coupon request (admin)
 */
export type UpdateCouponPayload = Partial<CreateCouponPayload>;

// ==================== Coupon API Responses ====================

/**
 * Coupon list response
 */
export interface CouponListResponse {
  success: boolean;
  data: Coupon[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

/**
 * Single coupon response
 */
export interface CouponResponse {
  success: boolean;
  data: Coupon;
}

/**
 * Coupon validation response
 */
export interface CouponValidationResponse {
  success: boolean;
  data: CouponValidationResult;
}

// ==================== Coupon Usage ====================

/**
 * Coupon usage record
 */
export interface CouponUsage {
  /** Usage record ID */
  _id: string;
  /** Coupon ID */
  couponId: string;
  /** Coupon code */
  couponCode: string;
  /** User who used it */
  userId: string;
  /** Order ID */
  orderId: string;
  /** Discount amount applied */
  discountAmount: number;
  /** Used timestamp */
  usedAt: string;
}
