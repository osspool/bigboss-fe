/**
 * Order Types
 *
 * Type definitions for order management matching the ORDER_API_GUIDE and backend schema.
 * These types are extracted from the backend order-api.ts for better organization.
 */

import type { PaymentMethod, PaymentStatus, PaymentGatewayType } from './common.types';
import type { CurrentPayment } from './payment.types';

// ==================== Enums ====================

export type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type ShippingProvider = 'redx' | 'pathao' | 'steadfast' | 'paperfly' | 'sundarban' | 'sa_paribahan' | 'dhl' | 'fedex' | 'other';
export type ShippingStatus = 'pending' | 'requested' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_attempt' | 'returned' | 'cancelled';
export type OrderSource = 'web' | 'pos' | 'api';

// Re-export payment types from common.types for convenience
export type { PaymentMethod, PaymentStatus } from './common.types';

// Re-export CurrentPayment from payment.types (used in Order.currentPayment)
export type { CurrentPayment } from './payment.types';

// ==================== Delivery Address ====================

/**
 * Order Delivery Address
 *
 * Full shipping details resolved by FE at checkout using @classytic/bd-areas.
 * FE gets Area from getArea(internalId) and maps to this structure.
 *
 * Supports gift orders where recipient differs from customer:
 * - recipientName: Name of person receiving the package
 * - recipientPhone: Phone of person receiving the package
 */
export interface DeliveryAddress {
  label?: string;
  /** Recipient name (can differ from customer for gift orders) */
  recipientName?: string;
  /** Recipient phone (can differ from customer for gift orders) */
  recipientPhone: string;
  addressLine1: string;
  addressLine2?: string;

  /** Area internalId from @classytic/bd-areas */
  areaId: number;
  /** Area name (e.g., "Mohammadpur") */
  areaName: string;
  /** Zone ID for pricing (from area.zoneId, 1-6) */
  zoneId: number;

  /** Provider-specific area IDs (from area.providers) */
  providerAreaIds?: {
    redx?: number;
    pathao?: number;
    steadfast?: number;
  };

  city: string;           // districtName
  division?: string;      // divisionName
  postalCode?: string;    // postCode
  country?: string;
  /** @deprecated Use recipientPhone instead */
  phone?: string;
}

// ==================== Delivery ====================

export interface Delivery {
  method: string;
  price: number;
  estimatedDays?: number;
}

// ==================== Parcel (Checkout Snapshot) ====================

export interface ParcelDimensionsCm {
  length: number;
  width: number;
  height: number;
}

export interface OrderParcel {
  /** Total order weight in grams (only set when all items have known weights) */
  weightGrams?: number;
  /**
   * Package dimensions in cm (only set when all items have known dimensions).
   * Current heuristic: max length/width, stacked height.
   */
  dimensionsCm?: ParcelDimensionsCm;
  /** Quantity count missing weight at checkout */
  missingWeightItems?: number;
  /** Quantity count missing dimensions at checkout */
  missingDimensionItems?: number;
}

// ==================== Payment Data ====================

/**
 * Payment data for order checkout
 *
 * Payment Flow:
 * 1. **Manual Gateway (default)** - Customer pays externally, provides reference
 *    - COD (cash): No reference needed, collected on delivery
 *    - Mobile wallets (bkash/nagad/rocket): Customer sends money, provides TrxID
 *    - Bank transfer: Customer transfers, provides reference number
 *
 * 2. **Automated Gateways (future)** - Redirects to payment provider
 *    - stripe: Card payments via Stripe Checkout
 *    - sslcommerz: Bangladesh payment gateway (cards, wallets, bank)
 *
 * @example COD (Cash on Delivery)
 * { type: 'cash' }
 *
 * @example bKash (Manual)
 * { type: 'bkash', reference: 'BGH3K5L90P', senderPhone: '01712345678' }
 *
 * @example Stripe (Automated - future)
 * { type: 'card', gateway: 'stripe' }
 */
export interface PaymentData {
  /** Payment method: cash, bkash, nagad, rocket, bank, card */
  type: PaymentMethod;
  /**
   * Payment gateway provider
   * - 'manual' (default): External payment, admin verifies manually
   * - 'stripe': Stripe Checkout (automated, future)
   * - 'sslcommerz': SSLCommerz gateway (automated, future)
   */
  gateway?: PaymentGatewayType;
  /** Transaction reference/TrxID (for manual verification) */
  reference?: string;
  /** Sender phone number (required for mobile wallets: bkash/nagad/rocket) */
  senderPhone?: string;
  /** Additional payment details for verification */
  paymentDetails?: {
    walletNumber?: string;
    walletType?: 'personal' | 'merchant';
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    proofUrl?: string;
  };
  /** Payment notes from customer */
  notes?: string;
}

