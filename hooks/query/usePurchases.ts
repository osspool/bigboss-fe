import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inventoryApi } from "@/api/platform/inventory-api";
import { extractDocs } from "@/lib/utils/extract-docs";
import type { RecordPurchasePayload, StockMovement } from "@/types/inventory.types";
import {
  PURCHASE_KEYS,
  INVENTORY_KEYS,
  MOVEMENT_KEYS,
  LOW_STOCK_KEYS,
} from "./inventory-keys";

// Re-export for backward compatibility
export { PURCHASE_KEYS };

export function usePurchaseHistory(
  token: string,
  params?: Record<string, unknown>,
  options: { enabled?: boolean } = {}
) {
  const query = useQuery({
    queryKey: PURCHASE_KEYS.history(params),
    queryFn: () => inventoryApi.purchaseHistory({ token, params }),
    enabled: !!token && options.enabled !== false,
    staleTime: 15 * 1000,
  });

  const docs = useMemo(() => extractDocs<StockMovement>(query.data), [query.data]);

  return {
    history: docs,
    raw: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export function usePurchaseActions(token: string) {
  const queryClient = useQueryClient();

  // Purchase adds stock to head office - invalidate all stock-related queries
  const record = useMutation({
    mutationFn: (data: RecordPurchasePayload) => inventoryApi.recordPurchase({ token, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PURCHASE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: MOVEMENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: LOW_STOCK_KEYS.all });
      toast.success("Purchase recorded");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to record purchase"),
  });

  return {
    record: record.mutateAsync,
    isRecording: record.isPending,
  };
}
