"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useBaseSearch } from "./use-base-search";
import { clearSearchAndFilterParams } from "@/lib/filter-utils";

/**
 * Customer order search hook
 * Supports searching by order ID
 * Filters by status only (customers have limited filter options)
 */
export function useMyOrderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const config = useMemo(() => ({
    basePath: "/profile/my-orders",
    searchFields: {
      orderId: "_id",
    },
    filterFields: {
      status: { paramName: "status", type: "string", defaultValue: "" },
    },
    defaultSearchType: "orderId",
  }), []);

  const baseSearch = useBaseSearch(config);

  const status = baseSearch.filters.status || "";
  const setStatus = (value) => baseSearch.updateFilter("status", value);

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
  }, [baseSearch.searchType, baseSearch.searchValue, baseSearch.filters, searchParams, router, config]);

  const getSearchParams = useCallback(() => {
    return baseSearch.getSearchParams();
  }, [baseSearch]);

  return {
    searchType: baseSearch.searchType,
    setSearchType: baseSearch.setSearchType,
    searchValue: baseSearch.searchValue,
    setSearchValue: baseSearch.setSearchValue,
    status,
    setStatus,
    handleSearch,
    clearSearch: baseSearch.clearSearch,
    getSearchParams,
    hasActiveSearch: baseSearch.hasActiveSearch,
    hasActiveFilters: !!status,
  };
}


