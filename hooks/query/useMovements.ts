import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/platform/inventory-api";
import { extractDocs } from "@/lib/utils/extract-docs";
import type { StockMovement } from "@/types/inventory.types";

export const MOVEMENT_KEYS = {
  all: ["inventory", "movements"] as const,
  list: (params?: Record<string, unknown>) => [...MOVEMENT_KEYS.all, "list", params] as const,
};

export function useMovements(
  token: string,
  params?: Record<string, unknown>,
  options: { enabled?: boolean } = {}
) {
  const query = useQuery({
    queryKey: MOVEMENT_KEYS.list(params),
    queryFn: () => inventoryApi.movements({ token, params }),
    enabled: !!token && options.enabled !== false,
    staleTime: 15 * 1000,
  });

  const docs = useMemo(() => extractDocs<StockMovement>(query.data), [query.data]);

  return {
    movements: docs,
    raw: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
