export interface ParentCategoryOption {
  value: string;
  label: string;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface StockStatusOption {
  value: string;
  label: string;
}

export const PARENT_CATEGORY_OPTIONS: ParentCategoryOption[];
export const CATEGORY_OPTIONS: CategoryOption[];
export const STOCK_STATUS_OPTIONS: StockStatusOption[];

export type SearchType = "lookup" | "name";
export type StockStatus = "all" | "ok" | "low" | "out";

export interface FilterParams {
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
}

export interface InventorySearchFilters {
  parentCategory: string;
  category: string;
  stockStatus: string;
}

export interface UseInventorySearchOptions {
  onFilterChange?: (params: FilterParams) => void;
}

export interface InventorySearchHook {
  // Search state
  searchValue: string;
  setSearchValue: (value: string) => void;
  searchType: string;
  setSearchType: (type: string) => void;

  // Filter state
  filters: InventorySearchFilters;
  parentCategory: string;
  setParentCategory: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  stockStatus: string;
  setStockStatus: (value: string) => void;
  updateFilter: (key: string, value: string) => void;

  // Actions
  handleSearch: () => void;
  clearSearch: () => void;
  getFilterParams: () => FilterParams;

  // Status flags
  hasActiveFilters: boolean;
  hasActiveSearch: boolean;
}

export function useInventorySearch(options?: UseInventorySearchOptions): InventorySearchHook;
