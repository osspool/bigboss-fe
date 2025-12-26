import { z } from 'zod';

/**
 * Platform Config Schema
 * Matches backend API from docs/api/platform.md
 */

// ==================== Payment Method Config ====================

const paymentMethodSchema = z.object({
  _id: z.string().optional(),
  type: z.enum(['cash', 'mfs', 'bank_transfer', 'card']),
  name: z.string().min(1, 'Payment method name is required'),

  // MFS fields (bkash, nagad, rocket, upay)
  provider: z.enum(['bkash', 'nagad', 'rocket', 'upay']).optional(),
  walletNumber: z.string().optional().or(z.literal("")),
  walletName: z.string().optional().or(z.literal("")),

  // Bank transfer fields
  bankName: z.string().optional().or(z.literal("")),
  accountNumber: z.string().optional().or(z.literal("")),
  accountName: z.string().optional().or(z.literal("")),
  branchName: z.string().optional().or(z.literal("")),
  routingNumber: z.string().optional().or(z.literal("")),

  // Card payment fields
  cardTypes: z.array(z.enum(['visa', 'mastercard', 'amex', 'unionpay', 'other'])).optional(),

  // Common fields
  note: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

// ==================== Checkout Settings ====================

const pickupBranchSchema = z.object({
  branchId: z.string().optional().or(z.literal("")),
  branchCode: z.string().optional().or(z.literal("")),
  branchName: z.string().optional().or(z.literal("")),
});

/**
 * Checkout settings per docs/api/platform.md
 * Note: Delivery zones are handled by logistics/courier provider, not stored here
 */
// Helper to handle empty/NaN as 0 for threshold numbers
const thresholdNumber = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    if (typeof val === "number" && Number.isNaN(val)) return 0;
    return val;
  },
  z.coerce.number().min(0).default(0)
);

const checkoutSettingsSchema = z.object({
  allowStorePickup: z.boolean().default(false),
  pickupBranches: z.array(pickupBranchSchema).optional().default([]),
  deliveryFeeSource: z.enum(['provider']).optional().default('provider'),
  freeDeliveryThreshold: thresholdNumber,
});

// ==================== Logistics Settings ====================

// Helper to handle empty/NaN as undefined for optional numbers
const optionalNumber = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    if (typeof val === "number" && Number.isNaN(val)) return undefined;
    return val;
  },
  z.coerce.number().optional()
);

const logisticsSettingsSchema = z.object({
  defaultPickupStoreId: optionalNumber,
  defaultPickupStoreName: z.string().optional().or(z.literal("")),
  defaultPickupAreaId: optionalNumber,
  defaultPickupAreaName: z.string().optional().or(z.literal("")),
  webhookSecret: z.string().optional().or(z.literal("")),
  autoCreateShipment: z.boolean().default(false),
  autoCreateOnStatus: z.string().optional().or(z.literal("")).default('confirmed'),
});

// ==================== VAT Configuration ====================

// Helper to handle empty/NaN as 0 for VAT rate
const vatRateNumber = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    if (typeof val === "number" && Number.isNaN(val)) return 0;
    return val;
  },
  z.coerce.number().min(0).max(100).default(0)
);

const vatConfigSchema = z.object({
  isRegistered: z.boolean().default(false),
  bin: z.string().optional().or(z.literal("")),
  registeredName: z.string().optional().or(z.literal("")),
  vatCircle: z.string().optional().or(z.literal("")),
  defaultRate: vatRateNumber,
  pricesIncludeVat: z.boolean().default(true),
  invoice: z.object({
    prefix: z.string().optional().or(z.literal("")),
    showVatBreakdown: z.boolean().default(true),
  }).optional(),
  supplementaryDuty: z.object({
    enabled: z.boolean().default(false),
    defaultRate: vatRateNumber,
  }).optional(),
});

// ==================== Policies ====================

const policiesSchema = z.object({
  termsAndConditions: z.string().optional().or(z.literal("")),
  privacyPolicy: z.string().optional().or(z.literal("")),
  refundPolicy: z.string().optional().or(z.literal("")),
  shippingPolicy: z.string().optional().or(z.literal("")),
});

// ==================== Membership ====================

const membershipTierSchema = z.object({
  name: z.string().min(1, "Tier name is required"),
  minPoints: z.coerce.number().min(0).default(0),
  pointsMultiplier: z.coerce.number().min(0).default(1),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  color: z.string().optional().or(z.literal("")),
});

const membershipRedemptionSchema = z.object({
  enabled: z.boolean().default(false),
  minRedeemPoints: z.coerce.number().min(0).default(0),
  minOrderAmount: z.coerce.number().min(0).default(0),
  maxRedeemPercent: z.coerce.number().min(0).max(100).default(50),
  pointsPerBdt: z.coerce.number().min(1).default(10),
});

const membershipSchema = z.object({
  enabled: z.boolean().default(false),
  pointsPerAmount: z.coerce.number().min(0).default(1),
  amountPerPoint: z.coerce.number().min(1).default(100),
  roundingMode: z.enum(["floor", "round", "ceil"]).default("floor"),
  tiers: z.array(membershipTierSchema).default([]),
  cardPrefix: z.string().min(1).default("MBR"),
  cardDigits: z.coerce.number().min(4).max(12).default(8),
  redemption: membershipRedemptionSchema.optional(),
});

// ==================== Main Platform Config Schema ====================

export const platformConfigSchema = z.object({
  platformName: z.string().optional().or(z.literal("")),
  paymentMethods: z.array(paymentMethodSchema).optional(),
  checkout: checkoutSettingsSchema.partial().optional(),
  logistics: logisticsSettingsSchema.partial().optional(),
  vat: vatConfigSchema.partial().optional(),
  membership: membershipSchema.partial().optional(),
  policies: policiesSchema.optional(),
});

export default platformConfigSchema;
