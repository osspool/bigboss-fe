"use client";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBaseSearch } from "@classytic/clarity";
import { clearSearchAndFilterParams } from "@/lib/filter-utils";

export function useCouponSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const config = {
    basePath: "/dashboard/coupons",
    searchFields: {
      code: "code",
    },
    filterFields: {
      discountType: { paramName: "discountType", type: "string", defaultValue: "" },
      isActive: { paramName: "isActive", type: "string", defaultValue: "" },
    },
    defaultSearchType: "code",
  };

  const baseSearch = useBaseSearch(config);

  const discountType = baseSearch.filters.discountType || "";
  const setDiscountType = (value) => baseSearch.updateFilter("discountType", value);

  const isActive = baseSearch.filters.isActive || "";
  const setIsActive = (value) => baseSearch.updateFilter("isActive", value);

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
    discountType, setDiscountType,
    isActive, setIsActive,
    handleSearch,
    clearSearch: baseSearch.clearSearch,
    getSearchParams,
    hasActiveSearch: baseSearch.hasActiveSearch,
    hasActiveFilters: !!(discountType || isActive),
  };
}
