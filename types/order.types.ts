/**
 * Order Types
 *
 * Type definitions for order management matching the ORDER_API_GUIDE and backend schema.
 * These types are extracted from the backend order-api.ts for better organization.
 */

// ==================== Enums ====================

export type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled';
export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank';
export type ShippingProvider = 'redx' | 'pathao' | 'steadfast' | 'paperfly' | 'sundarban' | 'sa_paribahan' | 'dhl' | 'fedex' | 'other';
export type ShippingStatus = 'pending' | 'requested' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_attempt' | 'returned' | 'cancelled';

// ==================== Delivery Address ====================

export interface DeliveryAddress {
  label?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone: string;
  recipientName?: string;
}

// ==================== Delivery ====================

export interface Delivery {
  method: string;
  price: number;
  estimatedDays?: number;
}

// ==================== Payment Data ====================

export interface PaymentData {
  type: PaymentMethod;
  gateway?: 'manual' | 'stripe' | 'sslcommerz';
  reference?: string;
  senderPhone?: string;
  paymentDetails?: {
    walletNumber?: string;
    walletType?: 'personal' | 'merchant';
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    proofUrl?: string;
  };
  notes?: string;
}

// ==================== Order Item ====================

export interface OrderItem {
  product: string;
  productName: string;
  productSlug?: string;
  variations?: Array<{
    name: string;
    option: { value: string; priceModifier?: number };
  }>;
  quantity: number;
  price: number;
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
  discountValue: number; // Original coupon value (e.g., 10 for 10%, or 50 for ৳50 fixed)
  discountAmount: number; // Actual discount applied (e.g., 26.5)
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
  isGift: boolean; // True if ordering on behalf of someone else
  status: OrderStatus;
  currentPayment?: {
    transactionId?: string;
    amount: number;
    status: PaymentStatus;
    method: PaymentMethod;
    reference?: string;
    verifiedAt?: string;
    verifiedBy?: string;
  };
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  transaction?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

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
