import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inventoryApi } from "@/api/platform/inventory-api";
import { extractDocs } from "@/lib/utils/extract-docs";
import type {
  CreateTransferPayload,
  DispatchTransferPayload,
  ReceiveTransferPayload,
  Transfer,
} from "@/types/inventory.types";
import {
  TRANSFER_KEYS,
  INVENTORY_KEYS,
  MOVEMENT_KEYS,
  LOW_STOCK_KEYS,
} from "./inventory-keys";

// Re-export for backward compatibility
export { TRANSFER_KEYS };

export function useTransfers(
  token: string,
  params?: Record<string, unknown>,
  options: { enabled?: boolean } = {}
) {
  const query = useQuery({
    queryKey: TRANSFER_KEYS.list(params),
    queryFn: () => inventoryApi.listTransfers({ token, params }),
    enabled: !!token && options.enabled !== false,
    staleTime: 15 * 1000,
  });

  const docs = useMemo(() => extractDocs<Transfer>(query.data), [query.data]);

  return {
    transfers: docs,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export function useTransferDetail(token: string, id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: TRANSFER_KEYS.detail(id),
    queryFn: () => inventoryApi.getTransfer({ token, id }),
    enabled: !!token && !!id && options.enabled !== false,
    staleTime: 10 * 1000,
  });
}

export function useTransferActions(token: string) {
  const queryClient = useQueryClient();

  /**
   * Invalidate transfer-only queries (no stock impact)
   */
  const invalidateTransferQueries = () => {
    queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
  };

  /**
   * Invalidate all queries affected by stock changes.
   * Called on dispatch (decrements sender) and receive (increments receiver).
   */
  const invalidateStockQueries = () => {
    queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
    queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
    queryClient.invalidateQueries({ queryKey: MOVEMENT_KEYS.all });
    queryClient.invalidateQueries({ queryKey: LOW_STOCK_KEYS.all });
  };

  const create = useMutation({
    mutationFn: (data: CreateTransferPayload) => inventoryApi.createTransfer({ token, data }),
    onSuccess: () => {
      invalidateTransferQueries();
      toast.success("Transfer created");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create transfer"),
  });

  const approve = useMutation({
    mutationFn: (id: string) => inventoryApi.approveTransfer({ token, id }),
    onSuccess: () => {
      invalidateTransferQueries();
      toast.success("Transfer approved");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to approve transfer"),
  });

  // Dispatch decrements sender stock
  const dispatch = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: DispatchTransferPayload }) =>
      inventoryApi.dispatchTransfer({ token, id, data }),
    onSuccess: () => {
      invalidateStockQueries();
      toast.success("Transfer dispatched");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to dispatch transfer"),
  });

  const inTransit = useMutation({
    mutationFn: (id: string) => inventoryApi.markInTransit({ token, id }),
    onSuccess: () => {
      invalidateTransferQueries();
      toast.success("Marked in-transit");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to mark in-transit"),
  });

  // Receive increments receiver stock
  const receive = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ReceiveTransferPayload }) =>
      inventoryApi.receiveTransfer({ token, id, data }),
    onSuccess: () => {
      invalidateStockQueries();
      toast.success("Transfer received");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to receive transfer"),
  });

  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      inventoryApi.cancelTransfer({ token, id, data: { reason } }),
    onSuccess: () => {
      invalidateTransferQueries();
      toast.success("Transfer cancelled");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to cancel transfer"),
  });

  return {
    create: create.mutateAsync,
    isCreating: create.isPending,

    approve: approve.mutateAsync,
    isApproving: approve.isPending,

    dispatch: dispatch.mutateAsync,
    isDispatching: dispatch.isPending,

    inTransit: inTransit.mutateAsync,
    isMarkingInTransit: inTransit.isPending,

    receive: receive.mutateAsync,
    isReceiving: receive.isPending,

    cancel: cancel.mutateAsync,
    isCancelling: cancel.isPending,
  };
}
