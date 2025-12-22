import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/platform/inventory-api";
import type { TransferStats } from "@/types/inventory.types";
import { TRANSFER_KEYS } from "./inventory-keys";

// Re-export with backward-compatible name
export const TRANSFER_STATS_KEYS = {
  all: TRANSFER_KEYS.stats,
  byBranch: TRANSFER_KEYS.statsByBranch,
};

/**
 * Hook to fetch transfer statistics
 * @param token - Auth token
 * @param branchId - Optional branch filter
 * @param options - React Query options
 */
export function useTransferStats(
  token: string,
  branchId?: string,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: TRANSFER_STATS_KEYS.byBranch(branchId),
    queryFn: () => inventoryApi.transferStats({ token, params: branchId ? { branchId } : {} }),
    enabled: !!token && options.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds
    select: (data) => data?.data as TransferStats,
  });
}
