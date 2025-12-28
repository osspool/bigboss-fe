/**
 * Size Guide Types
 *
 * Size guides are templates that can be referenced by products to display size information.
 * Products store `sizeGuideSlug` to reference a size guide.
 *
 * **Dynamic Measurements:**
 * - `measurementLabels` define the columns (e.g., ["Chest", "Length", "Shoulder"])
 * - Each size has a `measurements` object with key-value pairs
 * - Keys are lowercase/underscored versions of labels (e.g., "chest", "length")
 */

// ==================== Size Definition ====================

export interface SizeDefinition {
  /** Size name (e.g., "XS", "S", "M", "L", "XL") */
  name: string;

  /**
   * Key-value pairs of measurements.
   * Keys should match measurementLabels (lowercase, underscored).
   * Values are strings to support ranges (e.g., "34-36").
   */
  measurements: Record<string, string>;
}

// ==================== Size Guide (Read Model) ====================

export interface SizeGuide {
  _id: string;

  /** Size guide name (e.g., "T-Shirts & Tops") */
  name: string;

  /**
   * URL-safe identifier (auto-generated from name, globally unique).
   * Products store this value in their `sizeGuideSlug` field.
   */
  slug: string;

  /** Size guide description (max 500 chars) */
  description?: string;

  /** Measurement unit: 'inches' or 'cm' */
  measurementUnit: 'inches' | 'cm';

  /**
   * Array of measurement labels (e.g., ["Chest", "Length", "Shoulder", "Sleeve"]).
   * Used as table column headers. Max 10 labels.
   */
  measurementLabels: string[];

  /** Array of size definitions with measurements */
  sizes: SizeDefinition[];

  /** Additional notes for customers (max 1000 chars) */
  note?: string;

  /** Whether size guide is visible to customers */
  isActive: boolean;

  /** Display order for sorting (lower = first) */
  displayOrder: number;

  createdAt: string;
  updatedAt: string;
}

// ==================== Create/Update Payloads ====================

export interface CreateSizeGuidePayload {
  /** Required: Size guide name (slug auto-generated from this) */
  name: string;

  /** Custom slug (optional, auto-generated if not provided) */
  slug?: string;

  /** Size guide description */
  description?: string;

  /** Measurement unit (default: 'inches') */
  measurementUnit?: 'inches' | 'cm';

  /** Measurement labels (max 10) */
  measurementLabels?: string[];

  /** Size definitions */
  sizes?: SizeDefinition[];

  /** Additional notes */
  note?: string;

  /** Whether visible to customers (default: true) */
  isActive?: boolean;

  /** Display order (default: 0) */
  displayOrder?: number;
}

export interface UpdateSizeGuidePayload {
  /** Size guide name */
  name?: string;

  /** Size guide description */
  description?: string;

  /** Measurement unit */
  measurementUnit?: 'inches' | 'cm';

  /** Measurement labels (replaces existing) */
  measurementLabels?: string[];

  /** Size definitions (replaces existing) */
  sizes?: SizeDefinition[];

  /** Additional notes */
  note?: string;

  /** Visibility */
  isActive?: boolean;

  /** Display order */
  displayOrder?: number;
}

// ==================== API Response Types ====================

/**
 * Response from GET /size-guides (paginated list)
 */
export interface SizeGuideListResponse {
  success: boolean;
  docs: SizeGuide[];
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Response from GET /size-guides/:id or /size-guides/slug/:slug
 */
export interface SizeGuideResponse {
  success: boolean;
  data: SizeGuide;
}

/**
 * Response from DELETE /size-guides/:id
 */
export interface SizeGuideDeleteResponse {
  success: boolean;
  message?: string;
}
