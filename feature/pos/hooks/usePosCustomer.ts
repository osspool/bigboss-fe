"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useCustomers } from "@/hooks/query";
import { buildFilterParams, getApiParams } from "@/lib/filter-utils";
import { isPhoneSearch } from "../utils";
import type { Customer } from "@/types";

export interface UsePosCustomerReturn {
  // Selected customer state
  selectedCustomer: Customer | null;
  customerName: string;
  customerPhone: string;
  membershipCardId: string;
  membershipLookupStatus: "idle" | "searching" | "found" | "not_found";
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
  setMembershipCardId: (value: string) => void;
  setCustomerSearch: (value: string) => void;
  setCreateDialogOpen: (open: boolean) => void;
  setLookupDialogOpen: (open: boolean) => void;
  selectCustomer: (customer: Customer) => void;
  clearCustomer: () => void;
  handleCustomerCreated: (customer: Customer) => void;
  triggerSearch: () => void;
  triggerMembershipLookup: () => void;
  resetCustomer: () => void;
}

export function usePosCustomer(token: string): UsePosCustomerReturn {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerName, setCustomerNameState] = useState("");
  const [customerPhone, setCustomerPhoneState] = useState("");
  const [membershipCardId, setMembershipCardIdState] = useState("");
  const [membershipLookupStatus, setMembershipLookupStatus] = useState<
    "idle" | "searching" | "found" | "not_found"
  >("idle");
  const [customerSearch, setCustomerSearch] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [membershipSearchApplied, setMembershipSearchApplied] = useState("");
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
  } = useCustomers(token, queryParams as Record<string, unknown>, {
    enabled: !!token && normalizedSearch.length >= 2,
    refetchOnWindowFocus: false,
  });

  const customerResults = useMemo(
    () => (normalizedSearch.length >= 2 ? ((customerResultsRaw || []) as Customer[]) : []),
    [customerResultsRaw, normalizedSearch.length]
  );

  const membershipParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "1");

    if (!membershipSearchApplied) {
      return getApiParams(params);
    }

    const filterParams = buildFilterParams(
      { membershipCardId: membershipSearchApplied },
      { membershipCardId: { paramName: "membership.cardId", type: "string", defaultValue: "" } }
    );
    for (const [key, value] of filterParams) {
      params.set(key, value);
    }

    return getApiParams(params);
  }, [membershipSearchApplied]);

  const {
    items: membershipResultsRaw,
    isLoading: membershipLoading,
    isFetching: membershipFetching,
    refetch: refetchMembership,
  } = useCustomers(token, membershipParams as Record<string, unknown>, {
    enabled: !!token && membershipSearchApplied.length >= 4,
    refetchOnWindowFocus: false,
  });

  const membershipResults = useMemo(
    () => (membershipSearchApplied.length >= 4 ? ((membershipResultsRaw || []) as Customer[]) : []),
    [membershipResultsRaw, membershipSearchApplied.length]
  );

  const setCustomerName = useCallback((value: string) => {
    setCustomerNameState(value);
    if (selectedCustomer) setSelectedCustomer(null);
  }, [selectedCustomer]);

  const setCustomerPhone = useCallback((value: string) => {
    setCustomerPhoneState(value);
    if (selectedCustomer) setSelectedCustomer(null);
  }, [selectedCustomer]);

  const setMembershipCardId = useCallback((value: string) => {
    setMembershipCardIdState(value);
    if (!value.trim()) {
      setMembershipSearchApplied("");
    }
    setMembershipLookupStatus("idle");
  }, []);

  const selectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerNameState(customer.name || "");
    setCustomerPhoneState(customer.phone || "");
    setMembershipCardIdState(customer.membership?.cardId || "");
    setMembershipLookupStatus(customer.membership?.cardId ? "found" : "idle");
    setCustomerSearch("");
    setSearchApplied("");
    setLookupDialogOpen(false);
  }, []);

  const clearCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerNameState("");
    setCustomerPhoneState("");
    setMembershipCardIdState("");
    setMembershipLookupStatus("idle");
    setCustomerSearch("");
    setSearchApplied("");
    setMembershipSearchApplied("");
  }, []);

  const handleCustomerCreated = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerNameState(customer.name || "");
    setCustomerPhoneState(customer.phone || "");
    setMembershipCardIdState(customer.membership?.cardId || "");
    setMembershipLookupStatus(customer.membership?.cardId ? "found" : "idle");
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

  const triggerMembershipLookup = useCallback(() => {
    const trimmed = membershipCardId.trim();
    if (!trimmed) {
      setMembershipSearchApplied("");
      setMembershipLookupStatus("idle");
      return;
    }
    if (trimmed === membershipSearchApplied) {
      setMembershipLookupStatus("searching");
      refetchMembership();
      return;
    }
    setMembershipLookupStatus("searching");
    setMembershipSearchApplied(trimmed);
  }, [membershipCardId, membershipSearchApplied, refetchMembership]);

  useEffect(() => {
    if (!membershipSearchApplied) return;
    if (membershipLoading || membershipFetching) return;

    if (membershipResults.length > 0) {
      selectCustomer(membershipResults[0]);
      setMembershipLookupStatus("found");
      return;
    }

    setMembershipLookupStatus("not_found");
    toast.error("Membership card not found");
  }, [
    membershipSearchApplied,
    membershipResults,
    membershipLoading,
    membershipFetching,
    selectCustomer,
  ]);

  const resetCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerNameState("");
    setCustomerPhoneState("");
    setMembershipCardIdState("");
    setMembershipLookupStatus("idle");
    setCustomerSearch("");
    setSearchApplied("");
    setMembershipSearchApplied("");
  }, []);

  return {
    selectedCustomer,
    customerName,
    customerPhone,
    membershipCardId,
    membershipLookupStatus,
    customerSearch,
    customerResults,
    isSearching: customersLoading || customersFetching,
    createDialogOpen,
    lookupDialogOpen,
    setCustomerName,
    setCustomerPhone,
    setMembershipCardId,
    setCustomerSearch,
    setCreateDialogOpen,
    setLookupDialogOpen,
    selectCustomer,
    clearCustomer,
    handleCustomerCreated,
    triggerSearch,
    triggerMembershipLookup,
    resetCustomer,
  };
}
