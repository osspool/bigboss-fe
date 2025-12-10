import { z } from "zod";

/**
 * Discount type enum values
 */
export const DISCOUNT_TYPE_VALUES = ['percentage', 'fixed'];

/**
 * Coupon create schema
 * Per API guide: Admin can create coupons with validation rules
 *
 * Required fields:
 * - code (unique, uppercase)
 * - discountType ('percentage' | 'fixed')
 * - discountAmount (positive number)
 * - expiresAt (date)
 *
 * Optional fields:
 * - minOrderAmount (default 0)
 * - maxDiscountAmount (cap for percentage discounts)
 * - usageLimit (default 100)
 * - isActive (default true)
 *
 * System-managed (DO NOT send):
 * - usedCount (auto-incremented by backend)
 * - createdAt, updatedAt (timestamps)
 */
export const couponCreateSchema = z.object({
  code: z.string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be less than 20 characters")
    .transform(val => val.toUpperCase().trim()),

  discountType: z.enum(DISCOUNT_TYPE_VALUES, {
    errorMap: () => ({ message: "Discount type must be 'percentage' or 'fixed'" })
  }),

  discountAmount: z.coerce.number({
    required_error: "Discount amount is required",
    invalid_type_error: "Discount amount must be a number"
  })
    .positive("Discount amount must be positive")
    .refine((val) => val > 0, "Discount amount must be greater than 0"),

  minOrderAmount: z.union([
    z.coerce.number().min(0, "Minimum order amount cannot be negative"),
    z.literal("").transform(() => 0)
  ])
    .optional()
    .default(0),

  maxDiscountAmount: z.union([
    z.coerce.number().positive("Maximum discount amount must be positive"),
    z.literal("").transform(() => undefined)
  ])
    .optional(),

  expiresAt: z.union([
    z.date().transform(date => date.toISOString()),
    z.string().min(1, "Expiration date is required")
  ], {
    required_error: "Expiration date is required"
  }),

  usageLimit: z.union([
    z.coerce.number().int("Usage limit must be a whole number").positive("Usage limit must be positive"),
    z.literal("").transform(() => 100)
  ])
    .optional()
    .default(100),

  isActive: z.boolean()
    .optional()
    .default(true),
}).refine((data) => {
  // If discount type is percentage, amount should be <= 100
  if (data.discountType === 'percentage' && data.discountAmount > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountAmount"],
});

/**
 * Coupon update schema
 * Per API guide: All coupon fields can be updated EXCEPT system-managed fields
 *
 * Allowed fields:
 * - code, discountType, discountAmount, minOrderAmount, maxDiscountAmount,
 *   expiresAt, usageLimit, isActive
 *
 * DO NOT send:
 * - usedCount (system-managed)
 * - createdAt, updatedAt (system-managed)
 */
export const couponUpdateSchema = z.object({
  code: z.string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be less than 20 characters")
    .transform(val => val.toUpperCase().trim())
    .optional(),

  discountType: z.enum(DISCOUNT_TYPE_VALUES, {
    errorMap: () => ({ message: "Discount type must be 'percentage' or 'fixed'" })
  }).optional(),

  discountAmount: z.union([
    z.coerce.number({
      invalid_type_error: "Discount amount must be a number"
    }).positive("Discount amount must be positive"),
    z.literal("").transform(() => undefined)
  ])
    .optional(),

  minOrderAmount: z.union([
    z.coerce.number().min(0, "Minimum order amount cannot be negative"),
    z.literal("").transform(() => undefined)
  ])
    .optional(),

  maxDiscountAmount: z.union([
    z.coerce.number().positive("Maximum discount amount must be positive"),
    z.literal("").transform(() => undefined)
  ])
    .optional(),

  expiresAt: z.union([
    z.date().transform(date => date.toISOString()),
    z.string().min(1, "Expiration date is required"),
    z.literal("").transform(() => undefined)
  ])
    .optional(),

  usageLimit: z.union([
    z.coerce.number().int("Usage limit must be a whole number").positive("Usage limit must be positive"),
    z.literal("").transform(() => undefined)
  ])
    .optional(),

  isActive: z.boolean()
    .optional(),
}).refine((data) => {
  // If discount type is percentage, amount should be <= 100
  if (data.discountType === 'percentage' && data.discountAmount && data.discountAmount > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountAmount"],
});

/**
 * Coupon view schema (for displaying coupon data)
 * Includes all fields returned by backend
 */
export const couponViewSchema = z.object({
  _id: z.string(),
  code: z.string(),
  discountType: z.enum(DISCOUNT_TYPE_VALUES),
  discountAmount: z.number(),
  minOrderAmount: z.number().optional().default(0),
  maxDiscountAmount: z.number().optional(),
  expiresAt: z.string(),
  usageLimit: z.number().optional().default(100),
  usedCount: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});
