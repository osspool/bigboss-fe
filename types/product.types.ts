/**
 * Product Types
 * 
 * Source of truth: modules/commerce/product/product.model.js
 */

/**
 * Image Schema
 */
export interface ProductImage {
  url: string;
  variants?: {
    thumbnail?: string;
    medium?: string;
  };
  order?: number;
  isFeatured?: boolean;
  alt?: string;
}

/**
 * Dimensions Schema
 */
export interface Dimensions {
  length?: number;
  width?: number;
  height?: number;
}

/**
 * Shipping Schema
 */
export interface ProductShipping {
  weightGrams?: number;
  dimensionsCm?: Dimensions;
}

/**
 * Variation Attribute (Defines options)
 * e.g. { name: "Size", values: ["S", "M", "L"] }
 */
export interface VariationAttribute {
  name: string;
  values: string[];
}

/**
 * Variant (Sellable SKU)
 */
export interface ProductVariant {
  sku: string;
  barcode?: string;
  attributes: Record<string, string>; // e.g. { size: "S", color: "Red" }
  priceModifier: number; // Defaults to 0

  /**
   * System calculated field (Read-only for frontend)
   * COGS for this specific variant
   */
  costPrice?: number;

  /**
   * VAT rate override for this specific variant
   * null = inherit from product/category/platform
   */
  vatRate?: number | null;

  images?: ProductImage[];
  shipping?: ProductShipping;
  isActive?: boolean;
}

/**
 * Discount Schema
 */
export interface ProductDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  startDate?: string; // ISO date
  endDate?: string;   // ISO date
  description?: string;
}

/**
 * Product Stats (System Generated)
 */
export interface ProductStats {
  totalSales: number;
  totalQuantitySold: number;
  viewCount: number;
}

/**
 * Stock Projection for Variant Products (Read-Only)
 * Provides fast storefront availability checks
 */
export interface StockProjection {
  variants: Array<{
    sku: string;
    quantity: number;
  }>;
  syncedAt: string; // ISO date when stock was last synced
}

/**
 * Main Product Interface (Read Model)
 */
export interface Product {
  _id: string;
  name: string;
  slug: string; // Globally unique, auto-generated from name

  shortDescription?: string;
  description?: string;

  basePrice: number;

  /**
   * System field: Cost of Goods Sold
   * Not editable by customer. Admin only.
   * Role-restricted field - only visible to authorized roles
   */
  costPrice?: number;

  /**
   * VAT rate override for this product
   * null = inherit from category/platform default
   */
  vatRate?: number | null;

  /**
   * System field: Total stock quantity across all branches.
   * Read-only cache. Source of truth is Inventory Service.
   */
  quantity: number;

  /**
   * Product type: 'simple' for regular products, 'variant' for products with variations
   * Auto-determined by backend based on presence of variationAttributes
   */
  productType: 'simple' | 'variant';

  // Simple product fields
  sku?: string;
  barcode?: string;
  
  images: ProductImage[];

  /**
   * Category slug (references Category.slug, not ObjectId).
   * Enables direct string queries without $lookup.
   * @see Category model for metadata (name, image, description)
   */
  category: string;

  /**
   * Parent category slug (optional, for hierarchical filtering)
   */
  parentCategory?: string | null;
  
  style?: ('casual' | 'street' | 'urban' | 'desi' | 'formal' | 'sport' | 'ethnic' | 'party')[];
  
  // Variant product fields
  variationAttributes?: VariationAttribute[];
  variants?: ProductVariant[];
  
  shipping?: ProductShipping;
  properties?: Record<string, any>;
  tags?: string[];
  
  stats?: ProductStats;
  averageRating?: number;
  numReviews?: number;

  /**
   * Stock projection for variant products (Read-Only)
   * Contains aggregated stock quantities per variant across all branches
   */
  stockProjection?: StockProjection;

  discount?: ProductDiscount;
  isActive: boolean;
  
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Virtuals
  isDiscountActive?: boolean;
  currentPrice?: number;
  featuredImage?: ProductImage | null;
  profitMargin?: number | null;
  profitMarginPercent?: number | null;
  isDeleted?: boolean;
}

/**
 * Payload for Creating/Updating a Product
 */
export interface ProductPayload {
  name: string;
  shortDescription?: string;
  description?: string;
  basePrice: number;

  // Admin only - requires proper permission
  costPrice?: number;

  // VAT rate override (null = inherit from category/platform)
  vatRate?: number | null;

  productType?: 'simple' | 'variant';

  // Simple product identifiers
  sku?: string;
  barcode?: string;

  images?: ProductImage[];
  category: string;
  parentCategory?: string;

  style?: string[];

  // Variant setup
  variationAttributes?: VariationAttribute[];
  variants?: ProductVariant[];

  shipping?: ProductShipping;
  properties?: Record<string, any>;
  tags?: string[];

  discount?: ProductDiscount;
  isActive?: boolean;
}
