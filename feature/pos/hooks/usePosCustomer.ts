"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useCustomers } from "@/hooks/query/useCustomers";
import { buildFilterParams, getApiParams } from "@/lib/filter-utils";
import { isPhoneSearch } from "../utils";
import type { Customer } from "@/types/customer.types";

export interface UsePosCustomerReturn {
  // Selected customer state
  selectedCustomer: Customer | null;
  customerName: string;
  customerPhone: string;
  // Search state
  customerSearch: string;
  customerResults: Customer[];
  isSearching: boolean;
  // Dialog state
  createDialogOpen: boolean;
  lookupDialogOpen: boolean;
  // Actions
  setCustomerName: (value: string) => void;
  setCustomerPhone: (value: string) => void;
  setCustomerSearch: (value: string) => void;
  setCreateDialogOpen: (open: boolean) => void;
  setLookupDialogOpen: (open: boolean) => void;
  selectCustomer: (customer: Customer) => void;
  clearCustomer: () => void;
  handleCustomerCreated: (customer: Customer) => void;
  triggerSearch: () => void;
  resetCustomer: () => void;
}

export function usePosCustomer(token: string): UsePosCustomerReturn {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerNameState] = useState("");
  const [customerPhone, setCustomerPhoneState] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [lookupDialogOpen, setLookupDialogOpen] = useState(false);

  const normalizedSearch = searchApplied.trim();
  const phoneCheck = isPhoneSearch(normalizedSearch);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "5");

    if (!normalizedSearch) {
      return getApiParams(params);
    }

    if (phoneCheck.exact) {
      const filterParams = buildFilterParams(
        { phone: normalizedSearch },
        { phone: { paramName: "phone", type: "string", defaultValue: "" } }
      );
      for (const [key, value] of filterParams) {
        params.set(key, value);
      }
    } else if (phoneCheck.likely) {
      const phoneParams = buildFilterParams(
        { phone: normalizedSearch },
        { phone: { paramName: "phone[contains]", type: "string", defaultValue: "" } }
      );
      for (const [key, value] of phoneParams) {
        params.set(key, value);
      }
    } else {
      const nameParams = buildFilterParams(
        { name: normalizedSearch },
        { name: { paramName: "name[contains]", type: "string", defaultValue: "" } }
      );
      for (const [key, value] of nameParams) {
        params.set(key, value);
      }
    }

    return getApiParams(params);
  }, [normalizedSearch, phoneCheck.exact, phoneCheck.likely]);

  const {
    items: customerResultsRaw,
    isLoading: customersLoading,
    isFetching: customersFetching,
    refetch: refetchCustomers,
  } = useCustomers(token, queryParams, {
    enabled: !!token && normalizedSearch.length >= 2,
    refetchOnWindowFocus: false,
  });

  const customerResults = useMemo(
    () => (normalizedSearch.length >= 2 ? ((customerResultsRaw || []) as Customer[]) : []),
    [customerResultsRaw, normalizedSearch.length]
  );

  const setCustomerName = useCallback((value: string) => {
    setCustomerNameState(value);
    if (selectedCustomer) setSelectedCustomer(null);
  }, [selectedCustomer]);

  const setCustomerPhone = useCallback((value: string) => {
    setCustomerPhoneState(value);
    if (selectedCustomer) setSelectedCustomer(null);
  }, [selectedCustomer]);

  const selectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerNameState(customer.name || "");
    setCustomerPhoneState(customer.phone || "");
    setCustomerSearch("");
    setSearchApplied("");
    setLookupDialogOpen(false);
  }, []);

  const clearCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerNameState("");
    setCustomerPhoneState("");
    setCustomerSearch("");
    setSearchApplied("");
  }, []);

  const handleCustomerCreated = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerNameState(customer.name || "");
    setCustomerPhoneState(customer.phone || "");
    setCustomerSearch("");
    setSearchApplied("");
    setLookupDialogOpen(false);
  }, []);

  const triggerSearch = useCallback(() => {
    const trimmed = customerSearch.trim();
    if (trimmed.length < 2) {
      toast.error("Enter at least 2 characters to search");
      return;
    }
    setSearchApplied(trimmed);
    if (trimmed === searchApplied) {
      refetchCustomers();
    }
  }, [customerSearch, searchApplied, refetchCustomers]);

  const resetCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerNameState("");
    setCustomerPhoneState("");
    setCustomerSearch("");
    setSearchApplied("");
  }, []);

  return {
    selectedCustomer,
    customerName,
    customerPhone,
    customerSearch,
    customerResults,
    isSearching: customersLoading || customersFetching,
    createDialogOpen,
    lookupDialogOpen,
    setCustomerName,
    setCustomerPhone,
    setCustomerSearch,
    setCreateDialogOpen,
    setLookupDialogOpen,
    selectCustomer,
    clearCustomer,
    handleCustomerCreated,
    triggerSearch,
    resetCustomer,
  };
}
