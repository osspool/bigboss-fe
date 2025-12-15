/**
 * Product Types
 *
 * Type definitions for product-related data structures.
 * Includes product models, variations, properties, and API responses.
 */

import type { Image, Discount, Stats, ListResponse, ApiResponse } from "./common.types";

// ==================== Product Image Types ====================

/**
 * Product-specific image (extends base Image type)
 */
export type ProductImage = Image;

// ==================== Product Variation Types ====================

/**
 * Single option within a product variation
 * @example { value: "Medium", sku: "TSHIRT-M", priceModifier: 5, costPrice: 200, quantity: 20 }
 */
export interface VariationOption {
  /** Option value (e.g., "Small", "Red", "Cotton") */
  value: string;
  /** SKU for this variant (e.g., "TSHIRT-RED-M") */
  sku?: string;
  /** Scannable barcode for POS */
  barcode?: string;
  /** Price adjustment for this option (+/- from base price) */
  priceModifier: number;
  /**
   * Cost price for this variant (admin-only field)
   * Used for profit margin calculations. Only visible to admin/store-manager roles.
   */
  costPrice?: number;
  /**
   * Total stock for this variant (read-only, synced from StockEntry)
   *
   * Like product.quantity, this is auto-synced for display purposes.
   * For per-branch stock, use posApi.getStock() with the variantSku.
   */
  quantity: number;
  /** Optional images specific to this variation option */
  images?: ProductImage[];
}

/**
 * Variation option payload for create/update.
 * Backend provides defaults for priceModifier and quantity when omitted.
 */
export interface VariationOptionPayload {
  value: string;
  sku?: string;
  barcode?: string;
  priceModifier?: number;
  costPrice?: number;
  images?: ProductImage[];
  quantity?: number;
}

/**
 * Product variation definition (e.g., Size, Color, Material)
 */
export interface ProductVariation {
  /** Variation name (e.g., "Size", "Color") */
  name: string;
  /** Available options for this variation */
  options: VariationOption[];
}

/**
 * Product variation payload for create/update.
 */
export interface ProductVariationPayload {
  name: string;
  options: VariationOptionPayload[];
}

// ==================== Product Properties ====================

/**
 * Flexible product properties structure
 * Allows for dynamic product attributes beyond core fields
 */
export interface ProductProperties {
  /** Additional product details */
  details?: string;
  /** Materials used in the product */
  materials?: string;
  /** Product features list */
  features?: string[];
  /** Care instructions */
  care?: string[];
  /** Allow additional dynamic properties */
  [key: string]: unknown;
}

// ==================== Product Discount ====================

/**
 * Product-specific discount (extends base Discount type)
 */
export type ProductDiscount = Discount;

// ==================== Product Stats ====================

/**
 * Product-specific statistics (extends base Stats type)
 */
export type ProductStats = Stats;

// ==================== Product Style ====================

/**
 * Product style enumeration
 */
export type ProductStyle =
  | "casual"
  | "street"
  | "urban"
  | "desi"
  | "formal"
  | "sport"
  | "ethnic"
  | "party";

// ==================== Main Product Type ====================

/**
 * Complete product model
 * Represents a product with all its associated data
 */
export interface Product {
  // ===== Core Identifiers =====
  /** MongoDB ObjectId */
  _id: string;
  /** Virtual/alias ID field */
  id?: string;
  /** URL-friendly slug (system-generated) */
  slug: string;

  // ===== Basic Information =====
  /** Product name/title */
  name: string;
  /** Brief product summary (max 200 chars) */
  shortDescription?: string;
  /** Full product description (supports markdown) */
  description?: string;

  // ===== Pricing & Inventory =====
  /** Base price before discounts */
  basePrice: number;
  /**
   * Cost price (admin-only field)
   * Used for profit margin calculations. Only visible to admin/store-manager roles.
   */
  costPrice?: number;
  /**
   * Total stock quantity (read-only, synced from StockEntry)
   *
   * Stock is primarily managed via StockEntry model (per-branch tracking).
   * This field is auto-synced for display purposes and backward compatibility.
   * Use posApi.getStock() to get detailed per-branch stock levels.
   */
  quantity: number;
  /** Whether the product is active/visible */
  isActive?: boolean;

  // ===== SKU & Barcode (for simple products) =====
  /** Product SKU (auto-generated or manual) */
  sku?: string;
  /** Scannable barcode for POS */
  barcode?: string;

  // ===== Media =====
  /** Product images array */
  images: ProductImage[];
  /** Virtual: First featured image or first image */
  featuredImage?: ProductImage;

