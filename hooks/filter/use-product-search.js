"use client";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBaseSearch } from "./use-base-search";
import { clearSearchAndFilterParams } from "@/lib/filter-utils";

export function useProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const config = {
    basePath: "/dashboard/products",
    searchFields: {
      name: "search", // Full-text search across name, description, tags
      slug: "slug",
    },
    filterFields: {
      category: { paramName: "category", type: "string", defaultValue: "" },
      parentCategory: { paramName: "parentCategory", type: "string", defaultValue: "" },
      isActive: { paramName: "isActive", type: "string", defaultValue: "" },
      minPrice: { paramName: "basePrice[gte]", type: "number", defaultValue: "" },
      maxPrice: { paramName: "basePrice[lte]", type: "number", defaultValue: "" },
    },
    defaultSearchType: "name",
  };

  const baseSearch = useBaseSearch(config);

  // Filter values
  const category = baseSearch.filters.category || "";
  const setCategory = (value) => baseSearch.updateFilter("category", value);

  const parentCategory = baseSearch.filters.parentCategory || "";
  const setParentCategory = (value) => baseSearch.updateFilter("parentCategory", value);

  const isActive = baseSearch.filters.isActive || "";
  const setIsActive = (value) => baseSearch.updateFilter("isActive", value);

  const minPrice = baseSearch.filters.minPrice || "";
  const setMinPrice = (value) => baseSearch.updateFilter("minPrice", value);

  const maxPrice = baseSearch.filters.maxPrice || "";
  const setMaxPrice = (value) => baseSearch.updateFilter("maxPrice", value);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    clearSearchAndFilterParams(params, config);
    params.delete("page");

    if (baseSearch.searchValue.trim()) {
      const paramName = config.searchFields[baseSearch.searchType];
      if (paramName) params.set(paramName, baseSearch.searchValue.trim());
    }

    Object.entries(baseSearch.filters).forEach(([key, value]) => {
      const filterConfig = config.filterFields[key];
      if (!filterConfig) return;
      if (value && value !== filterConfig.defaultValue) {
        params.set(filterConfig.paramName, value);
      }
    });

    router.push(`${config.basePath}?${params.toString()}`);
  }, [baseSearch.searchType, baseSearch.searchValue, baseSearch.filters, searchParams, router]);

  const getSearchParams = useCallback(() => {
    return baseSearch.getSearchParams();
  }, [baseSearch.getSearchParams]);

  return {
    // Search state
    searchType: baseSearch.searchType,
    setSearchType: baseSearch.setSearchType,
    searchValue: baseSearch.searchValue,
    setSearchValue: baseSearch.setSearchValue,
    
    // Filter state
    category, setCategory,
    parentCategory, setParentCategory,
    isActive, setIsActive,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    
    // Actions
    handleSearch,
    clearSearch: baseSearch.clearSearch,
    getSearchParams,
    
    // Status
    hasActiveSearch: baseSearch.hasActiveSearch,
    hasActiveFilters: !!(category || parentCategory || isActive || minPrice || maxPrice),
  };
}
