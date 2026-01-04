"use client";

import { useState, useCallback, useMemo } from "react";
import { CATEGORIES } from "@/data/constants";

// Types
export type SearchType = "lookup" | "name";
export type StockStatus = "all" | "ok" | "low" | "out";

export interface SelectOption {
  value: string;
  label: string;
}

export interface InventoryFilters {
  parentCategory: string;
  category: string;
  stockStatus: StockStatus;
  [key: string]: unknown;
}

export interface InventoryFilterParams {
  searchType: SearchType;
  searchValue: string;
  parentCategory: string;
  category: string;
  stockStatus: StockStatus;
  search?: string;
  parentCategoryFilter?: string;
  categoryFilter?: string;
  inStockOnly?: boolean;
  lowStockOnly?: boolean;
  [key: string]: unknown;
}

export interface InventorySearchHook {
  // Search state
  searchValue: string;
  setSearchValue: (v: string) => void;
  searchType: SearchType;
  setSearchType: (v: string) => void;

  // Filter state
  filters: InventoryFilters;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  parentCategory: string;
  setParentCategory: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  stockStatus: StockStatus;
  setStockStatus: (v: string) => void;
  updateFilter: (key: string, value: unknown) => void;

  // Actions
  handleSearch: () => void;
  clearSearch: () => void;
  getFilterParams: () => InventoryFilterParams;
  getSearchParams: () => Record<string, string>;

  // Status flags
  hasActiveFilters: boolean;
  hasActiveSearch: boolean;

  // Index signature for BaseSearchHook compatibility
  [key: string]: unknown;
}

interface UseInventorySearchOptions {
  onFilterChange?: (params: InventoryFilterParams) => void;
}

/**
 * Build parent category options (Men, Women, Kids, Collections)
 */
function buildParentCategoryOptions(): SelectOption[] {
  return [
    { value: "all", label: "All Categories" },
    ...Object.entries(CATEGORIES).map(([, cat]) => ({
      value: cat.slug,
      label: cat.label,
    })),
  ];
}

/**
 * Build subcategory options from all parent categories
 * Labels show hierarchy (e.g., "Men → T-Shirts") but values are just the subcategory slug
 */
function buildCategoryOptions(): SelectOption[] {
  const bySlug = new Map<string, { slug: string; subLabel: string; parents: string[] }>();

  for (const cat of Object.values(CATEGORIES)) {
    for (const sub of cat.subcategories) {
      const existing = bySlug.get(sub.slug);
      if (!existing) {
        bySlug.set(sub.slug, {
          slug: sub.slug,
          subLabel: sub.label,
          parents: [cat.label],
        });
        continue;
      }

      if (!existing.parents.includes(cat.label)) {
        existing.parents.push(cat.label);
      }
    }
  }

  return [
    { value: "all", label: "All Subcategories" },
    ...Array.from(bySlug.values()).map((entry) => ({
      value: entry.slug,
      label:
        entry.parents.length > 1
          ? `${entry.parents.join(" / ")} → ${entry.subLabel}`
          : `${entry.parents[0]} → ${entry.subLabel}`,
    })),
  ];
}

export const PARENT_CATEGORY_OPTIONS = buildParentCategoryOptions();
export const CATEGORY_OPTIONS = buildCategoryOptions();

export const STOCK_STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Stock" },
  { value: "ok", label: "In Stock" },
  { value: "low", label: "Low Stock" },
  { value: "out", label: "Out of Stock" },
];

/**
 * Inventory search hook for managing local search/filter state
 *
 * Provides interface compatible with Search.* components
 * while managing state locally (not URL-based)
 *
 * Follows the same pattern as product search with separate parent category and category filters
 */
