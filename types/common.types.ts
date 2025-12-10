/**
 * Common Types
 *
 * Shared types used across multiple modules in the application.
 * These types are foundational and imported by other type modules.
 */

// ==================== API Response Types ====================

/**
 * Standard pagination information for offset-based pagination
 */
export interface PaginationInfo {
  /** Total number of items across all pages */
  total: number;
  /** Total number of pages */
  pages: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Whether there is a next page available */
  hasNext: boolean;
  /** Whether there is a previous page available */
  hasPrev: boolean;
}

/**
 * Generic API response wrapper
 * @template T - The type of data being returned
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Generic list response with pagination
 * @template T - The type of items in the list
 */
export interface ListResponse<T> {
  success: boolean;
  method: "offset" | "keyset";
  docs: T[];
  // Offset pagination fields
  total?: number;
  pages?: number;
  page?: number;
  limit?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  // Keyset pagination fields
  hasMore?: boolean;
  next?: string | null;
}

// ==================== Image Types ====================

/**
 * Image variants for responsive images
 */
export interface ImageVariants {
  /** Thumbnail variant URL (small size) */
  thumbnail?: string;
  /** Medium variant URL */
  medium?: string;
}

/**
 * Generic image structure used across the application
 */
export interface Image {
  /** Unique identifier for the image */
  _id?: string;
  /** Full image URL */
  url: string;
  /** Responsive image variants */
  variants?: ImageVariants;
  /** Display order (lower numbers appear first) */
  order?: number;
  /** Whether this is the featured/primary image */
  isFeatured?: boolean;
  /** Alt text for accessibility */
  alt?: string;
}

// ==================== Discount Types ====================

/**
 * Discount type enumeration
 */
export type DiscountType = "percentage" | "fixed";

/**
 * Generic discount structure
 */
export interface Discount {
  /** Type of discount calculation */
  type?: DiscountType;
  /** Discount value (percentage or fixed amount) */
  value?: number;
  /** Discount start date (ISO string) */
  startDate?: string;
  /** Discount end date (ISO string) */
  endDate?: string;
  /** Human-readable discount description */
  description?: string;
}

// ==================== Stats Types ====================

/**
 * Generic statistics structure
 */
export interface Stats {
  /** Total sales revenue */
  totalSales?: number;
  /** Total quantity sold */
  totalQuantitySold?: number;
  /** View/visit count */
  viewCount?: number;
}

// ==================== Payment Shared Types ====================

/**
 * Gateway type for payments
 */
export type PaymentGatewayType = "manual" | "stripe" | "sslcommerz";

/**
 * Supported payment methods
 */
export type PaymentMethod =
  | "bkash"
  | "nagad"
  | "rocket"
  | "bank"
  | "online"
  | "cash"
  | "manual";

/**
 * Payment status lifecycle
 */
export type PaymentStatus =
  | "pending"
  | "verified"
  | "failed"
  | "refunded"
  | "cancelled";

/**
 * Payment detail payload
 */
export interface PaymentDetails {
  provider?: string;
  walletNumber?: string;
  walletType?: "personal" | "merchant";
  trxId?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  proofUrl?: string;
}

/**
 * Gateway metadata info
 */
export interface GatewayInfo {
  type: PaymentGatewayType;
  metadata?: Record<string, unknown>;
  paymentIntentId?: string;
  sessionId?: string;
  paymentUrl?: string;
  expiresAt?: string;
}
