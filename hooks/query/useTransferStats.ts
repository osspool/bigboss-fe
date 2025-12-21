import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/platform/inventory-api";
import type { TransferStats } from "@/types/inventory.types";

export const TRANSFER_STATS_KEYS = {
  all: ["inventory", "transfers", "stats"] as const,
  byBranch: (branchId?: string) => [...TRANSFER_STATS_KEYS.all, branchId] as const,
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
