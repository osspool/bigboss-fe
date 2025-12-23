/**
 * Order Types
 *
 * Source of truth: modules/commerce/order/order.model.js
 */

import type { ShippingStatus, ShippingProvider } from './common.types';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
}

/**
 * Order Item
 */
export interface OrderItem {
  _id?: string;
  product: string; // Product ID
  productName: string;
  productSlug?: string;
  
  // Variant Snapshot
  variantSku?: string;
  variantAttributes?: Record<string, string>;
  variantPriceModifier?: number;
  
  quantity: number;
  price: number;
  
  /**
   * System field: Cost of Goods Sold at time of sale
   * Used for profit calculation. Read-only.
   */
  costPriceAtSale?: number;
  
  vatRate?: number;
  vatAmount?: number;
  
  // Virtuals
  lineTotal?: number;
  lineTotalExVat?: number;
  profit?: number | null;
  profitMargin?: number | null;
}

export interface OrderDelivery {
  method: string;
  price: number;
  estimatedDays?: number;
}

/**
 * Order Delivery Address
 * Note: For CreateOrderPayload, specific fields are required (see CreateOrderPayload.deliveryAddress)
 */
export interface OrderAddress {
  /** Address label (e.g., "Home", "Office") - optional */
  label?: string;

  /** Recipient name for delivery label */
  recipientName?: string;

  /** Contact phone for delivery (format: 01XXXXXXXXX) */
  recipientPhone?: string;

  /** Street address (required for checkout) */
  addressLine1?: string;

  /** Additional address details (apartment, floor, etc.) */
  addressLine2?: string;

  /** Area ID from @classytic/bd-areas constants */
  areaId?: number;

  /** Area display name (e.g., "Mohammadpur", "Dhanmondi") */
  areaName?: string;

  /** Zone ID for delivery pricing (1-6) */
  zoneId?: number;

  /** Provider-specific area IDs for logistics integration */
  providerAreaIds?: {
    redx?: number;
    pathao?: number;
    steadfast?: number;
  };

  /** City/District name */
  city?: string;

  /** Division/State */
  division?: string;

  /** Postal code */
  postalCode?: string;

  /** Country (defaults to "Bangladesh") */
  country?: string;
}

export interface OrderVat {
  applicable: boolean;
  rate: number;
  amount: number;
  pricesIncludeVat: boolean;
  taxableAmount: number;
  sellerBin?: string;
  invoiceNumber?: string;
  invoiceIssuedAt?: string;
  invoiceBranch?: string;
  invoiceDateKey?: string;
}

export interface OrderPayment {
  transactionId?: string;
  /** Amount in paisa (smallest unit). Divide by 100 for BDT display. */
  amount: number;
  status: PaymentStatus | string;
  method: string;
  reference?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface OrderShippingHistory {
  status: ShippingStatus | string;
  note?: string;
  actor?: string;
  timestamp: string;
}

export interface OrderShipping {
  provider?: ShippingProvider | string;
  status?: ShippingStatus | string;
  trackingNumber?: string;
  trackingUrl?: string;
  consignmentId?: string;
  labelUrl?: string;
  estimatedDelivery?: string;
  requestedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  metadata?: Record<string, unknown>;
  history?: OrderShippingHistory[];
}

/**
 * Parcel metrics for delivery estimation
 */
export interface OrderParcel {
  /** Total weight in grams */
  weightGrams: number;
  /** Package dimensions in centimeters */
  dimensionsCm?: {
    length: number;
    width: number;
    height: number;
  };
  /** Number of items without weight data */
  missingWeightItems: number;
  /** Number of items without dimension data */
  missingDimensionItems: number;
}

/**
 * Cancellation request details
 */
export interface CancellationRequest {
  requested: boolean;
  reason?: string;
  requestedAt?: string;
  requestedBy?: string;
}

/**
 * Main Order Interface
 * @see docs/api/commerce/order.md
 */
export interface Order {
  _id: string;
  /** Virtual: last 8 chars of _id (uppercase) */
  orderNumber?: string;

  customer?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  userId?: string;

  items: OrderItem[];

  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;

  vat?: OrderVat;

  delivery?: OrderDelivery;
  deliveryAddress?: OrderAddress;
  /** True if ordering on behalf of someone else (gift order) */
  isGift?: boolean;

  status: OrderStatus | string;
  source: 'web' | 'pos' | 'api';

  // POS specific
  branch?: string;
  terminalId?: string;
  cashier?: string;
  /** Idempotency key for safe retries */
  idempotencyKey?: string;

  // Stock reservation (web checkout)
  /** Reservation ID for stock hold */
  stockReservationId?: string;
  stockReservationExpiresAt?: string;

  currentPayment?: OrderPayment;
  shipping?: OrderShipping;

  /** Parcel metrics for delivery estimation */
  parcel?: OrderParcel;

  /** Customer cancellation request (awaiting admin review) */
  cancellationRequest?: CancellationRequest;
  /** Final cancellation reason (after cancelled) */
  cancellationReason?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;

  // Virtuals
  canCancel?: boolean;
  isCompleted?: boolean;
  paymentStatus?: string;
  paymentMethod?: string;
  netAmount?: number;
  grossAmount?: number;

