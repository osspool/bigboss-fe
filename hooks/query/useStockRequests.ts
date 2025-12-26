import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { requestApi } from "@/api/inventory";
import { extractDocs } from "@/lib/utils/extract-docs";
import type { CreateStockRequestPayload, StockRequest } from "@/types/inventory.types";
import { REQUEST_KEYS, TRANSFER_KEYS } from "./inventory-keys";

// Re-export for backward compatibility
export { REQUEST_KEYS };

export function useStockRequests(
  token: string,
  params?: Record<string, unknown>,
  options: { enabled?: boolean } = {}
) {
  const query = useQuery({
    queryKey: REQUEST_KEYS.list(params),
    queryFn: () => requestApi.list({ token, params }),
    enabled: !!token && options.enabled !== false,
    staleTime: 15 * 1000,
  });

  const docs = useMemo(() => extractDocs<StockRequest>(query.data), [query.data]);

  return {
    requests: docs,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export function usePendingStockRequests(token: string, options: { enabled?: boolean } = {}) {
  const query = useQuery({
    queryKey: REQUEST_KEYS.pending(),
    queryFn: () => requestApi.listPending({ token }),
    enabled: !!token && options.enabled !== false,
    staleTime: 15 * 1000,
  });

  const docs = useMemo(() => extractDocs<StockRequest>(query.data), [query.data]);

  return {
    requests: docs,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export function useStockRequestActions(token: string) {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: CreateStockRequestPayload) => requestApi.create({ token, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_KEYS.all });
      toast.success("Stock request created");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create request"),
  });

  const approve = useMutation({
    mutationFn: ({
      id,
      items,
      reviewNotes,
      notes,
    }: {
      id: string;
      items?: { productId: string; variantSku?: string; quantityApproved: number }[];
      reviewNotes?: string;
      notes?: string;
    }) => requestApi.approve({ token, id, items, reviewNotes, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_KEYS.all });
      toast.success("Request approved");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to approve request"),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      requestApi.reject({ token, id, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_KEYS.all });
      toast.success("Request rejected");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to reject request"),
  });

  // Fulfill creates a transfer (challan) - invalidate both requests and transfers
  const fulfill = useMutation({
    mutationFn: ({
      id,
      remarks,
      items,
    }: {
      id: string;
      remarks?: string;
      items?: { productId: string; variantSku?: string; quantity: number }[];
    }) =>
      requestApi.fulfill({
        token,
        id,
        remarks,
        items,
        documentType: "delivery_challan",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      toast.success("Request fulfilled (transfer created)");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to fulfill request"),
  });

  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      requestApi.cancel({ token, id, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_KEYS.all });
      toast.success("Request cancelled");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to cancel request"),
  });

  return {
    create: create.mutateAsync,
    isCreating: create.isPending,
    approve: approve.mutateAsync,
    isApproving: approve.isPending,
    reject: reject.mutateAsync,
    isRejecting: reject.isPending,
    fulfill: fulfill.mutateAsync,
    isFulfilling: fulfill.isPending,
    cancel: cancel.mutateAsync,
    isCancelling: cancel.isPending,
  };
}
