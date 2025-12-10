"use client";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBaseSearch } from "./use-base-search";
import { clearSearchAndFilterParams } from "@/lib/filter-utils";

export function useTransactionSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const config = {
    basePath: "/dashboard/finance/transactions",
    searchFields: {
      _id: "_id",
    },
    filterFields: {
      type: { paramName: "type", type: "string", defaultValue: "" },
      category: { paramName: "category", type: "string", defaultValue: "" },
      dateFrom: { paramName: "date[gte]", type: "string", defaultValue: "" },
      dateTo: { paramName: "date[lte]", type: "string", defaultValue: "" },
    },
    defaultSearchType: "_id",
  };

  const baseSearch = useBaseSearch(config);

  const type = baseSearch.filters.type || "";
  const setType = (value) => baseSearch.updateFilter("type", value);

  const category = baseSearch.filters.category || "";
  const setCategory = (value) => baseSearch.updateFilter("category", value);

  const dateFrom = baseSearch.filters.dateFrom || "";
  const dateTo = baseSearch.filters.dateTo || "";

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

  const formatDate = (d) => {
    if (!d) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const applyDateRange = useCallback((startDate, endDate) => {
    const params = new URLSearchParams(searchParams);
    clearSearchAndFilterParams(params, config);
    params.delete("page");

    if (baseSearch.searchValue.trim()) {
      const paramName = config.searchFields[baseSearch.searchType];
      if (paramName) params.set(paramName, baseSearch.searchValue.trim());
    }

    Object.entries(baseSearch.filters).forEach(([key, value]) => {
      if (key === 'dateFrom' || key === 'dateTo') return;
      const filterConfig = config.filterFields[key];
      if (!filterConfig) return;
      if (value && value !== filterConfig.defaultValue) {
        params.set(filterConfig.paramName, value);
      }
    });

    const fromStr = startDate ? formatDate(startDate) : "";
    const toStr = endDate ? formatDate(endDate) : "";
    if (fromStr) params.set(config.filterFields.dateFrom.paramName, fromStr);
    if (toStr) params.set(config.filterFields.dateTo.paramName, toStr);

    // Update local filter state so UI reflects selection immediately
    baseSearch.updateFilter('dateFrom', fromStr);
    baseSearch.updateFilter('dateTo', toStr);

    router.push(`${config.basePath}?${params.toString()}`);
  }, [searchParams, router, baseSearch.searchType, baseSearch.searchValue, baseSearch.filters, baseSearch.updateFilter]);

  const clearDateRange = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    clearSearchAndFilterParams(params, config);
    params.delete("page");

    if (baseSearch.searchValue.trim()) {
      const paramName = config.searchFields[baseSearch.searchType];
      if (paramName) params.set(paramName, baseSearch.searchValue.trim());
    }
    Object.entries(baseSearch.filters).forEach(([key, value]) => {
      if (key === 'dateFrom' || key === 'dateTo') return;
      const filterConfig = config.filterFields[key];
      if (!filterConfig) return;
      if (value && value !== filterConfig.defaultValue) {
        params.set(filterConfig.paramName, value);
      }
    });

    // Update local filter state so UI clears immediately
    baseSearch.updateFilter('dateFrom', "");
    baseSearch.updateFilter('dateTo', "");

    router.push(`${config.basePath}?${params.toString()}`);
  }, [searchParams, router, baseSearch.searchType, baseSearch.searchValue, baseSearch.filters, baseSearch.updateFilter]);

  return {
    searchType: baseSearch.searchType,
    setSearchType: baseSearch.setSearchType,
    searchValue: baseSearch.searchValue,
    setSearchValue: baseSearch.setSearchValue,
    type, setType,
    category, setCategory,
    dateFrom, dateTo,
    handleSearch,
    clearSearch: baseSearch.clearSearch,
    getSearchParams,
    applyDateRange,
    clearDateRange,
    hasActiveSearch: baseSearch.hasActiveSearch,
    hasActiveFilters: !!type || !!category || !!dateFrom || !!dateTo,
  };
}