// Re-export PaymentGatewayType for convenience
export type { PaymentGatewayType } from './common.types';

// ==================== Order Item ====================

export interface OrderItem {
  product: string;
  productName: string;
  productSlug?: string;
  variantSku?: string; // SKU of the specific variant for inventory tracking
  variations?: Array<{
    name: string;
    option: { value: string; priceModifier?: number };
  }>;
  quantity: number;
  price: number;
  /**
   * Cost price snapshot at order time (admin-only field)
   * Captured when order is created for accurate profit tracking.
   */
  costPriceAtSale?: number;
}

// ==================== Shipping ====================

export interface ShippingHistory {
  status: ShippingStatus;
  note?: string;
  actor?: string;
  timestamp: string;
}

export interface Shipping {
  provider?: ShippingProvider;
  status: ShippingStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  labelUrl?: string;
  consignmentId?: string;
  estimatedDelivery?: string;
  requestedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  metadata?: Record<string, unknown>;
  history: ShippingHistory[];
}

// ==================== Coupon ====================

export interface CouponApplied {
  coupon: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
}

// ==================== Cancellation ====================

export interface CancellationRequest {
  requested: boolean;
  reason?: string;
  requestedAt?: string;
  requestedBy?: string;
}

// ==================== Order ====================

export interface Order {
  _id: string;
  customer: string;
  customerName: string; // Snapshot: customer name at order time
  customerPhone?: string; // Snapshot: customer phone at order time
  customerEmail?: string; // Snapshot: customer email at order time
  userId?: string; // Link to user account (if customer is logged in)
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  delivery: Delivery;
  deliveryAddress: DeliveryAddress;
  parcel?: OrderParcel;
  isGift: boolean; // True if ordering on behalf of someone else
  status: OrderStatus;
  source?: OrderSource; // Order source: web, pos, or api

  // POS-specific fields
  branch?: string; // Branch/store ID
  terminalId?: string; // POS terminal identifier
  cashier?: string; // Staff member who processed (User ID)
  currentPayment?: CurrentPayment;
  couponApplied?: CouponApplied;
  shipping?: Shipping;
  cancellationRequest?: CancellationRequest;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  canCancel?: boolean;
  isCompleted?: boolean;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

// ==================== Request Payloads ====================

export interface CreateOrderPayload {
  deliveryAddress: DeliveryAddress;
  delivery: Delivery;
  /** Payment method shorthand (defaults to 'cash' if not provided) */
  paymentMethod?: PaymentMethod;
  /** Detailed payment data for verification (bKash TrxID, bank details, etc.) */
  paymentData?: PaymentData;
  isGift?: boolean; // True if ordering on behalf of someone else
  couponCode?: string;
  notes?: string;
}

export interface CancelOrderPayload {
  reason?: string;
  refund?: boolean;
}

export interface CancelRequestPayload {
  reason?: string;
}

export interface UpdateStatusPayload {
  status: OrderStatus;
  note?: string;
}

export interface FulfillOrderPayload {
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
}

export interface RefundOrderPayload {
  amount?: number; // In paisa, omit for full refund
  reason: string;
}

export interface RequestShippingPayload {
  provider: ShippingProvider;
  /**
   * If true, creates shipment via logistics provider API (RedX, Pathao)
   * If false (default), just records tracking info manually
   */
  useProviderApi?: boolean;
  /** Tracking number (for manual entry) */
  trackingNumber?: string;
  /** Consignment/parcel ID from provider */
  consignmentId?: string;
  /** Tracking URL */
  trackingUrl?: string;
  /** Shipping label URL */
  labelUrl?: string;
  /** Estimated delivery date */
  estimatedDelivery?: string;
  /** Parcel weight in grams (for API mode) */
  weight?: number;
  /** Special instructions (for API mode) */
  instructions?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateShippingPayload {
  status: ShippingStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  consignmentId?: string;
  estimatedDelivery?: string;
  note?: string;
  metadata?: Record<string, unknown>;
}

// ==================== API Response Types ====================
// Note: order-api.ts imports ApiResponse and PaginatedResponse from api-factory

// ==================== Delivery Options (for checkout UI) ====================

/**
 * Delivery option for checkout UI
 * Transformed from platform config delivery options
 */
export interface DeliveryOption {
  /** Unique delivery option identifier */
  id: string;
  /** Display name (e.g., "Standard Delivery", "Inside Dhaka") */
  label: string;
  /** Delivery cost/fee */
  price: number;
  /** Estimated delivery time (e.g., "3-5 days", "2 days") */
  days: string;
  /** Detailed description */
  description?: string;
  /** Whether this option is available */
  isActive?: boolean;
}

// ==================== Query Params ====================

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  sort?: string;
}
