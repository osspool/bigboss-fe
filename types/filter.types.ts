/**
 * Filter Types
 *
 * Type definitions for product filtering, sorting, and search.
 */

// ==================== Price Range ====================

/**
 * Price range filter
 */
export interface PriceRange {
  /** Minimum price */
  min: number;
  /** Maximum price */
  max: number;
}

// ==================== Product Filter State ====================

/**
 * Complete product filter state
 * Used for filtering product lists
 */
export interface ProductFilterState {
  /** Parent category filter */
  parentCategory: string | null;
  /** Child/subcategory filter */
  childCategory: string | null;
  /** Selected sizes */
  selectedSizes: string[];
  /** Selected colors */
  selectedColors: string[];
  /** Price range */
  priceRange: PriceRange;
  /** Selected styles */
  selectedStyles?: string[];
  /** Selected tags */
  selectedTags?: string[];
  /** Search query */
  searchQuery?: string;
  /** Availability filter */
  inStock?: boolean;
  /** On sale/discounted only */
  onSale?: boolean;
  /** Minimum rating */
  minRating?: number;
}

// ==================== Sort Options ====================

/**
 * Product sorting options
 */
export type SortOption =
  | "newest"        // Most recently added
  | "oldest"        // Oldest first
  | "price-asc"     // Price: Low to High
  | "price-desc"    // Price: High to Low
  | "best-selling"  // Best sellers
  | "top-rated"     // Highest rated
  | "a-z"           // Name: A to Z
  | "z-a";          // Name: Z to A

/**
 * Sort option configuration with metadata
 */
export interface SortOptionConfig {
  /** Display label */
  label: string;
  /** Sort option value */
  value: SortOption;
  /** API sort parameter */
  apiSort: string;
  /** Icon (optional) */
  icon?: string;
  /** Description */
  description?: string;
}

// ==================== Filter Options ====================

/**
 * Available filter option (for UI rendering)
 */
export interface FilterOption {
  /** Option value */
  value: string;
  /** Display label */
  label: string;
  /** Number of products matching this filter */
  count?: number;
  /** Whether this option is disabled */
  disabled?: boolean;
}

/**
 * Grouped filter options (e.g., categories with subcategories)
 */
export interface GroupedFilterOption {
  /** Group label */
  label: string;
  /** Group value/id */
  value: string;
  /** Options within this group */
  options: FilterOption[];
}

// ==================== Search & Filter Results ====================

/**
 * Search/filter query parameters
 */
export interface ProductSearchParams {
  /** Search query text */
  q?: string;
  /** Category filter */
  category?: string;
  /** Parent category filter */
  parentCategory?: string;
  /** Minimum price */
  minPrice?: number;
  /** Maximum price */
  maxPrice?: number;
  /** Tags filter */
  tags?: string[];
  /** Styles filter */
  styles?: string[];
  /** In stock only */
  inStock?: boolean;
  /** On sale only */
  onSale?: boolean;
  /** Minimum rating */
  minRating?: number;
  /** Sort option */
  sort?: SortOption;
  /** Page number */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Active filters summary
 */
export interface ActiveFilters {
  /** Number of active filters */
  count: number;
  /** List of active filter labels */
  labels: string[];
  /** Filter state */
  filters: Partial<ProductFilterState>;
}

// ==================== Faceted Search ====================

/**
 * Facet (aggregated filter counts)
 */
export interface Facet {
  /** Facet field name */
  field: string;
  /** Facet options with counts */
  values: Array<{
    value: string;
    label: string;
    count: number;
  }>;
}

/**
 * Faceted search results
 */
export interface FacetedSearchResults<T> {
  /** Search results */
  results: T[];
  /** Available facets */
  facets: Facet[];
  /** Total results count */
  total: number;
  /** Applied filters */
  appliedFilters: Partial<ProductSearchParams>;
}

// ==================== Filter Presets ====================

/**
 * Saved filter preset
 */
export interface FilterPreset {
  /** Preset ID */
  id: string;
  /** Preset name */
  name: string;
  /** Preset description */
  description?: string;
  /** Filter configuration */
  filters: Partial<ProductFilterState>;
  /** Sort option */
  sort?: SortOption;
  /** Whether this is a default/featured preset */
  isDefault?: boolean;
}

// ==================== URL Query Mapping ====================

/**
 * Maps filter state to URL query parameters
 */
export type FilterQueryParams = Record<string, string | string[] | number | boolean>;

/**
 * Filter state synchronization with URL
 */
export interface FilterURLSync {
  /** Convert filter state to URL params */
  toQueryParams: (filters: ProductFilterState) => FilterQueryParams;
  /** Parse URL params to filter state */
  fromQueryParams: (params: URLSearchParams) => Partial<ProductFilterState>;
}
