import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { movementApi } from "@/api/inventory";
import { extractDocs, extractPagination } from "@/lib/utils/extract-docs";
import type { StockMovement, MovementQueryParams } from "@/types/inventory.types";
import { MOVEMENT_KEYS } from "./inventory-keys";

// Re-export for backward compatibility
export { MOVEMENT_KEYS };

export function useMovements(
  token: string,
  params?: MovementQueryParams,
  options: { enabled?: boolean } = {}
) {
  const query = useQuery({
    queryKey: MOVEMENT_KEYS.list(params as Record<string, unknown>),
    queryFn: () => movementApi.list({ token, params }),
    enabled: !!token && options.enabled !== false,
    staleTime: 15 * 1000,
  });

  const docs = useMemo(() => extractDocs<StockMovement>(query.data), [query.data]);
  const pagination = useMemo(() => extractPagination(query.data), [query.data]);

  return {
    movements: docs,
    pagination,
    raw: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
