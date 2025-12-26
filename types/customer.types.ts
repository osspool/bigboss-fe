/**
 * Customer Types
 *
 * Matches backend `modules/customer/customer.model.js`.
 * Customer is the profile entity (addresses, phone, etc.) linked to auth `User` via `userId`.
 */

import type { ListResponse, ApiResponse } from "./common.types";

// ==================== Enums ====================

export type CustomerGender = "male" | "female" | "other" | "prefer-not-to-say";
export type CustomerTier = "bronze" | "silver" | "gold" | "platinum";

// ==================== Address ====================

/**
 * Customer Address
 *
 * Stores user's saved addresses with area info for delivery.
 * Area data from @classytic/bd-areas: internalId → areaId, name → areaName
 */
export interface CustomerAddress {
  _id?: string;
  recipientName?: string;
  /** Contact phone for delivery */
  recipientPhone?: string;
  label?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;          // districtName
  division?: string;      // divisionName
  postalCode?: string;    // postCode
  country?: string;
  /** @deprecated Use recipientPhone instead */
  phone?: string;
  isDefault?: boolean;
  /** Area internalId from @classytic/bd-areas */
  areaId?: number;
  /** Area name for display */
  areaName?: string;
  /** Delivery zone (1-6) for pricing tier */
  zoneId?: number;
  /** Provider-specific area IDs for logistics */
  providerAreaIds?: {
    redx?: number;
    pathao?: number;
  };
}

// ==================== Stats ====================

export interface CustomerStats {
  orders?: {
    total?: number;
    completed?: number;
    cancelled?: number;
    refunded?: number;
  };
  revenue?: {
    total?: number;
    lifetime?: number;
  };
  firstOrderDate?: string;
  lastOrderDate?: string;

  /**
   * Some deployments may include subscription stats; keep optional to avoid breaking.
   */
  subscriptions?: {
    active?: number;
    cancelled?: number;
  };
}

// ==================== Membership ====================

export interface CustomerMembership {
  cardId: string;
  isActive: boolean;
  enrolledAt?: string;
  points?: {
    current?: number;
    lifetime?: number;
    redeemed?: number;
  };
  tier?: string;
  tierOverride?: string;
  tierOverrideReason?: string;
  tierOverrideBy?: string;
}

// ==================== Main Customer ====================

export interface Customer {
  _id: string;
  id?: string;
  userId?: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: CustomerGender;
  addresses?: CustomerAddress[];
  stats?: CustomerStats;
  tags?: string[];
  notes?: string;
  isActive?: boolean;
  membership?: CustomerMembership | null;

  // Virtuals
  defaultAddress?: CustomerAddress | null;
  tier?: CustomerTier;

  createdAt?: string;
  updatedAt?: string;
}

// ==================== Payloads ====================

export interface CustomerPayload {
  name?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: CustomerGender;
  addresses?: CustomerAddress[];
  tags?: string[];
  notes?: string;
  isActive?: boolean;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  after?: string;
  sort?: string | Record<string, 1 | -1 | "asc" | "desc">;
  name?: string;
  phone?: string;
  email?: string;
  userId?: string;
  populate?: "userId" | Array<"userId"> | string | string[];
  [key: string]: unknown;
}

// ==================== Responses ====================

export type CustomerListResponse = ListResponse<Customer>;
export type CustomerResponse = ApiResponse<Customer>;
