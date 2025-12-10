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
 * @example { value: "Medium", priceModifier: 5, quantity: 20 }
 */
export interface VariationOption {
  /** Option value (e.g., "Small", "Red", "Cotton") */
  value: string;
  /** Price adjustment for this option (+/- from base price) */
  priceModifier: number;
  /** Available quantity for this specific option */
  quantity: number;
  /** Optional images specific to this variation option */
  images?: ProductImage[];
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
  /** Available stock quantity */
  quantity: number;
  /** Whether the product is active/visible */
  isActive?: boolean;

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
 * System-managed fields (slug, stats, ratings) are ignored by backend
 */
export interface ProductPayload {
  name?: string;
  shortDescription?: string;
  description?: string;
  basePrice?: number;
  quantity?: number;
  images?: ProductImage[];
  category?: string;
  parentCategory?: string | null;
  tags?: string[];
  style?: ProductStyle[];
  variations?: ProductVariation[];
  properties?: ProductProperties;
  discount?: ProductDiscount;
  isActive?: boolean;
}

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
