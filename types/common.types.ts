/**
 * Common Types
 *
 * App-specific shared types not available in @classytic/commerce-sdk.
 * For SDK types, import from @/types (which re-exports from SDK).
 *
 * Types available in SDK (don't duplicate here):
 * - ApiResponse, PaymentMethod, PaymentGatewayType → @classytic/commerce-sdk/transaction
 * - PaymentStatus, ShippingProvider, ShippingStatus → @classytic/commerce-sdk/sales
 * - PaymentMethodConfig → @classytic/commerce-sdk/platform
 */

import type { PaymentGatewayType } from "@classytic/commerce-sdk/transaction";

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

// ==================== Payment Detail Types ====================

/**
 * Payment detail payload (for manual payment verification UI)
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
 * Gateway metadata info (for payment gateway UI)
 */
export interface GatewayInfo {
  type: PaymentGatewayType;
  metadata?: Record<string, unknown>;
  paymentIntentId?: string;
  sessionId?: string;
  paymentUrl?: string;
  expiresAt?: string;
}

// ==================== MFS & Card Types ====================

/**
 * MFS (Mobile Financial Service) providers
 */
export type MfsProvider = 'bkash' | 'nagad' | 'rocket' | 'upay';

/**
 * Card types accepted
 */
export type CardType = 'visa' | 'mastercard' | 'amex' | 'unionpay' | 'other';

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
