/**
 * Category Types
 *
 * Source of truth: modules/commerce/category/category.model.js
 *
 * **Slug-Based Design:**
 * - Products store `category` as slug string (not ObjectId)
 * - Enables fast queries without $lookup/aggregation
 * - Example: `db.products.find({ category: "electronics" })`
 *
 * **Product Count:**
 * - Automatically maintained via product repository events
 * - Increments on product create
 * - Decrements on product delete
 * - Updates when product changes category
 */

// ==================== Category Image ====================

export interface CategoryImage {
  url?: string;
  alt?: string;
}

// ==================== SEO Metadata ====================

export interface CategorySeo {
  title?: string;
  description?: string;
  keywords?: string[];
}

// ==================== Category (Read Model) ====================

export interface Category {
  _id: string;

  /** Display name (can be changed without breaking product references) */
  name: string;

  /**
   * URL-safe identifier (auto-generated from name, globally unique).
   * Products store this value in their `category` field.
   * IMMUTABLE after creation.
   */
  slug: string;

  /**
   * Parent category slug (not ObjectId).
   * null for root categories.
   */
  parent: string | null;

  /** Short description for category listing */
  description?: string;

  /** Category image for display */
  image?: CategoryImage;

  /** Display order for sorting (lower = first) */
  displayOrder: number;

  /**
   * Category-specific VAT rate override.
   * null = use platform default rate.
   */
  vatRate?: number | null;

  /** Whether category is visible to customers */
  isActive: boolean;

  /**
   * Cached product count (maintained by product repository events).
   * Updated automatically on product create/delete/category-change.
   */
  productCount: number;

  /** SEO metadata */
  seo?: CategorySeo;

  createdAt: string;
  updatedAt: string;

  // Virtuals
  /** Full path e.g. "clothing/t-shirts" */
  fullPath?: string;
  /** Whether this is a root category (no parent) */
  isRoot?: boolean;
}

// ==================== Category Tree Node ====================

/**
 * Category with nested children for tree display
 * Used for navigation menus and admin selects
 *
 * **To flatten for dropdowns:**
 * ```typescript
 * function flattenTree(nodes, depth = 0, result = []) {
 *   for (const n of nodes) {
 *     result.push({ ...n, depth, displayName: '  '.repeat(depth) + n.name });
 *     if (n.children) flattenTree(n.children, depth + 1, result);
 *   }
 *   return result;
 * }
 * ```
 */
export interface CategoryTreeNode extends Category {
  /** Child categories (empty array for leaf nodes) */
  children?: CategoryTreeNode[];
}

// ==================== Create/Update Payloads ====================

export interface CreateCategoryPayload {
  /** Required: Display name (slug auto-generated from this) */
  name: string;

  /** Parent category slug (not ObjectId) */
  parent?: string;

  /** Short description */
  description?: string;

  /** Category image */
  image?: CategoryImage;

  /** Display order (lower = first, default: 0) */
  displayOrder?: number;

  /** VAT rate override (null = use platform default) */
  vatRate?: number | null;

  /** Whether visible to customers (default: true) */
  isActive?: boolean;

  /** SEO metadata */
  seo?: CategorySeo;
}

export interface UpdateCategoryPayload {
  /** Display name (slug is immutable, cannot be changed) */
  name?: string;

  /** Short description */
  description?: string;

  /** Category image */
  image?: CategoryImage;

  /** Display order */
  displayOrder?: number;

  /** VAT rate override */
  vatRate?: number | null;

  /** Visibility */
  isActive?: boolean;

  /** SEO metadata */
  seo?: CategorySeo;
}

// ==================== API Response Types ====================

/**
 * Response from GET /categories (paginated list)
 */
export interface CategoryListResponse {
  success: boolean;
  method: "offset";
  docs: Category[];
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Response from GET /categories/tree
 */
export interface CategoryTreeResponse {
  success: boolean;
  data: CategoryTreeNode[];
}

/**
 * Response from GET /categories/:id or /categories/slug/:slug
 */
export interface CategoryResponse {
  success: boolean;
  data: Category;
}

/**
 * Response from DELETE /categories/:id
 */
export interface CategoryDeleteResponse {
  success: boolean;
  deleted: boolean;
  message?: string;
}
