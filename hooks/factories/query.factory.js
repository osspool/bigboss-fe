import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const DEFAULT_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
  refetchOnWindowFocus: false,
  retry: 1,
};

export function createListQuery({
  queryKey,
  queryFn,
  enabled = true,
  options = {},
  prefillDetailCache = true, // Enable detail cache prefilling by default
  detailKeyBuilder, // Optional: function to build detail query key from item
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    ...DEFAULT_QUERY_CONFIG,
    ...options,
    placeholderData: (previousData) => previousData,
  });

  const items = query.data?.docs || query.data?.data || query.data || [];

  // Normalize pagination to the new API shape (total/pages/page/hasNext/hasPrev)
  // while keeping backward compatibility with existing consumers.
  const hasPagination = query.data?.total != null || query.data?.totalDocs != null;
  const pagination = hasPagination
    ? {
        // New canonical shape
        total: query.data.total ?? query.data.totalDocs ?? 0,
        pages: query.data.pages ?? query.data.totalPages ?? 1,
        page: query.data.page ?? query.data.currentPage ?? 1,
        limit: query.data.limit ?? 10,
        hasNext: query.data.hasNext ?? query.data.hasNextPage ?? false,
        hasPrev: query.data.hasPrev ?? query.data.hasPrevPage ?? false,
        // Legacy aliases for gradual migration
        totalDocs: query.data.totalDocs ?? query.data.total ?? 0,
        totalPages: query.data.totalPages ?? query.data.pages ?? 1,
        currentPage: query.data.currentPage ?? query.data.page ?? 1,
        hasNextPage: query.data.hasNextPage ?? query.data.hasNext ?? false,
        hasPrevPage: query.data.hasPrevPage ?? query.data.hasPrev ?? false,
      }
    : null;

  // Prefill detail cache with list items to avoid redundant API calls
  useEffect(() => {
    if (prefillDetailCache && items.length > 0 && detailKeyBuilder) {
      items.forEach((item) => {
        const id = getItemId(item);
        if (id) {
          const detailKey = detailKeyBuilder(id);
          queryClient.setQueryData(detailKey, { data: item });
        }
      });
    }
  }, [items, prefillDetailCache, detailKeyBuilder, queryClient]);

  return {
    items,
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    data: query.data,
  };
}

export function createDetailQuery({
  queryKey,
  queryFn,
  enabled = true,
  options = {},
}) {
  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    ...DEFAULT_QUERY_CONFIG,
    ...options,
  });

  const item = query.data?.data || query.data || null;

  return {
    item,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    data: query.data,
  };
}

export function updateListCache(listData, updater) {
  if (!listData) return listData;

  if (typeof listData === 'object' && listData.docs) {
    const updatedDocs = updater(listData.docs);
    const updatedCount = Array.isArray(updatedDocs) ? updatedDocs.length : listData.totalDocs;
    return {
      ...listData,
      docs: updatedDocs,
      totalDocs: updatedCount,
      total: listData.total ?? updatedCount,
    };
  }

  if (Array.isArray(listData)) {
    return updater(listData);
  }

  if (listData.data && Array.isArray(listData.data)) {
    return {
      ...listData,
      data: updater(listData.data),
    };
  }

  return listData;
}

export function getItemId(item) {
  return item?._id ?? item?.id ?? null;
}

export function createQueryKeys(entityKey) {
  return {
    all: [entityKey],
    lists: () => [entityKey, 'list'],
    list: (params) => [entityKey, 'list', params],
    details: () => [entityKey, 'detail'],
    detail: (id) => [entityKey, 'detail', id],
    custom: (key) => [entityKey, key],
    // Scoped list for explicit tenant/super-admin separation
    scopedList: (scope, params) => [entityKey, 'list', { _scope: scope, ...params }],
  };
}