  // Backward compatibility virtuals (from shipping)
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  shippingStatus?: string;
}

/**
 * Payment Data for checkout
 * Customer provides payment details for manual verification
 *
 * @see {@link file://d:/projects/ecom/bigboss/fe-prod/docs/api/commerce/checkout.md Checkout API Guide}
 */
export interface PaymentData {
  /**
   * Payment method (optional, defaults to 'cash')
   * Options: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'card'
   */
  type?: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'card' | string;

  /**
   * Payment gateway (default: 'manual'). Future: stripe, sslcommerz
   * Note: This is library-managed for automated gateways - don't send from FE for manual payments
   */
  gateway?: string;

  /**
   * Transaction ID/reference (recommended for verification)
   * Example: bKash TrxID: "BGH3K5L90P"
   */
  reference?: string;

  /**
   * Mobile wallet sender phone (REQUIRED for bkash/nagad/rocket)
   * Format: 01XXXXXXXXX
   */
  senderPhone?: string;

  /**
   * Additional payment verification details
   * Note: These fields are library-managed for automated gateways - don't send from FE for manual payments
   */
  paymentDetails?: {
    walletNumber?: string;
    walletType?: 'personal' | 'merchant';
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    proofUrl?: string;
  };

  /** Additional payment notes */
  notes?: string;
}

/**
 * Payload for Creating an Order (Web/API)
 *
 * NOTE: Cart items are fetched server-side from user's cart.
 * FE only sends delivery/payment details.
 *
 * @see {@link file://d:/projects/ecom/bigboss/fe-prod/docs/api/commerce/checkout.md Checkout API Guide}
 */
export interface CreateOrderPayload {
  /** Delivery address (required) */
  deliveryAddress: OrderAddress & {
    recipientName: string;  // Required: Recipient name for delivery label
    recipientPhone: string; // Required: Contact phone for delivery (01XXXXXXXXX)
    addressLine1: string;   // Required: Street address
    areaId: number;         // Required: Area ID from bd-areas constants
    areaName: string;       // Required: Area name (e.g., "Mohammadpur")
    zoneId: number;         // Required: Zone ID for pricing (1-6)
    city: string;           // Required: City/District name
  };

  /** Delivery method and pricing (required) */
  delivery: OrderDelivery & {
    method: string; // Required: Delivery method from platform config
    price: number;  // Required: Delivery price from platform config
  };

  /**
   * Payment details for verification (optional, defaults to cash)
   * Use paymentData.type for payment method (cash, bkash, nagad, rocket, bank_transfer, card)
   */
  paymentData?: PaymentData;

  /** True if ordering on behalf of someone else (gift order) */
  isGift?: boolean;
  /** Coupon code to apply */
  couponCode?: string;
  /** Order notes */
  notes?: string;

  /** Preferred branch ID for fulfillment */
  branchId?: string;
  /** Preferred branch slug (alternative to branchId) */
  branchSlug?: string;
  /** Idempotency key for safe retries (prevents duplicate orders) */
  idempotencyKey?: string;
}

/**
 * Payload for Updating Order Status (Admin)
 * PATCH /orders/:id/status
 */
export interface UpdateStatusPayload {
  status: OrderStatus;
  /** Optional note for status change */
  note?: string;
}

/**
 * Payload for Cancelling an Order
 * POST /orders/:id/cancel
 */
export interface CancelOrderPayload {
  /** Cancellation reason */
  reason?: string;
  /** Process refund if payment was verified */
  refund?: boolean;
}

/**
 * Payload for Requesting Cancellation (awaits admin review)
 * POST /orders/:id/cancel-request
 */
export interface CancelRequestPayload {
  /** Reason for cancellation request */
  reason?: string;
}

/**
 * Payload for Fulfilling/Shipping an Order (Admin)
 * POST /orders/:id/fulfill
 */
export interface FulfillOrderPayload {
  /** Shipping tracking number */
  trackingNumber?: string;
  /** Shipping carrier (e.g., Pathao, Redx) */
  carrier?: string;
  /** Fulfillment notes */
  notes?: string;
  /** Shipping date */
  shippedAt?: string;
  /** Estimated delivery date */
  estimatedDelivery?: string;
  /** Branch ID for inventory decrement (overrides order.branch) */
  branchId?: string;
  /** Branch slug (alternative to branchId) */
  branchSlug?: string;
  /**
   * Record COGS expense transaction (default: false)
   * Profit is already tracked in order via costPriceAtSale.
   * Set true for explicit double-entry accounting.
   */
  recordCogs?: boolean;
}

/**
 * Payload for Refunding an Order (Admin)
 * POST /orders/:id/refund
 */
export interface RefundOrderPayload {
  /** Refund amount in smallest unit (paisa). Omit for full refund. */
  amount?: number;
  /** Refund reason */
  reason?: string;
}

/**
 * Payload for Requesting Shipping Pickup (Admin)
 * POST /orders/:id/shipping
 */
export interface RequestShippingPayload {
  /** Shipping provider (required) */
  provider: string;
  /** Additional shipping options */
  options?: Record<string, unknown>;
}

/**
 * Payload for Updating Shipping Status (Admin/Webhook)
 * PATCH /orders/:id/shipping
 */
export interface UpdateShippingPayload {
  /** Shipping status (required) */
  status: string;
  /** Status note */
  note?: string;
  /** Tracking number */
  trackingNumber?: string;
  /** Tracking URL */
  trackingUrl?: string;
}
