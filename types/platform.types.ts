/**
 * Platform Config Types
 *
 * Mirrors `modules/platform/platform.model.js` (PlatformConfig singleton).
 * Includes payment methods, checkout, logistics, VAT, and policies.
 */

import type { PaymentMethodConfig, PlatformVatConfig } from "./common.types";

// ==================== Delivery Zone Types ====================

export interface DeliveryZone {
  _id?: string;
  name: string;
  region: string;
  price: number; // BDT
  estimatedDays?: number;
  isActive?: boolean;
}

// ==================== Checkout Settings ====================

export interface CheckoutPickupBranch {
  branchId?: string;
  branchCode?: string;
  branchName?: string;
}

export type DeliveryFeeSource = "static" | "provider";

export interface CheckoutSettings {
  allowStorePickup: boolean;
  pickupBranches: CheckoutPickupBranch[];
  deliveryFeeSource: DeliveryFeeSource;
  freeDeliveryThreshold: number; // BDT (0 disables)
  deliveryZones: DeliveryZone[];
}

// ==================== Logistics Settings ====================

export interface LogisticsSettings {
  defaultPickupStoreId?: number;
  defaultPickupStoreName?: string;
  defaultPickupAreaId?: number;
  defaultPickupAreaName?: string;
  webhookSecret?: string;
  autoCreateShipment: boolean;
  autoCreateOnStatus: string;
}

// ==================== Policies ====================

export interface PlatformPolicies {
  termsAndConditions?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  shippingPolicy?: string;
}

// ==================== Platform Config ====================

export interface PlatformConfig {
  _id: string;
  platformName: string;
  /** Flexible payment methods array */
  paymentMethods: PaymentMethodConfig[];
  checkout: CheckoutSettings;
  logistics: LogisticsSettings;
  vat: PlatformVatConfig;
  policies?: PlatformPolicies;
  isSingleton: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== Update Payload ====================

export interface UpdatePlatformConfigPayload {
  platformName?: string;
  paymentMethods?: PaymentMethodConfig[];
  checkout?: Partial<CheckoutSettings>;
  logistics?: Partial<LogisticsSettings>;
  vat?: Partial<PlatformVatConfig>;
  policies?: Partial<PlatformPolicies>;
}

// Re-export for convenience
export type { PaymentMethodConfig } from "./common.types";
