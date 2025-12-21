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

export const TRANSFER_KEYS = {
  all: ["inventory", "transfers"] as const,
  list: (params?: Record<string, unknown>) => [...TRANSFER_KEYS.all, "list", params] as const,
  detail: (id: string) => [...TRANSFER_KEYS.all, "detail", id] as const,
};

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

  const create = useMutation({
    mutationFn: (data: CreateTransferPayload) => inventoryApi.createTransfer({ token, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      toast.success("Transfer created");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create transfer"),
  });

  const approve = useMutation({
    mutationFn: (id: string) => inventoryApi.approveTransfer({ token, id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      toast.success("Transfer approved");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to approve transfer"),
  });

  const dispatch = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: DispatchTransferPayload }) =>
      inventoryApi.dispatchTransfer({ token, id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      toast.success("Transfer dispatched");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to dispatch transfer"),
  });

  const inTransit = useMutation({
    mutationFn: (id: string) => inventoryApi.markInTransit({ token, id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      toast.success("Marked in-transit");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to mark in-transit"),
  });

  const receive = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ReceiveTransferPayload }) =>
      inventoryApi.receiveTransfer({ token, id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      toast.success("Transfer received");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to receive transfer"),
  });

  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      inventoryApi.cancelTransfer({ token, id, data: { reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
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