  // ===== Categorization =====
  /** Primary category slug */
  category: string;
  /** Parent category slug (optional) */
  parentCategory?: string | null;
  /** Product tags for search/filtering */
  tags?: string[];
  /** Product style classifications */
  style?: ProductStyle[];

  // ===== Variations & Properties =====
  /** Product variations (Size, Color, etc.) */
  variations: ProductVariation[];
  /** Additional flexible properties */
  properties?: ProductProperties;

  // ===== Pricing & Promotions =====
  /** Active discount configuration */
  discount?: ProductDiscount;
  /** Virtual: Current price after discount */
  currentPrice?: number;
  /** Virtual: Whether discount is currently active */
  isDiscountActive?: boolean;
  /** Virtual: Profit per unit (currentPrice - costPrice), null if costPrice not set */
  profitMargin?: number | null;
  /** Virtual: Profit percentage ((profitMargin / currentPrice) * 100) */
  profitMarginPercent?: number | null;

  // ===== Statistics & Reviews (Read-only) =====
  /** Product statistics (sales, views, etc.) */
  stats?: ProductStats;
  /** Average rating (0-5) */
  averageRating?: number;
  /** Total number of reviews */
  numReviews?: number;
  /** Virtual: Total sales amount */
  totalSales?: number;

  // ===== Timestamps =====
  /** Creation timestamp (ISO string) */
  createdAt?: string;
  /** Last update timestamp (ISO string) */
  updatedAt?: string;
}

// ==================== API Response Types ====================

/**
 * Product list response (with pagination)
 */
export type ProductListResponse = ListResponse<Product>;

/**
 * Single product detail response
 */
export interface ProductDetailResponse {
  success: boolean;
  data: Product;
}

/**
 * Alternative using generic ApiResponse
 */
export type ProductResponse = ApiResponse<Product>;

// ==================== Form/Input Types ====================

/**
 * Product payload for create/update
 * All fields optional - backend handles validation via schema rules
 * System-managed fields (slug, stats, ratings, quantity) are ignored by backend
 *
 * Note: Stock is managed via StockEntry. Use posApi.setStock() to update stock.
 * The quantity field here is ignored - product.quantity is auto-synced from StockEntry.
 */
export interface ProductPayload {
  name?: string;
  shortDescription?: string;
  description?: string;
  basePrice?: number;
  /** Cost price (admin-only). Only admins/store-managers can set this. */
  costPrice?: number;
  /** Initial stock only. After creation, use posApi.setStock() to update. */
  quantity?: number;
  sku?: string;
  barcode?: string;
  images?: ProductImage[];
  category?: string;
  parentCategory?: string | null;
  tags?: string[];
  style?: ProductStyle[];
  variations?: ProductVariationPayload[];
  properties?: ProductProperties;
  discount?: ProductDiscount;
  isActive?: boolean;
}

/**
 * Product create input (alias for ProductPayload)
 * Use this type for create forms
 */
export type ProductCreateInput = ProductPayload;

/**
 * Product update input (alias for ProductPayload)
 * Use this type for update forms
 */
export type ProductUpdateInput = ProductPayload;

/**
 * Query parameters for product filtering
 */
export interface ProductQueryParams {
  // Pagination
  page?: number;
  limit?: number;
  after?: string;

  // Filters (backend supported)
  category?: string;
  style?: string | string[];
  tags?: string | string[];
  basePrice?: number;
  averageRating?: number;

  // Range filters (use bracket syntax)
  'basePrice[gte]'?: number;
  'basePrice[lte]'?: number;
  'averageRating[gte]'?: number;

  // Text search
  search?: string;

  // Field selection
  select?: string;

  // Sort
  sort?: string | Record<string, 1 | -1 | 'asc' | 'desc'>;

  // Allow extra filters
  [key: string]: unknown;
}

// ==================== Filter & Display Types ====================

/**
 * Minimal product data for cards/lists
 * Optimized for rendering product grids
 */
export interface ProductCardData {
  _id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  basePrice: number;
  currentPrice?: number;
  featuredImage?: ProductImage;
  averageRating?: number;
  numReviews?: number;
  isDiscountActive?: boolean;
  discount?: ProductDiscount;
  tags?: string[];
  style?: ProductStyle[];
}

/**
 * Product with selected variation
 * Used in cart and order contexts
 */
export interface ProductWithVariation extends Product {
  selectedVariation?: {
    name: string;
    option: VariationOption;
  }[];
}
