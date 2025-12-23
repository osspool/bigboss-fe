import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { posApi } from '@/api/platform/pos-api';
import { adjustmentApi } from '@/api/inventory';
import { toast } from 'sonner';
import type { PosProduct, PosProductsResponse } from '@/types/pos.types';
import type { AdjustStockPayload, AdjustStockResult, BulkAdjustmentPayload } from '@/types/inventory.types';
import { INVENTORY_KEYS, MOVEMENT_KEYS, LOW_STOCK_KEYS } from './inventory-keys';

// Re-export for backward compatibility
export { INVENTORY_KEYS };

// ============================================
// TYPES
// ============================================

export interface InventoryFilters {
  category?: string;
  search?: string;
  inStockOnly?: boolean;
  lowStockOnly?: boolean;
  outOfStockOnly?: boolean;
  after?: string;
  limit?: number;
  sort?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface InventoryListResult {
  items: PosProduct[];
  summary: PosProductsResponse['summary'];
  branch: PosProductsResponse['branch'];
  hasMore: boolean;
  nextCursor: string | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to fetch inventory products with branch stock
 * Uses POS API: GET /pos/products
 */
export function useInventory(
  token: string,
  branchId: string | undefined,
  filters: InventoryFilters = {},
  options: { enabled?: boolean } = {}
): InventoryListResult {
  const queryKey = INVENTORY_KEYS.productsList(branchId, filters);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      posApi.getProducts({
        token,
        branchId,
        category: filters.category,
        search: filters.search,
        inStockOnly: filters.inStockOnly,
        lowStockOnly: filters.lowStockOnly,
        after: filters.after,
        limit: filters.limit || 50,
        sort: filters.sort || 'name',
      }),
    enabled: !!token && options.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds - inventory changes more frequently
    refetchOnWindowFocus: true,
  });

  return {
    items: data?.docs || [],
    summary: data?.summary || { totalItems: 0, totalQuantity: 0, lowStockCount: 0, outOfStockCount: 0 },
    branch: data?.branch || { _id: '', code: '', name: '' },
    hasMore: data?.hasMore || false,
    nextCursor: data?.next || null,
    isLoading,
    isFetching,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook for barcode/SKU lookup
 */
export function useInventoryLookup(
  token: string,
  code: string,
  branchId?: string,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: INVENTORY_KEYS.lookup(code, branchId),
    queryFn: () => posApi.lookup({ token, code, branchId }),
    enabled: !!token && !!code && code.length >= 2 && options.enabled !== false,
    staleTime: 10 * 1000,
  });
}

/**
 * Hook for stock adjustment actions
 */
export function useStockActions(token: string) {
  const queryClient = useQueryClient();

  /**
   * Invalidate all queries affected by stock adjustments.
   * Adjustments create movements and may change low-stock status.
   */
  const invalidateStockQueries = (branchId?: string) => {
    queryClient.invalidateQueries({
      queryKey: INVENTORY_KEYS.products(branchId),
    });
    queryClient.invalidateQueries({ queryKey: MOVEMENT_KEYS.all });
    queryClient.invalidateQueries({ queryKey: LOW_STOCK_KEYS.all });
  };

  // Single item adjustment
  const adjustMutation = useMutation({
    mutationFn: (data: AdjustStockPayload) =>
      adjustmentApi.adjustStock({ token, data }),
    onSuccess: (result, variables) => {
      invalidateStockQueries(variables.branchId);
      toast.success('Stock adjusted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to adjust stock');
    },
  });

  // Set stock directly
  const setStockMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
      branchId,
      variantSku,
      notes,
    }: {
      productId: string;
      quantity: number;
      branchId?: string;
      variantSku?: string;
      notes?: string;
    }) =>
      adjustmentApi.adjustStock({
        token,
        data: {
          productId,
          quantity,
          branchId,
          variantSku,
          mode: 'set',
          notes,
        },
      }),
    onSuccess: (_, variables) => {
      invalidateStockQueries(variables.branchId);
      toast.success('Stock level updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update stock');
    },
  });

  // Bulk adjustment
  const bulkAdjustMutation = useMutation({
    mutationFn: (data: BulkAdjustmentPayload) =>
      adjustmentApi.create({
        token,
        data: {
          adjustments: data.adjustments,
          branchId: data.branchId,
          reason: data.reason,
        },
      }),
    onSuccess: (result, variables) => {
      invalidateStockQueries(variables.branchId);
      const processed = (result as { data?: AdjustStockResult })?.data?.processed;
      toast.success(
        typeof processed === 'number'
          ? `${processed} items updated`
          : 'Bulk adjustment completed'
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to bulk adjust stock');
    },
  });

  return {
    // Adjust stock (add/remove/set)
    adjust: adjustMutation.mutateAsync,
    isAdjusting: adjustMutation.isPending,

    // Set stock directly
    setStock: setStockMutation.mutateAsync,
    isSettingStock: setStockMutation.isPending,

    // Bulk operations
    bulkAdjust: bulkAdjustMutation.mutateAsync,
    isBulkAdjusting: bulkAdjustMutation.isPending,

    // Combined loading state
    isLoading: adjustMutation.isPending || setStockMutation.isPending || bulkAdjustMutation.isPending,
  };
}

/**
 * Helper to determine stock status
 */
export function getStockStatus(quantity: number, lowThreshold = 10): 'out' | 'low' | 'ok' {
  if (quantity === 0) return 'out';
  if (quantity <= lowThreshold) return 'low';
  return 'ok';
}

/**
 * Helper to format stock status badge props
 */
export function getStockStatusBadge(status: 'out' | 'low' | 'ok') {
  switch (status) {
    case 'out':
      return { variant: 'destructive' as const, label: 'Out of Stock' };
    case 'low':
      return { variant: 'warning' as const, label: 'Low Stock' };
    case 'ok':
      return { variant: 'success' as const, label: 'In Stock' };
  }
}
