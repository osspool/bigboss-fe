"use client";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBaseSearch } from "./use-base-search";
import { clearSearchAndFilterParams } from "@/lib/filter-utils";

export function useCategorySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const config = {
    basePath: "/dashboard/categories",
    searchFields: {
      name: "name[like]",
    },
    filterFields: {
      isActive: { paramName: "isActive", type: "boolean", defaultValue: "" },
      parent: { paramName: "parent", type: "string", defaultValue: "" },
    },
    defaultSearchType: "name",
  };

  const baseSearch = useBaseSearch(config);

  // Filter getters and setters
  const isActive = baseSearch.filters.isActive || "";
  const setIsActive = (value) => baseSearch.updateFilter("isActive", value);

  const parent = baseSearch.filters.parent || "";
  const setParent = (value) => baseSearch.updateFilter("parent", value);

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
    searchType: baseSearch.searchType,
    setSearchType: baseSearch.setSearchType,
    searchValue: baseSearch.searchValue,
    setSearchValue: baseSearch.setSearchValue,
    isActive, setIsActive,
    parent, setParent,
    handleSearch,
    clearSearch: baseSearch.clearSearch,
    getSearchParams,
    hasActiveSearch: baseSearch.hasActiveSearch,
    hasActiveFilters: !!isActive || !!parent,
  };
}
