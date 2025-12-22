import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/platform/inventory-api";
import { extractDocs } from "@/lib/utils/extract-docs";
import type { LowStockItem } from "@/types/inventory.types";
import { LOW_STOCK_KEYS } from "./inventory-keys";

// Re-export for backward compatibility
export { LOW_STOCK_KEYS };

/**
 * Hook to fetch low stock items for a branch
 * @param token - Auth token
 * @param params - Filters (branchId, threshold)
 * @param options - React Query options
 */
export function useLowStock(
  token: string,
  params?: { branchId?: string; threshold?: number },
  options: { enabled?: boolean } = {}
) {
  const query = useQuery({
    queryKey: LOW_STOCK_KEYS.list(params),
    queryFn: () => inventoryApi.lowStock({ token, params }),
    enabled: !!token && options.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds
  });

  const docs = useMemo(() => extractDocs<LowStockItem>(query.data), [query.data]);

  return {
    items: docs,
    raw: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
