/**
 * POS Types
 *
 * Based on: POS_API_GUIDE.md
 */
import type { Product, ProductVariant, ProductImage } from './product.types';
import type { CreateAdjustmentPayload, BulkAdjustmentPayload } from './inventory.types';
import type { PaymentMethod } from './common.types';

// Re-export for convenience
export type { CreateAdjustmentPayload, BulkAdjustmentPayload };

// ============= Branch Stock =============

export interface VariantStock {
  sku: string;
  attributes: Record<string, string>;
  quantity: number;
  priceModifier?: number;
  costPrice?: number;
  barcode?: string;
}

export interface BranchStock {
  quantity: number;
  inStock: boolean;
  lowStock: boolean;
  variants?: VariantStock[];
}

// ============= POS Product =============

export type PosProduct = Omit<Product, 'costPrice'> & {
  costPrice?: number;
  branchStock?: BranchStock;
};

// ============= Products Response =============

export interface PosProductsSummary {
  totalItems: number;
  totalQuantity: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface PosProductsBranch {
  _id: string;
  code: string;
  name: string;
}

export interface PosProductsResponse {
  success: boolean;
  branch: PosProductsBranch;
  summary: PosProductsSummary;
  docs: PosProduct[];
  hasMore: boolean;
  next: string | null;
  method?: string;
  limit?: number;
}

// ============= Products Params =============

export interface PosProductsParams {
  branchId?: string;
  category?: string;
  search?: string;
  inStockOnly?: boolean;
  lowStockOnly?: boolean;
  after?: string;
  limit?: number;
}

// ============= Lookup =============

export interface PosLookupProduct {
  _id: string;
  name: string;
  basePrice: number;
  productType: string;
  // Extended fields returned by lookup
  slug?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  costPrice?: number;
  images?: ProductImage[];
  variants?: Array<{
    sku: string;
    attributes: Record<string, string>;
    priceModifier?: number;
  }>;
}

export interface PosLookupData {
  product: PosLookupProduct;
  variantSku?: string;
  matchedVariant?: {
    sku: string;
    attributes: Record<string, string>;
    priceModifier: number;
  };
  quantity: number;
  branchId: string;
}

export interface PosLookupResponse {
  success: boolean;
  data: PosLookupData;
  message?: string;
}

// ============= Order =============

export interface PosOrderItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  price?: number; // Ignored by server, computed
}

export interface PosPayment {
  method: PaymentMethod;
  amount?: number;
  reference?: string;
}

export interface PosCustomer {
  name?: string;
  phone?: string;
  id?: string;
}

export interface PosOrderPayload {
  items: PosOrderItem[];
  branchId?: string;
  customer?: PosCustomer;
  payment?: PosPayment;
  discount?: number;
  deliveryMethod?: 'pickup' | 'delivery';
  idempotencyKey?: string;
}

// ============= Receipt =============

export interface PosReceiptItem {
  name: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  vatRate?: number;
  vatAmount?: number;
}

export interface PosReceiptVat {
  applicable: boolean;
  rate: number;
  amount: number;
  taxableAmount: number;
  sellerBin?: string;
  pricesIncludeVat?: boolean;
}

export interface PosReceiptData {
  orderId: string;
  orderNumber: string;
  invoiceNumber?: string;
  date: string;
  branch: {
    name: string;
    phone?: string;
  };
  cashier?: string;
  customer?: {
    name?: string;
    phone?: string | null;
  };
  items: PosReceiptItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  vat?: PosReceiptVat;
  total: number;
  payment: {
    method: string;
    amount: number;
    reference?: string;
  };
}

export interface PosReceiptResponse {
  success: boolean;
  data: PosReceiptData;
}

// Legacy alias for backward compatibility
export interface PosReceipt extends PosReceiptData {}

// Legacy alias
export interface PosLookupResult {
  product: PosProduct;
  variant?: ProductVariant;
  scannedCode: string;
}
