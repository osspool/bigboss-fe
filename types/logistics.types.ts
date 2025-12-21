/**
 * Logistics Types
 *
 * Types for logistics API responses (shipments, tracking, charges).
 * For area data types, use @classytic/bd-areas directly:
 *
 * ```typescript
 * import type { Area, Division, District, ProviderAreaIds } from '@classytic/bd-areas';
 * import { searchAreas, getAreasByDistrict } from '@classytic/bd-areas';
 * ```
 */

// Import for local use
import type { ProviderName } from '@classytic/bd-areas';

// Re-export area types from bd-areas for convenience
export type {
  Area,
  Division,
  District,
  ProviderAreaIds,
  ProviderName,
} from '@classytic/bd-areas';

// ==================== Enums ====================

export type ShipmentStatus =
  | 'pending'           // Created in our system, not sent to provider
  | 'pickup-requested'  // Sent to provider, awaiting pickup
  | 'picked-up'         // Courier picked up from seller
  | 'in-transit'        // On the way to destination
  | 'out-for-delivery'  // With delivery rider
  | 'delivered'         // Successfully delivered
  | 'failed-attempt'    // Delivery attempt failed
  | 'returning'         // Being returned to sender
  | 'returned'          // Returned to sender
  | 'cancelled';        // Cancelled

export type LogisticsProvider = 'redx' | 'pathao' | 'steadfast' | 'paperfly' | 'sundarban' | 'manual';

// ==================== Provider Charges ====================

/**
 * Response from GET /logistics/charge
 *
 * Use deliveryCharge for customer-facing price.
 * codCharge is the provider's fee for cash collection (not charged to customer).
 */
export interface ProviderCharges {
  /** Base delivery charge from provider */
  deliveryCharge: number;
  /** COD charge (provider's fee, not customer-facing) */
  codCharge: number;
  /** Total charge (deliveryCharge + codCharge) */
  totalCharge: number;
  /** Currency code (default: BDT) */
  currency?: string;
}

// ==================== Shipment ====================

export interface ShipmentParcel {
  weight?: number;
  value?: number;
  itemCount?: number;
}

export interface ShipmentPickup {
  storeId?: number;
  storeName?: string;
  scheduledAt?: string;
  pickedUpAt?: string;
}

export interface ShipmentDelivery {
  customerName: string;
  customerPhone: string;
  address: string;
  areaId?: number;
  areaName?: string;
}

export interface ShipmentCashCollection {
  amount: number;
  collected?: boolean;
  collectedAt?: string;
}

export interface ShipmentTimelineEvent {
  status: ShipmentStatus;
  message?: string;
  messageLocal?: string;
  timestamp: string;
  raw?: Record<string, unknown>;
}

export interface Shipment {
  _id: string;
  order: string;
  provider: LogisticsProvider;
  trackingId: string;
  providerOrderId?: string;
  status: ShipmentStatus;
  providerStatus?: string;
  parcel: ShipmentParcel;
  pickup: ShipmentPickup;
  delivery: ShipmentDelivery;
  cashCollection: ShipmentCashCollection;
  charges: ProviderCharges;
  merchantInvoiceId?: string;
  timeline: ShipmentTimelineEvent[];
  lastWebhookAt?: string;
  webhookCount: number;
  cancelledBy?: string;
  cancelReason?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Tracking ====================

export interface TrackingData {
  trackingId: string;
  status: ShipmentStatus;
  providerStatus?: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  timeline: ShipmentTimelineEvent[];
}

export interface TrackingResult {
  shipment: Shipment;
  tracking: TrackingData;
}

// ==================== Pickup Store ====================

/**
 * Pickup store from RedX API
 * Admin creates these via RedX dashboard
 * Used for: selecting pickup location when creating shipments
 */
export interface PickupStore {
  /** RedX store ID */
  id: number;
  /** Store name */
  name: string;
  /** Store address */
  address?: string;
  /** Contact phone */
  phone?: string;
  /** Area ID (RedX area) - used for charge calculation */
  areaId?: number;
  /** Area name */
  areaName?: string;
  /** Creation date */
  createdAt?: string;
}

// ==================== Logistics Config ====================

export interface ProviderConfig {
  provider: LogisticsProvider;
  apiUrl?: string;
  apiKey?: string;
  isActive: boolean;
  isDefault?: boolean;
  settings?: Record<string, unknown>;
}

export interface LogisticsConfig {
  _id: string;
  defaultProvider: LogisticsProvider;
  providers: ProviderConfig[];
  supportedProviders: LogisticsProvider[];
}

// ==================== Request Payloads ====================

export interface CreateShipmentPayload {
  orderId: string;
  provider?: LogisticsProvider;
  deliveryAreaId?: number;
  deliveryAreaName?: string;
  providerAreaId?: number;
  pickupStoreId?: number;
  pickupAreaId?: number;
  weight?: number;
  /** COD amount to collect on delivery (0 for prepaid orders) */
  codAmount?: number;
  instructions?: string;
}

export interface UpdateShipmentStatusPayload {
  status: ShipmentStatus;
  message?: string;
  messageLocal?: string;
}

export interface CancelShipmentPayload {
  reason?: string;
}

export interface CalculateChargeParams {
  /** Delivery area internalId from bd-areas */
  deliveryAreaId: number;
  /** COD amount in BDT (use 0 for prepaid) */
  amount: number;
  /** Parcel weight in grams (default: 500g) */
  weight?: number;
  /** Pickup area internalId (optional - auto-fetched from merchant's RedX pickup store) */
  pickupAreaId?: number;
  /** Specific provider (optional - uses default provider if not specified) */
  provider?: ProviderName;
}

// ==================== Checkout Settings ====================

export type DeliveryFeeSource = 'static' | 'provider';

/**
 * Branch info for store pickup
 */
export interface PickupBranchInfo {
  branchId: string;
  branchCode: string;
  branchName: string;
}

/**
 * Checkout settings from platform config
 */
export interface CheckoutSettings {
  /** Enable store pickup option */
  allowStorePickup: boolean;
  /** Branches available for pickup (empty = all active) */
  pickupBranches: PickupBranchInfo[];
  /** Fee source: 'static' (from zones) or 'provider' (from RedX API) */
  deliveryFeeSource: DeliveryFeeSource;
  /** Minimum order for free delivery (0 = disabled) */
  freeDeliveryThreshold: number;
}

// ==================== Delivery Method ====================

export type DeliveryMethod = 'standard' | 'express' | 'pickup';

/**
 * Delivery option for checkout UI
 */
export interface DeliveryOption {
  method: DeliveryMethod;
  label: string;
  price: number;
  estimatedDays?: string;
  /** For pickup: branch info */
  pickupBranch?: PickupBranchInfo;
}
