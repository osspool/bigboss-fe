/**
 * Supplier (Vendor) Types
 *
 * Matches backend: modules/inventory/supplier/supplier.model.js
 * API: /api/v1/inventory/suppliers
 */

import type { ListResponse, ApiResponse } from "./common.types";

// ==================== Enums ====================

export type SupplierType = "local" | "import" | "manufacturer" | "wholesaler";
export type SupplierPaymentTerms = "cash" | "credit";

// ==================== Main Supplier ====================

export interface Supplier {
  _id: string;
  /** Supplier name (unique for active suppliers) */
  name: string;
  /** Auto-generated code (e.g., SUP-0001) */
  code?: string;
  /** Supplier type */
  type?: SupplierType;
  /** Primary contact person */
  contactPerson?: string;
  /** Phone number */
  phone?: string;
  /** Email address */
  email?: string;
  /** Address */
  address?: string;
  /** Tax ID or BIN */
  taxId?: string;
  /** Payment terms */
  paymentTerms?: SupplierPaymentTerms;
  /** Credit days (0 for cash) */
  creditDays?: number;
  /** Credit limit in BDT */
  creditLimit?: number;
  /** Opening payable balance */
  openingBalance?: number;
  /** Internal notes */
  notes?: string;
  /** Free-form tags */
  tags?: string[];
  /** Active/inactive status */
  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// ==================== Payloads ====================

export interface SupplierCreatePayload {
  name: string;
  code?: string;
  type?: SupplierType;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: SupplierPaymentTerms;
  creditDays?: number;
  creditLimit?: number;
  openingBalance?: number;
  notes?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface SupplierUpdatePayload {
  name?: string;
  code?: string;
  type?: SupplierType;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: SupplierPaymentTerms;
  creditDays?: number;
  creditLimit?: number;
  openingBalance?: number;
  notes?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface SupplierQueryParams {
  page?: number;
  limit?: number;
  after?: string;
  sort?: string | Record<string, 1 | -1 | "asc" | "desc">;
  search?: string;
  name?: string;
  type?: SupplierType;
  paymentTerms?: SupplierPaymentTerms;
  isActive?: boolean;
  [key: string]: unknown;
}

// ==================== Responses ====================

export type SupplierListResponse = ListResponse<Supplier>;
export type SupplierResponse = ApiResponse<Supplier>;