export function useInventorySearch(options: UseInventorySearchOptions = {}): InventorySearchHook {
  const { onFilterChange } = options;

  // Search state
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("lookup");

  // Filter state - separate filters like product search
  const [parentCategory, setParentCategory] = useState("all");
  const [category, setCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState<StockStatus>("all");

  // Combined filters object for Search.Filters component
  const filters = useMemo<InventoryFilters>(() => ({
    parentCategory,
    category,
    stockStatus,
  }), [parentCategory, category, stockStatus]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return parentCategory !== "all" || category !== "all" || stockStatus !== "all";
  }, [parentCategory, category, stockStatus]);

  const hasActiveSearch = useMemo(() => {
    return searchValue.trim().length > 0;
  }, [searchValue]);

  // Build filter params for API
  const getFilterParams = useCallback((): InventoryFilterParams => {
    const trimmed = searchValue.trim();
    return {
      searchType,
      searchValue: trimmed,
      parentCategory,
      category,
      stockStatus,
      // Only use text search for "name" mode; lookup uses /pos/lookup instead
      search: searchType === "name" ? (trimmed || undefined) : undefined,
      parentCategoryFilter: parentCategory !== "all" ? parentCategory : undefined,
      categoryFilter: category !== "all" ? category : undefined,
      inStockOnly: stockStatus === "ok" ? true : undefined,
      lowStockOnly: stockStatus === "low" ? true : undefined,
      // 'out' is handled locally since API may not support it directly
    };
  }, [searchValue, searchType, parentCategory, category, stockStatus]);

  // Handle search action (triggers filter update)
  const handleSearch = useCallback(() => {
    onFilterChange?.(getFilterParams());
  }, [onFilterChange, getFilterParams]);

  // Clear all search and filters
  const clearSearch = useCallback(() => {
    setSearchValue("");
    setSearchType("lookup");
    setParentCategory("all");
    setCategory("all");
    setStockStatus("all");
    onFilterChange?.({
      searchType: "lookup",
      searchValue: "",
      parentCategory: "all",
      category: "all",
      stockStatus: "all",
    });
  }, [onFilterChange]);

  // Update individual filter
  const updateFilter = useCallback((key: string, value: unknown) => {
    switch (key) {
      case "parentCategory":
        setParentCategory(value as string);
        break;
      case "category":
        setCategory(value as string);
        break;
      case "stockStatus":
        setStockStatus(value as StockStatus);
        break;
      default:
        break;
    }
  }, []);

  // Set multiple filters at once - compatible with React.Dispatch<SetStateAction<Record<string, unknown>>>
  const setFilters: React.Dispatch<React.SetStateAction<Record<string, unknown>>> = useCallback((action) => {
    const newFilters = typeof action === 'function'
      ? action({ parentCategory, category, stockStatus })
      : action;
    if (newFilters.parentCategory !== undefined) setParentCategory(newFilters.parentCategory as string);
    if (newFilters.category !== undefined) setCategory(newFilters.category as string);
    if (newFilters.stockStatus !== undefined) setStockStatus(newFilters.stockStatus as StockStatus);
  }, [parentCategory, category, stockStatus]);

  return {
    // Search state (for Search.Input)
    searchValue,
    setSearchValue,
    searchType,
    setSearchType: (v: string) => setSearchType(v as SearchType),

    // Filter state (for Search.Filters)
    filters,
    setFilters,
    parentCategory,
    setParentCategory,
    category,
    setCategory,
    stockStatus,
    setStockStatus: (v: string) => setStockStatus(v as StockStatus),
    updateFilter,

    // Actions (for Search.Actions)
    handleSearch,
    clearSearch,
    getFilterParams,
    getSearchParams: (): Record<string, string> => {
      const params: Record<string, string> = {};
      if (searchValue.trim()) params.search = searchValue.trim();
      if (searchType) params.searchType = searchType;
      if (parentCategory !== "all") params.parentCategory = parentCategory;
      if (category !== "all") params.category = category;
      if (stockStatus !== "all") params.stockStatus = stockStatus;
      return params;
    },

    // Status flags
    hasActiveFilters,
    hasActiveSearch,
  };
}
