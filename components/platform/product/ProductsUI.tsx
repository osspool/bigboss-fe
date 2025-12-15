"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/query/useProducts";
import { ProductGrid } from "./ProductGrid";
import { ProductEmptyState } from "./ProductEmptyState";
import { ProductSort, getApiSort, type SortValue } from "./list/ProductSort";
import { FilterBar, MobileFilterSheet, ProductFilters } from "./list";
import { ApiPagination } from "@/components/custom/ui/api-pagination";
import { Spinner } from "@/components/ui/spinner";
import { DEFAULT_PRICE_LIMIT, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { PriceRange, ProductFilterState } from "@/types";

interface ProductsUIProps {
  initialPage?: number;
  initialSort?: SortValue;
  initialSearch?: string;
  initialCategory?: string;
  initialParentCategory?: string;
  initialTags?: string[];
}

export function ProductsUI({
  initialPage = 1,
  initialSort = "newest",
  initialSearch = "",
  initialCategory,
  initialParentCategory,
  initialTags = [],
}: ProductsUIProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // UI State
  const [showFilters, setShowFilters] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Parse URL params
  const currentPage = Number(searchParams.get("page")) || initialPage;
  const currentSort = (searchParams.get("sort") as SortValue) || initialSort;
  const searchQuery = searchParams.get("search") || initialSearch;

  // Filter state
  const [filters, setFilters] = useState<ProductFilterState>({
    parentCategory: searchParams.get("parentCategory") || initialParentCategory || null,
    childCategory: searchParams.get("category") || initialCategory || null,
    selectedTags: searchParams.get("tags")?.split(",").filter(Boolean) || initialTags,
    priceRange: {
      min: Number(searchParams.get("minPrice")) || DEFAULT_PRICE_LIMIT.min,
      max: Number(searchParams.get("maxPrice")) || DEFAULT_PRICE_LIMIT.max,
    },
  });

  // Build API params for useProducts
  const apiParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: currentPage,
      limit: DEFAULT_PAGE_SIZE,
      sort: getApiSort(currentSort),
      // Lighter payload for list - exclude description
      select: "-description,-properties",
    };

    // Search
    if (searchQuery) params.search = searchQuery;

    // Category filters
    if (filters.childCategory) params.category = filters.childCategory;
    if (filters.parentCategory && !filters.childCategory) {
      params.parentCategory = filters.parentCategory;
    }

    // Price range filter
    if (filters.priceRange.min > DEFAULT_PRICE_LIMIT.min) {
      params["basePrice[gte]"] = filters.priceRange.min;
    }
    if (filters.priceRange.max < DEFAULT_PRICE_LIMIT.max) {
      params["basePrice[lte]"] = filters.priceRange.max;
    }

    // Tags filter (featured, new-arrivals, best-sellers, sale)
    if (filters.selectedTags.length > 0) {
      params.tags = filters.selectedTags;
    }

    return params;
  }, [currentPage, currentSort, searchQuery, filters]);

  // Fetch products using the standard useProducts hook
  const { items: products, pagination, isLoading, error } = useProducts(
    null, // no token needed for public products
    apiParams,
    { public: true }
  );

  // Update URL when filters change
  const updateURL = useCallback((updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Reset to page 1 when filters change (except for page changes)
    if (!("page" in updates)) {
      params.delete("page");
    }

    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    updateURL({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [updateURL]);

  // Handle sort change
  const handleSortChange = useCallback((sort: SortValue) => {
    updateURL({ sort });
  }, [updateURL]);

  // Handle filter changes
  const handleCategoryChange = useCallback((parent: string | null, child: string | null) => {
    setFilters(prev => ({ ...prev, parentCategory: parent, childCategory: child }));
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  }, []);

  const handlePriceRangeChange = useCallback((range: PriceRange) => {
    setFilters(prev => ({ ...prev, priceRange: range }));
  }, []);

  // Apply filters to URL
  const applyFilters = useCallback((newFilters: ProductFilterState) => {
    setFilters(newFilters);
    updateURL({
      parentCategory: newFilters.parentCategory,
      category: newFilters.childCategory,
      tags: newFilters.selectedTags.length > 0 ? newFilters.selectedTags.join(",") : null,
      minPrice: newFilters.priceRange.min > DEFAULT_PRICE_LIMIT.min ? newFilters.priceRange.min : null,
      maxPrice: newFilters.priceRange.max < DEFAULT_PRICE_LIMIT.max ? newFilters.priceRange.max : null,
    });
  }, [updateURL]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters: ProductFilterState = {
      parentCategory: null,
      childCategory: null,
      selectedTags: [],
      priceRange: DEFAULT_PRICE_LIMIT,
    };
    setFilters(clearedFilters);
    updateURL({
      parentCategory: null,
      category: null,
      tags: null,
      minPrice: null,
      maxPrice: null,
      search: null,
    });
  }, [updateURL]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.parentCategory) count++;
    if (filters.childCategory) count++;
    count += filters.selectedTags.length;
    if (filters.priceRange.min > DEFAULT_PRICE_LIMIT.min || filters.priceRange.max < DEFAULT_PRICE_LIMIT.max) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0 || !!searchQuery;

  // Error state
  if (error) {
    return <ProductEmptyState variant="error" />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with sort and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile filter trigger */}
          <div className="lg:hidden">
            <MobileFilterSheet
              isOpen={mobileFilterOpen}
              onOpenChange={setMobileFilterOpen}
              filters={filters}
              priceLimit={DEFAULT_PRICE_LIMIT}
              onApplyFilters={applyFilters}
              onClearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>

          {/* Desktop filter toggle */}
          <FilterBar
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            activeFilterCount={activeFilterCount}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />

          {/* Results count */}
          <p className="text-sm text-muted-foreground hidden sm:block">
            {pagination?.total != null && pagination.total > 0 ? (
              <>{pagination.total.toLocaleString()} products</>
            ) : (
              "No products"
            )}
          </p>
        </div>

        {/* Sort */}
        <ProductSort value={currentSort} onChange={handleSortChange} />
      </div>

      {/* Main content area */}
      <div className="flex gap-8">
        {/* Desktop filters sidebar */}
        {showFilters && (
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <ProductFilters
                parentCategory={filters.parentCategory}
                childCategory={filters.childCategory}
                selectedTags={filters.selectedTags}
                priceRange={filters.priceRange}
                priceLimit={DEFAULT_PRICE_LIMIT}
                onCategoryChange={handleCategoryChange}
                onTagToggle={handleTagToggle}
                onPriceRangeChange={handlePriceRangeChange}
              />
            </div>
          </aside>
        )}

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Spinner className="h-8 w-8" />
            </div>
          ) : !products || products.length === 0 ? (
            <ProductEmptyState
              variant={hasActiveFilters ? "no-filtered" : "no-products"}
              searchQuery={searchQuery}
              onClearFilters={clearFilters}
            />
          ) : (
            <>
              <ProductGrid 
                products={products} 
                columns={showFilters ? 3 : 4}
              />

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="mt-8">
                  <ApiPagination
                    total={pagination.total}
                    limit={pagination.limit}
                    pages={pagination.pages}
                    page={pagination.page}
                    hasNext={pagination.hasNext}
                    hasPrev={pagination.hasPrev}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
