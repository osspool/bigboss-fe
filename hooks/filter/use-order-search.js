"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useBaseSearch } from "./use-base-search";
import { clearSearchAndFilterParams } from "@/lib/filter-utils";

/**
 * Admin order search hook
 * Supports searching by order ID, customer phone
 * Filters by status, payment status, date range
 */
export function useOrderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const config = useMemo(() => ({
    basePath: "/dashboard/orders",
    searchFields: {
      orderId: "_id",
      customerPhone: "deliveryAddress.phone",
    },
    filterFields: {
      status: { paramName: "status", type: "string", defaultValue: "" },
      source: { paramName: "source", type: "string", defaultValue: "" },
      paymentStatus: { paramName: "currentPayment.status", type: "string", defaultValue: "" },
      dateFrom: { paramName: "createdAt[gte]", type: "string", defaultValue: "" },
      dateTo: { paramName: "createdAt[lte]", type: "string", defaultValue: "" },
    },
    defaultSearchType: "orderId",
  }), []);

  const baseSearch = useBaseSearch(config);

  // Filter getters
  const status = baseSearch.filters.status || "";
  const source = baseSearch.filters.source || "";
  const paymentStatus = baseSearch.filters.paymentStatus || "";
  const dateFrom = baseSearch.filters.dateFrom || "";
  const dateTo = baseSearch.filters.dateTo || "";

  // Filter setters
  const setStatus = (value) => baseSearch.updateFilter("status", value);
  const setSource = (value) => baseSearch.updateFilter("source", value);
  const setPaymentStatus = (value) => baseSearch.updateFilter("paymentStatus", value);
  const setDateFrom = (value) => baseSearch.updateFilter("dateFrom", value);
  const setDateTo = (value) => baseSearch.updateFilter("dateTo", value);

  // Date range helpers
  const applyDateRange = useCallback((startDate, endDate) => {
    if (startDate) {
      const startStr = startDate.toISOString().split("T")[0];
      baseSearch.updateFilter("dateFrom", startStr);
    }
    if (endDate) {
      const endStr = endDate.toISOString().split("T")[0];
      baseSearch.updateFilter("dateTo", endStr);
    }
  }, [baseSearch]);

  const clearDateRange = useCallback(() => {
    baseSearch.updateFilter("dateFrom", "");
    baseSearch.updateFilter("dateTo", "");
  }, [baseSearch]);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    clearSearchAndFilterParams(params, config);
    params.delete("page");

    // Add search value
    if (baseSearch.searchValue.trim()) {
      const paramName = config.searchFields[baseSearch.searchType];
      if (paramName) params.set(paramName, baseSearch.searchValue.trim());
    }

    // Add filter values
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
    // Search state
    searchType: baseSearch.searchType,
    setSearchType: baseSearch.setSearchType,
    searchValue: baseSearch.searchValue,
    setSearchValue: baseSearch.setSearchValue,

    // Filter state
    status,
    setStatus,
    source,
    setSource,
    paymentStatus,
    setPaymentStatus,
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,

    // Date range
    applyDateRange,
    clearDateRange,

    // Actions
    handleSearch,
    clearSearch: baseSearch.clearSearch,
    getSearchParams,

    // Status
    hasActiveSearch: baseSearch.hasActiveSearch,
    hasActiveFilters: !!status || !!source || !!paymentStatus || !!dateFrom || !!dateTo,
  };
}
