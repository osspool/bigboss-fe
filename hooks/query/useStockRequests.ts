import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inventoryApi } from "@/api/platform/inventory-api";
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
    queryFn: () => inventoryApi.listRequests({ token, params }),
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
    queryFn: () => inventoryApi.listPendingRequests({ token }),
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
    mutationFn: (data: CreateStockRequestPayload) => inventoryApi.createRequest({ token, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_KEYS.all });
      toast.success("Stock request created");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create request"),
  });

  const approve = useMutation({
    mutationFn: ({ id, reviewNotes }: { id: string; reviewNotes?: string }) =>
      inventoryApi.approveRequest({ token, id, data: { reviewNotes } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_KEYS.all });
      toast.success("Request approved");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to approve request"),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      inventoryApi.rejectRequest({ token, id, data: { reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_KEYS.all });
      toast.success("Request rejected");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to reject request"),
  });

  // Fulfill creates a transfer (challan) - invalidate both requests and transfers
  const fulfill = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      inventoryApi.fulfillRequest({ token, id, data: { remarks, documentType: "delivery_challan" } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUEST_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      toast.success("Request fulfilled (transfer created)");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to fulfill request"),
  });

  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      inventoryApi.cancelRequest({ token, id, data: { reason } }),
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
