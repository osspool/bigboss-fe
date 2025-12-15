/**
 * Inventory Types
 *
 * Type definitions for inventory management, stock tracking, and branch operations.
 */

import type { DeliveryAddress } from "./order.types";

// ==================== Stock Movement Types ====================

export type StockMovementType =
  | 'sale'
  | 'return'
  | 'adjustment'
  | 'transfer_in'
  | 'transfer_out'
  | 'initial'
  | 'recount'
  | 'purchase';

// ==================== Branch Types ====================

export type BranchType = 'store' | 'warehouse' | 'outlet' | 'franchise';

export interface BranchAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Branch {
  _id: string;
  slug: string;
  code: string;
  name: string;
  type: BranchType;
  address?: BranchAddress;
  phone?: string;
  email?: string;
  operatingHours?: string;
  isDefault: boolean;
  isActive: boolean;
  manager?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchPayload {
  code: string;
  name: string;
  type?: BranchType;
  address?: BranchAddress;
  phone?: string;
  email?: string;
  operatingHours?: string;
  isDefault?: boolean;
}

// ==================== Stock Entry Types ====================

export interface StockEntry {
  _id: string;
  product: string;
  /** null for simple products without variants */
  variantSku?: string | null;
  barcode?: string;
  branch: string;
  quantity: number;
  reservedQuantity: number;
  costPrice?: number;
  reorderPoint: number;
  reorderQuantity: number;
  lastCountDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  availableQuantity?: number;
  needsReorder?: boolean;
}

export interface StockEntryWithProduct extends Omit<StockEntry, 'product'> {
  product: {
    _id: string;
    name: string;
    slug: string;
    images?: Array<{ url: string; variants?: { thumbnail?: string } }>;
    basePrice: number;
    sku?: string;
    barcode?: string;
    variations?: Array<{
      name: string;
      options: Array<{
        value: string;
        sku?: string;
        barcode?: string;
        priceModifier: number;
      }>;
    }>;
  };
}

// ==================== Stock Movement Types ====================

export interface StockMovement {
  _id: string;
  stockEntry: string;
  product: string;
  variantSku?: string;
  branch: string;
  type: StockMovementType;
  quantity: number;
  balanceAfter: number;
  costPerUnit?: number;
  reference?: {
    model: 'Order' | 'Transfer' | 'PurchaseOrder' | 'Manual';
    id?: string;
  };
  actor?: string;
  notes?: string;
  createdAt: string;
}

export interface StockMovementWithDetails extends Omit<StockMovement, 'product' | 'branch' | 'actor'> {
  product?: { name: string; slug: string };
  branch?: { code: string; name: string };
  actor?: { name: string; email: string };
}

// ==================== Inventory API Payloads ====================

export interface SetStockPayload {
  variantSku?: string;
  branchId?: string;
  quantity: number;
  notes?: string;
}

export interface GetMovementsParams {
  productId?: string;
  branchId?: string;
  type?: StockMovementType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ==================== POS Lookup Response ====================

export interface PosLookupResponse {
  success: boolean;
  data?: {
    product: {
      _id: string;
      name: string;
      slug: string;
      basePrice: number;
      images?: Array<{ url: string; variants?: { thumbnail?: string } }>;
      sku?: string;
      barcode?: string;
      variations?: Array<{
        name: string;
        options: Array<{
          value: string;
          sku?: string;
          barcode?: string;
          priceModifier: number;
          quantity: number;
        }>;
      }>;
    };
    variantSku?: string;
    quantity?: number;
    matchedVariant?: {
      variationName: string;
      option: {
        value: string;
        sku?: string;
        barcode?: string;
        priceModifier: number;
      };
    };
    source: 'inventory' | 'product';
  };
  message?: string;
}

// ==================== POS Order Types ====================

export interface PosOrderItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  price: number;
}

export interface PosCustomer {
  id?: string;
  name?: string;
  phone?: string;
}

export interface PosPayment {
  method: 'cash' | 'bkash' | 'nagad' | 'card';
  amount?: number;
  reference?: string;
}

export interface CreatePosOrderPayload {
  items: PosOrderItem[];
  customer?: PosCustomer;
  payment?: PosPayment;
  discount?: number;
  notes?: string;
  branchId?: string;
  branchSlug?: string;
  terminalId?: string;
  /**
   * If 'delivery', inventory may be decremented at fulfillment.
   * Backend defaults to 'pickup'.
   */
  deliveryMethod?: "pickup" | "delivery";
  deliveryAddress?: {
    recipientName?: string;
    recipientPhone?: string;
    addressLine1?: string;
    addressLine2?: string;
    areaId?: number;
    areaName?: string;
    zoneId?: number;
    providerAreaIds?: {
      redx?: number;
      pathao?: number;
    };
    city?: string;
    postalCode?: string;
  };
  deliveryPrice?: number;
}

// ==================== Receipt Types ====================

export interface ReceiptItem {
  name: string;
  variant?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Receipt {
  orderId: string;
  orderNumber: string;
  date: string;
  status?: string;
  branch?: {
    name: string;
    address?: BranchAddress;
    phone?: string;
  } | null;
  cashier: string;
  customer: {
    name: string;
    phone?: string;
  };
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  deliveryCharge?: number;
  total: number;
  delivery?: {
    method: string;
    address: DeliveryAddress | null;
  };
  payment: {
    method: string;
    amount: number;
    reference?: string;
  };
}

// ==================== Stock Transfer Types ====================

export interface StockTransferPayload {
  productId: string;
  variantSku?: string;
  fromBranchId: string;
  toBranchId: string;
  quantity: number;
  notes?: string;
}

export interface StockTransferResult {
  success: boolean;
  error?: string;
}

// ==================== Stock Availability Check ====================

export interface StockCheckItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  productName?: string;
}

export interface StockAvailabilityResult {
  available: boolean;
  unavailableItems: Array<{
    productId: string;
    variantSku?: string;
    productName?: string;
    requested: number;
    available: number;
    shortage: number;
  }>;
}

// ==================== Stock Summary ====================

export interface StockSummary {
  totalQuantity: number;
  byBranch: Array<{
    branchId: string;
    branchCode: string;
    branchName: string;
    totalQuantity: number;
    variantCount: number;
  }>;
  byVariant: Array<{
    variantSku: string | null;
    totalQuantity: number;
    branchCount: number;
  }>;
}

// ==================== Low Stock Alert ====================

export interface LowStockItem extends StockEntryWithProduct {
  needsReorder: boolean;
  shortage?: number;
}

export interface LowStockParams {
  branchId?: string;
  threshold?: number;
}

// ==================== Branch Query Params ====================

export interface BranchQueryParams {
  page?: number;
  limit?: number;
  code?: string;
  name?: string;
  type?: BranchType;
  isActive?: boolean;
  isDefault?: boolean;
  sort?: string;
  select?: string;
}

// ==================== Update Payloads ====================

export interface UpdateBranchPayload {
  code?: string;
  name?: string;
  type?: BranchType;
  address?: BranchAddress;
  phone?: string;
  email?: string;
  operatingHours?: string;
  isActive?: boolean;
  notes?: string;
}

// ==================== POS Session Types ====================

export interface PosSession {
  branchId: string;
  terminalId?: string;
  cashierId: string;
  openedAt: string;
  closedAt?: string;
  openingBalance?: number;
  closingBalance?: number;
  transactions?: number;
}

// ==================== API Responses ====================

export interface InventoryApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface InventoryPaginatedResponse<T> {
  success: boolean;
  docs: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==================== Bulk Adjustment Types (Square/Odoo-inspired) ====================

/**
 * Adjustment mode for bulk stock operations
 * - 'set': Set absolute quantity (recount/initial load)
 * - 'add': Increment quantity (receiving new stock)
 * - 'remove': Decrement quantity (damage/shrinkage)
 */
export type AdjustmentMode = 'set' | 'add' | 'remove';

/**
 * Single adjustment item in bulk operation
 */
export interface StockAdjustment {
  productId: string;
  variantSku?: string;
  quantity: number;
  mode?: AdjustmentMode;
  reason?: string;
  /** Barcode to assign (optional, for initial stock load) */
  barcode?: string;
}

/**
 * Payload for bulk stock adjustment
 */
export interface BulkAdjustPayload {
  adjustments: StockAdjustment[];
  branchId?: string;
  /** Default reason for all adjustments */
  reason?: string;
}

/**
 * Result of a single adjustment
 */
export interface AdjustmentResult {
  productId: string;
  variantSku?: string;
  previousQuantity?: number;
  newQuantity: number;
  mode: AdjustmentMode;
}

/**
 * Result of bulk adjustment operation
 */
export interface BulkAdjustResult {
  processed: number;
  failed: number;
  results: {
    success: AdjustmentResult[];
    failed: Array<StockAdjustment & { error: string }>;
  };
}

// ==================== Barcode Types ====================

/**
 * Payload for updating product/variant barcode
 */
export interface UpdateBarcodePayload {
  productId: string;
  variantSku?: string;
  barcode: string;
}

// ==================== Label Data Types ====================

/**
 * Data for rendering barcode labels
 * FE uses JsBarcode or similar library to generate barcode images
 */
export interface LabelData {
  productId: string;
  variantSku?: string;
  /** Barcode value (falls back to SKU if not set) */
  barcode: string;
  /** SKU (separate from barcode) */
  sku?: string;
  /** Product name */
  name: string;
  /** Variant description (e.g., "Size: M") */
  variant?: string;
  /** Base price */
  price: number;
  /** Current price after discount */
  currentPrice: number;
  /** Current stock quantity (optional) */
  quantity?: number;
}

