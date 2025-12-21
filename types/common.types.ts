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
  type: DiscountType;
  /** Discount value (percentage or fixed amount) */
  value: number;
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
 * Supported payment methods for orders/transactions
 * Matches backend: common/revenue/enums.js PAYMENT_METHOD + 'manual'
 *
 * For MFS (Mobile Financial Services): bkash, nagad, rocket
 * These map directly to platform config's PaymentMethodConfig.provider field
 */
export type PaymentMethod =
  | "bkash"
  | "nagad"
  | "rocket"
  | "bank_transfer"
  | "card"
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
  | "partially_refunded"
  | "cancelled";

/**
 * Shipping provider types
 * Based on: order.md shipping providers
 */
export type ShippingProvider =
  | "redx"
  | "pathao"
  | "steadfast"
  | "paperfly"
  | "sundarban"
  | "sa_paribahan"
  | "dhl"
  | "fedex"
  | "other";

/**
 * Shipping status lifecycle
 * Based on: order.md shipping status flow
 */
export type ShippingStatus =
  | "pending"
  | "requested"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed_attempt"
  | "returned"
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

// ==================== Platform Payment Method Types ====================

/**
 * Payment method types
 * - cash: Cash on delivery / in-store
 * - mfs: Mobile Financial Services (bKash, Nagad, Rocket, Upay)
 * - bank_transfer: Bank account transfers
 * - card: Credit/Debit cards
 */
export type PaymentMethodType = 'cash' | 'mfs' | 'bank_transfer' | 'card';

/**
 * MFS (Mobile Financial Service) providers
 */
export type MfsProvider = 'bkash' | 'nagad' | 'rocket' | 'upay';

/**
 * Card types accepted
 */
export type CardType = 'visa' | 'mastercard' | 'amex' | 'unionpay' | 'other';

/**
 * Platform Payment Method
 * Flexible structure supporting multiple accounts per type
 */
export interface PaymentMethodConfig {
  _id?: string;
  /** Payment type */
  type: PaymentMethodType;
  /** Display name (e.g., "bKash Personal", "City Bank Cards") */
  name: string;
  /** MFS provider (bkash, nagad, rocket, upay) - for type: 'mfs' */
  provider?: MfsProvider;
  /** MFS wallet number */
  walletNumber?: string;
  /** MFS wallet name */
  walletName?: string;
  /** Bank name - for type: 'bank_transfer' or 'card' */
  bankName?: string;
  /** Bank account number */
  accountNumber?: string;
  /** Bank account holder name */
  accountName?: string;
  /** Bank branch name */
  branchName?: string;
  /** Bank routing number */
  routingNumber?: string;
  /** Card types accepted - for type: 'card' */
  cardTypes?: CardType[];
  /** Additional notes */
  note?: string;
  /** Whether this method is active */
  isActive?: boolean;
}

// ==================== VAT/Tax Configuration Types ====================

/**
 * Category-specific VAT rate
 */
export interface CategoryVatRate {
  category: string;
  rate: number;
  description?: string;
}

/**
 * VAT invoice settings
 */
export interface VatInvoiceSettings {
  showVatBreakdown: boolean;
  prefix: string;
  startNumber: number;
  currentNumber: number;
  footerText?: string;
}

/**
 * Platform VAT configuration
 * Bangladesh NBR (National Board of Revenue) compliant
 *
 * Standard VAT: 15%
 * Reduced rates: 5%, 7.5%, 10% (category-specific)
 * Exempt: 0% (essential goods)
 */
export interface PlatformVatConfig {
  /** Whether the business is VAT registered */
  isRegistered: boolean;

  /** Business Identification Number (13 digits for Bangladesh) */
  bin?: string;

  /** Registered business name with NBR */
  registeredName?: string;

  /** VAT Circle/Zone for filing */
  vatCircle?: string;

  /** Default VAT rate (percentage) */
  defaultRate: number;

  /** Whether prices in catalog include VAT */
  pricesIncludeVat: boolean;

  /** Category-specific VAT rates */
  categoryRates?: CategoryVatRate[];

  /** Invoice settings */
  invoice?: VatInvoiceSettings;

  /** Supplementary Duty settings */
  supplementaryDuty?: {
    enabled: boolean;
    defaultRate: number;
  };
}

// Full PlatformConfig shape (checkout/logistics/vat/policies) lives in:
// `docs/.fe/types/platform.types.ts`
