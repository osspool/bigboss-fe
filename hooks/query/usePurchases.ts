import { useMemo, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { purchaseApi } from "@/api/inventory";
import { extractDocs, extractPagination } from "@/lib/utils/extract-docs";
import type {
  Purchase,
  CreatePurchasePayload,
  UpdatePurchasePayload,
} from "@/types/inventory.types";
import {
  PURCHASE_KEYS,
  getPurchaseStateInvalidationKeys,
} from "./inventory-keys";

// Re-export for backward compatibility
export { PURCHASE_KEYS };

// ============================================
// LIST PURCHASES
// ============================================

/**
 * Hook to list purchases with filtering and pagination
 *
 * @param token - Auth token
 * @param params - Query parameters (status, paymentStatus, supplier, page, limit, etc.)
 * @param options - Query options
 * @returns Paginated list of purchases
 *
 * @example
 * const { items, pagination, isLoading } = usePurchases(token, {
 *   status: 'received',
 *   paymentStatus: 'unpaid',
 *   page: 1,
 *   limit: 20
 * });
 */
export function usePurchases(
  token: string,
  params?: Record<string, unknown>,
  options: { enabled?: boolean } = {}
) {
  const query = useQuery({
    queryKey: PURCHASE_KEYS.list(params),
    queryFn: () => purchaseApi.getAll({ token, params }),
    enabled: !!token && options.enabled !== false,
    staleTime: 15 * 1000,
  });

  const docs = useMemo(() => extractDocs<Purchase>(query.data), [query.data]);
  const pagination = useMemo(() => extractPagination(query.data), [query.data]);

  return {
    items: docs,
    pagination,
    raw: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

// ============================================
// GET SINGLE PURCHASE
// ============================================

/**
 * Hook to get a single purchase by ID
 *
 * @param token - Auth token
 * @param id - Purchase ID
 * @param options - Query options
 * @returns Purchase details
 */
export function usePurchase(
  token: string,
  id: string,
  options: { enabled?: boolean } = {}
) {
  const query = useQuery({
    queryKey: PURCHASE_KEYS.detail(id),
    queryFn: () => purchaseApi.getById({ token, id }),
    enabled: !!token && !!id && options.enabled !== false,
    staleTime: 30 * 1000,
  });

  return {
    purchase: query.data?.data,
    raw: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

// ============================================
// PURCHASE MUTATIONS (CRUD + Actions)
// ============================================

/**
 * Hook providing all purchase mutations
 *
 * @param token - Auth token
 * @returns Mutation functions for create, update, receive, pay, cancel
 *
 * @example
 * const { create, receive, pay, cancel, isCreating, isReceiving } = usePurchaseActions(token);
 *
 * // Create a draft purchase
 * await create.mutateAsync({
 *   supplierId: 'supplier_id',
 *   items: [{ productId: '...', quantity: 10, costPrice: 250 }],
 *   paymentTerms: 'credit',
 *   creditDays: 15
 * });
 *
 * // Receive the purchase (creates stock movements)
 * await receive.mutateAsync(purchaseId);
 *
 * // Record a payment
 * await pay.mutateAsync({ id: purchaseId, amount: 1000, method: 'cash' });
 */
export function usePurchaseActions(token: string) {
  const queryClient = useQueryClient();

  // Helper to invalidate all related queries
  const invalidateAll = useCallback(() => {
    const keys = getPurchaseStateInvalidationKeys();
    keys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient]);

  // Create purchase (draft)
  const create = useMutation({
    mutationFn: (data: CreatePurchasePayload) =>
      purchaseApi.create({ token, data }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Purchase created");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create purchase"),
  });

  // Update draft purchase
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchasePayload }) =>
      purchaseApi.update({ token, id, data }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Purchase updated");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update purchase"),
  });

  // Receive purchase (creates stock movements)
  const receive = useMutation({
    mutationFn: (id: string) => purchaseApi.receive({ token, id }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Purchase received - stock added");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to receive purchase"),
  });

  // Record payment
  const pay = useMutation({
    mutationFn: ({
      id,
      amount,
      method,
      reference,
    }: {
      id: string;
      amount: number;
      method: string;
      reference?: string;
    }) => purchaseApi.pay({ token, id, amount, method, reference }),
    onSuccess: (data) => {
      invalidateAll();
      const status = data?.data?.paymentStatus;
      toast.success(
        status === "paid" ? "Payment complete" : "Payment recorded"
      );
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to record payment"),
  });

  // Cancel purchase
  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      purchaseApi.cancel({ token, id, reason }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Purchase cancelled");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to cancel purchase"),
  });

  // Legacy: record purchase (create + auto-receive)
  const record = useMutation({
    mutationFn: (data: CreatePurchasePayload) =>
      purchaseApi.recordPurchase({ token, data }),
    onSuccess: () => {
      invalidateAll();
      toast.success("Purchase recorded");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to record purchase"),
  });

  return {
    // Mutations
    create,
    update,
    receive,
    pay,
    cancel,
    record, // Legacy

    // Async functions for convenience
    createAsync: create.mutateAsync,
    updateAsync: update.mutateAsync,
    receiveAsync: receive.mutateAsync,
    payAsync: pay.mutateAsync,
    cancelAsync: cancel.mutateAsync,
    recordAsync: record.mutateAsync, // Legacy

    // Loading states
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isReceiving: receive.isPending,
    isPaying: pay.isPending,
    isCancelling: cancel.isPending,
    isRecording: record.isPending, // Legacy
  };
}

// ============================================
// LEGACY HOOKS (Backward Compatibility)
// ============================================

/**
 * @deprecated Use usePurchases instead
 */
export function usePurchaseHistory(
  token: string,
  params?: Record<string, unknown>,
  options: { enabled?: boolean } = {}
) {
  // Redirect to new list endpoint with status filter
  const query = useQuery({
    queryKey: PURCHASE_KEYS.history(params),
    queryFn: () =>
      purchaseApi.getAll({ token, params: { ...params, status: "received" } }),
    enabled: !!token && options.enabled !== false,
    staleTime: 15 * 1000,
  });

  const docs = useMemo(() => extractDocs<Purchase>(query.data), [query.data]);

  return {
    history: docs,
    raw: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
