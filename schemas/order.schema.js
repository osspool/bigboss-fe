import { z } from "zod";

/**
 * Order Schema
 * 
 * Per ORDER_API_GUIDE.md: Orders are created via checkout (POST /orders)
 * Admin can only UPDATE orders via PATCH /orders/:id
 * 
 * System-managed fields (read-only, DO NOT send):
 * - customer (denormalized snapshot from checkout)
 * - currentPayment (managed by payment workflows)
 * - items (set at checkout, immutable)
 * - subtotal, totalAmount (calculated)
 * - couponApplied (applied at checkout)
 * - shipping.history (managed by shipping workflows)
 * - createdAt, updatedAt (timestamps)
 * 
 * Editable fields:
 * - status (via PATCH /orders/:id/status preferred)
 * - notes (admin notes)
 * - deliveryAddress (can correct address)
 * - delivery.method, delivery.price
 * - shipping (provider, trackingNumber, etc. via shipping endpoints preferred)
 */

// ==================== Enums ====================

export const ORDER_STATUS_VALUES = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
export const PAYMENT_STATUS_VALUES = ['pending', 'verified', 'failed', 'refunded', 'partially_refunded', 'cancelled'];
export const PAYMENT_METHOD_VALUES = ['cash', 'bkash', 'nagad', 'rocket', 'bank_transfer'];
export const SHIPPING_PROVIDER_VALUES = ['redx', 'pathao', 'steadfast', 'paperfly', 'sundarban', 'sa_paribahan', 'dhl', 'fedex', 'other'];
export const SHIPPING_STATUS_VALUES = ['pending', 'requested', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed_attempt', 'returned', 'cancelled'];

// ==================== Sub-Schemas ====================

/**
 * Delivery address schema
 */
const deliveryAddressSchema = z.object({
  label: z.string().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  recipientPhone: z.string().min(10, "Phone must be at least 10 digits"),
  recipientName: z.string().optional(),
});

/**
 * Delivery method schema
 */
const deliverySchema = z.object({
  method: z.string().min(1, "Delivery method is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  estimatedDays: z.coerce.number().int().positive().optional(),
});

/**
 * Shipping schema (for admin updates)
 */
const shippingUpdateSchema = z.object({
  provider: z.enum(SHIPPING_PROVIDER_VALUES).optional(),
  status: z.enum(SHIPPING_STATUS_VALUES).optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional().or(z.literal("")),
  consignmentId: z.string().optional(),
  estimatedDelivery: z.string().optional(), // ISO date
});

// ==================== Order Update Schema ====================

/**
 * Order update schema
 * Used for PATCH /orders/:id
 * 
 * Only includes fields that can be updated by admin.
 * Status changes should prefer PATCH /orders/:id/status endpoint.
 * Shipping updates should prefer shipping endpoints.
 */
export const orderUpdateSchema = z.object({
  // Status (prefer using /status endpoint)
  status: z.enum(ORDER_STATUS_VALUES).optional(),
  
  // Delivery address (can correct if needed)
  deliveryAddress: deliveryAddressSchema.optional(),
  
  // Delivery method
  delivery: deliverySchema.optional(),
  
  // Shipping info (prefer using shipping endpoints)
  shipping: shippingUpdateSchema.optional(),
  
  // Admin notes
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

// ==================== View Schema ====================

/**
 * Order item schema (read-only, from checkout)
 *
 * Backend captures variant details at order time:
 * - variantSku: SKU for inventory tracking
 * - variantAttributes: Snapshot of attributes (e.g., { size: "M", color: "Red" })
 * - variantPriceModifier: Snapshot of price modifier at order time
 */
const orderItemSchema = z.object({
  product: z.string(),
  productName: z.string(),
  productSlug: z.string().optional(),
  /** SKU of the specific variant for inventory tracking */
  variantSku: z.string().optional(),
  /** Snapshot of variant attributes at order time (e.g., { size: "M", color: "Red" }) */
  variantAttributes: z.record(z.string(), z.string()).optional(),
  /** Snapshot of variant price modifier at order time */
  variantPriceModifier: z.number().optional(),
  /** Cost price snapshot at order time (admin-only field) */
  costPriceAtSale: z.number().optional(),
  quantity: z.number(),
  price: z.number(),
  /** VAT rate applied to this item (percentage) */
  vatRate: z.number().optional(),
  /** VAT amount for this line item */
  vatAmount: z.number().optional(),
});

/**
 * Current payment schema (read-only, system-managed)
 */
const currentPaymentSchema = z.object({
  transactionId: z.string().optional(),
  amount: z.number(),
  status: z.enum(PAYMENT_STATUS_VALUES),
  method: z.enum(PAYMENT_METHOD_VALUES),
  reference: z.string().optional(),
  verifiedAt: z.string().optional(),
  verifiedBy: z.string().optional(),
});

/**
 * Coupon applied schema (read-only, from checkout)
 */
const couponAppliedSchema = z.object({
  coupon: z.string(),
  code: z.string(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number(), // Original coupon value (10 for 10%, 50 for ৳50 fixed)
  discountAmount: z.number(), // Actual discount applied (e.g., 26.5)
});

/**
 * Cancellation request schema (read-only)
 */
const cancellationRequestSchema = z.object({
  requested: z.boolean(),
  reason: z.string().optional(),
  requestedAt: z.string().optional(),
  requestedBy: z.string().optional(),
});

/**
 * Shipping history entry
 */
const shippingHistorySchema = z.object({
  status: z.enum(SHIPPING_STATUS_VALUES),
  note: z.string().optional(),
  actor: z.string().optional(),
  timestamp: z.string(),
});

/**
 * Full shipping schema (for viewing)
 */
const shippingViewSchema = z.object({
  provider: z.enum(SHIPPING_PROVIDER_VALUES).optional(),
  status: z.enum(SHIPPING_STATUS_VALUES),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  labelUrl: z.string().optional(),
  consignmentId: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  requestedAt: z.string().optional(),
  pickedUpAt: z.string().optional(),
  deliveredAt: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  history: z.array(shippingHistorySchema).optional(),
});

/**
 * Order view schema (for displaying order data)
 * Includes all fields returned by backend
 */
export const orderViewSchema = z.object({
  _id: z.string(),
  customer: z.string(), // Customer ID reference

  // Customer snapshot (read-only, captured at checkout)
  customerName: z.string(), // Buyer's name at order time
  customerPhone: z.string().optional(), // Buyer's phone
  customerEmail: z.string().optional(), // Buyer's email
  userId: z.string().optional(), // Link to user account (if logged in)

  // Items (read-only, set at checkout)
  items: z.array(orderItemSchema),

  // Totals (read-only, calculated)
  subtotal: z.number(),
  discountAmount: z.number(),
  totalAmount: z.number(),

  // Delivery
  delivery: deliverySchema,
  deliveryAddress: deliveryAddressSchema,
  isGift: z.boolean().optional(), // True if ordering on behalf of someone else

  // Status
  status: z.enum(ORDER_STATUS_VALUES),

  // Payment (read-only, system-managed)
  currentPayment: currentPaymentSchema.optional(),

  // Coupon (read-only, from checkout)
  couponApplied: couponAppliedSchema.optional(),

  // Shipping
  shipping: shippingViewSchema.optional(),

  // Cancellation
  cancellationRequest: cancellationRequestSchema.optional(),
  cancellationReason: z.string().optional(),

  // Notes
  notes: z.string().optional(),

  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),

  // Virtuals
  canCancel: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
  paymentStatus: z.enum(PAYMENT_STATUS_VALUES).optional(),
  paymentMethod: z.enum(PAYMENT_METHOD_VALUES).optional(),
});

// ==================== Default Values ====================

/**
 * Default values for order update form
 */
export const defaultOrderUpdateValues = {
  status: undefined,
  deliveryAddress: {
    label: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    recipientPhone: "",
    recipientName: "",
  },
  delivery: {
    method: "",
    price: 0,
  },
  shipping: {
    provider: undefined,
    trackingNumber: "",
    trackingUrl: "",
    consignmentId: "",
    estimatedDelivery: "",
  },
  notes: "",
};

// ==================== Helper Functions ====================

/**
 * Normalize order data for form
 */
export function normalizeOrderForForm(order) {
  if (!order) return defaultOrderUpdateValues;

  return {
    status: order.status,
    deliveryAddress: {
      label: order.deliveryAddress?.label || "",
      addressLine1: order.deliveryAddress?.addressLine1 || "",
      addressLine2: order.deliveryAddress?.addressLine2 || "",
      city: order.deliveryAddress?.city || "",
      state: order.deliveryAddress?.state || "",
      postalCode: order.deliveryAddress?.postalCode || "",
      country: order.deliveryAddress?.country || "",
      recipientPhone: order.deliveryAddress?.recipientPhone || "",
      recipientName: order.deliveryAddress?.recipientName || "",
    },
    delivery: {
      method: order.delivery?.method || "",
      price: order.delivery?.price || 0,
      estimatedDays: order.delivery?.estimatedDays,
    },
    shipping: {
      provider: order.shipping?.provider,
      status: order.shipping?.status,
      trackingNumber: order.shipping?.trackingNumber || "",
      trackingUrl: order.shipping?.trackingUrl || "",
      consignmentId: order.shipping?.consignmentId || "",
      estimatedDelivery: order.shipping?.estimatedDelivery || "",
    },
    notes: order.notes || "",
  };
}
