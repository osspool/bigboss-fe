import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { posApi } from '@/api/platform/pos-api';
import { toast } from 'sonner';
import type {
  PosProduct,
  PosProductsResponse,
  PosOrderPayload,
  PosLookupResponse,
} from '@/types/pos.types';

// ============================================
// QUERY KEYS
// ============================================

export const POS_KEYS = {
  all: ['pos'] as const,
  products: (branchId?: string) => [...POS_KEYS.all, 'products', branchId] as const,
  productsList: (branchId?: string, params?: Record<string, unknown>) =>
    [...POS_KEYS.products(branchId), params] as const,
  lookup: (code: string, branchId?: string) =>
    [...POS_KEYS.all, 'lookup', code, branchId] as const,
  orders: () => [...POS_KEYS.all, 'orders'] as const,
  receipt: (orderId: string) => [...POS_KEYS.orders(), orderId, 'receipt'] as const,
};

// ============================================
// TYPES
// ============================================

export interface PosProductFilters {
  category?: string;
  search?: string;
  inStockOnly?: boolean;
  lowStockOnly?: boolean;
  after?: string;
  limit?: number;
  sort?: string;
  [key: string]: unknown;
}

export interface PosProductsResult {
  products: PosProduct[];
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
// PRODUCT HOOKS
// ============================================

/**
 * Hook to fetch POS products with branch stock
 * Uses POS API: GET /pos/products
 */
export function usePosProducts(
  token: string,
  branchId: string | undefined,
  filters: PosProductFilters = {},
  options: { enabled?: boolean } = {}
): PosProductsResult {
  const queryKey = POS_KEYS.productsList(branchId, filters);

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
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  return {
    products: data?.docs || [],
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
 * Uses POS API: GET /pos/lookup
 */
export function usePosLookup(
  token: string,
  code: string,
  branchId?: string,
  options: { enabled?: boolean } = {}
) {
  return useQuery<PosLookupResponse>({
    queryKey: POS_KEYS.lookup(code, branchId),
    queryFn: () => posApi.lookup({ token, code, branchId }),
    enabled: !!token && !!code && code.length >= 2 && options.enabled !== false,
    staleTime: 10 * 1000,
    retry: false, // Don't retry failed lookups
  });
}

/**
 * Mutation for barcode/SKU lookup (preferred for "scan → act" flows)
 * Uses POS API: GET /pos/lookup
 */
export function usePosLookupMutation(token: string) {
  return useMutation<PosLookupResponse, Error, { code: string; branchId?: string }>({
    mutationFn: ({ code, branchId }) => posApi.lookup({ token, code, branchId }),
    onError: (error: Error) => {
      toast.error(error.message || 'Lookup failed');
    },
  });
}

/**
 * Hook to get receipt for an order
 * Uses POS API: GET /pos/orders/:id/receipt
 */
export function usePosReceipt(
  token: string,
  orderId: string,
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: POS_KEYS.receipt(orderId),
    queryFn: () => posApi.getReceipt({ token, orderId }),
    enabled: !!token && !!orderId && options.enabled !== false,
    staleTime: Infinity, // Receipts don't change
  });
}

// ============================================
// ORDER MUTATIONS
// ============================================

/**
 * Hook for POS order operations
 */
export function usePosOrders(token: string) {
  const queryClient = useQueryClient();

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (data: PosOrderPayload) =>
      posApi.createOrder({ token, data }),
    onSuccess: (result, variables) => {
      // Invalidate inventory queries for the branch
      queryClient.invalidateQueries({
        queryKey: POS_KEYS.products(variables.branchId),
      });

      toast.success('Order created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });

  return {
    createOrder: createOrderMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate idempotency key for POS orders
 * Format: pos_terminal-{id}_{timestamp}_{counter}
 */
export function generateIdempotencyKey(terminalId?: string): string {
  const terminal = terminalId || 'default';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const counter = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `pos_${terminal}_${timestamp}_${counter}`;
}

/**
 * Calculate price for variant product
 */
export function calculateVariantPrice(basePrice: number, priceModifier: number = 0): number {
  return basePrice + priceModifier;
}

/**
 * Format variant for display
 */
export function formatVariantLabel(attributes?: Record<string, string>): string {
  if (!attributes || Object.keys(attributes).length === 0) return '';
  return Object.entries(attributes)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join(', ');
}

/**
 * Check if product has variants
 */
export function isVariantProduct(product: PosProduct): boolean {
  return product.productType === 'variant' || (!!product.variants && product.variants.length > 0);
}

/**
 * Get available variants for a product
 */
export function getAvailableVariants(product: PosProduct) {
  if (!product.variants) return [];
  return product.variants.filter(v => v.isActive);
}

/**
 * Find variant by SKU
 */
export function findVariantBySku(product: PosProduct, sku: string) {
  if (!product.variants) return null;
  return product.variants.find(v => v.sku === sku) || null;
}

/**
 * Get variant stock for branch
 */
export function getVariantStock(product: PosProduct, variantSku: string): number {
  if (!product.branchStock?.variants) return 0;
  const variantStock = product.branchStock.variants.find(v => v.sku === variantSku);
  return variantStock?.quantity || 0;
}

/**
 * Check if product/variant is in stock
 */
export function isInStock(product: PosProduct, variantSku?: string): boolean {
  if (variantSku) {
    const stock = getVariantStock(product, variantSku);
    return stock > 0;
  }
  return product.branchStock?.inStock ?? false;
}

/**
 * Get product image URL
 */
export function getPosProductImage(product: PosProduct): string {
  const firstImage = product.images?.[0];
  if (!firstImage) return '/placeholder.png';
  return firstImage.variants?.thumbnail || firstImage.url;
}
