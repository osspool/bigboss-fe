import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { createOptimisticMutation } from './mutation.factory';
import {
  createListQuery,
  createDetailQuery,
  updateListCache,
  getItemId,
  createQueryKeys,
  DEFAULT_QUERY_CONFIG,
} from './query.factory';

export function createCrudHooks({
  api,
  entityKey,
  singular,
  plural,
  defaults = {},
}) {
  const KEYS = createQueryKeys(entityKey);

  const config = {
    ...DEFAULT_QUERY_CONFIG,
    ...defaults,
    // Preserve structuralSharing from defaults (can be false to disable)
    structuralSharing: defaults.structuralSharing,
    messages: {
      createSuccess: `${singular} created successfully`,
      createError: `Failed to create ${singular.toLowerCase()}`,
      updateSuccess: `${singular} updated successfully`,
      updateError: `Failed to update ${singular.toLowerCase()}`,
      deleteSuccess: `${singular} deleted successfully`,
      deleteError: `Failed to delete ${singular.toLowerCase()}`,
      ...(defaults.messages || {}),
    },
    enabledRule: (token, options) => {
      if (options.public) {
        return options.enabled !== undefined ? options.enabled : true;
      }
      return options.enabled !== undefined ? options.enabled && !!token : !!token;
    },
  };

  function useList(token, params = {}, options = {}) {
    const { organizationId, ...restParams } = params;

    // Extract scope from options for query key differentiation
    // This ensures tenant-scoped and super-admin-scoped queries never collide
    const scope = options._scope || (organizationId ? 'tenant' : 'super-admin');

    return createListQuery({
      queryKey: KEYS.scopedList(scope, { organizationId, ...restParams }),
      queryFn: () => api.getAll({ token, organizationId, params: restParams }),
      enabled: config.enabledRule(token, options),
      options: {
        staleTime: options.staleTime ?? config.staleTime,
        gcTime: options.gcTime ?? config.gcTime,
        refetchOnWindowFocus: options.refetchOnWindowFocus ?? config.refetchOnWindowFocus,
        structuralSharing: options.structuralSharing ?? config.structuralSharing,
        ...options,
      },
      // Prefill detail cache to avoid redundant API calls
      prefillDetailCache: options.prefillDetailCache ?? true,
      detailKeyBuilder: (id) => KEYS.detail(id),
    });
  }

  function useDetail(id, token, options = {}) {
    const { organizationId, ...restOptions } = options;

    return createDetailQuery({
      queryKey: KEYS.detail(id),
      queryFn: () => api.getById({ id, token, organizationId }),
      enabled: !!id && config.enabledRule(token, restOptions),
      options: {
        staleTime: restOptions.staleTime ?? config.staleTime,
        gcTime: restOptions.gcTime ?? config.gcTime,
        structuralSharing: restOptions.structuralSharing ?? config.structuralSharing,
        refetchInterval: restOptions.refetchInterval,
        refetchIntervalInBackground: restOptions.refetchIntervalInBackground,
        ...restOptions,
      },
    });
  }

  function useActions() {
    const queryClient = useQueryClient();

    const createMutation = createOptimisticMutation({
      mutationFn: ({ token, organizationId, data }) =>
        api.create({ token, organizationId, data }),
      queryClient,
      queryKeys: [KEYS.lists()],
      optimisticUpdate: (oldData, { data }) => {
        const optimisticItem = {
          ...data,
          _optimistic: true,
          [getItemId(data) ? 'id' : '_id']: getItemId(data) ?? `temp-${Date.now()}`,
        };
        return updateListCache(oldData, (arr) => [optimisticItem, ...(arr || [])]);
      },
      messages: {
        success: config.messages.createSuccess,
        error: config.messages.createError,
      },
    });

    const updateMutation = createOptimisticMutation({
      mutationFn: ({ token, organizationId, id, data }) =>
        api.update({ token, organizationId, id, data }),
      queryClient,
      queryKeys: [KEYS.lists()],
      optimisticUpdate: (oldData, { id, data }) => {
        const updated = updateListCache(oldData, (arr) =>
          (arr || []).map((item) => (getItemId(item) === id ? { ...item, ...data } : item))
        );
        queryClient.setQueryData(KEYS.detail(id), (current) =>
          current ? { ...current, ...data } : current
        );
        return updated;
      },
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: KEYS.detail(id) });
      },
      messages: {
        success: config.messages.updateSuccess,
        error: config.messages.updateError,
      },
    });

    const deleteMutation = createOptimisticMutation({
      mutationFn: ({ token, organizationId, id }) =>
        api.delete({ token, organizationId, id }),
      queryClient,
      queryKeys: [KEYS.lists()],
      optimisticUpdate: (oldData, { id }) => {
        const updated = updateListCache(oldData, (arr) =>
          (arr || []).filter((item) => getItemId(item) !== id)
        );
        queryClient.removeQueries({ queryKey: KEYS.detail(id) });
        return updated;
      },
      messages: {
        success: config.messages.deleteSuccess,
        error: config.messages.deleteError,
      },
    });

    return {
      create: createMutation.mutateAsync,
      update: updateMutation.mutateAsync,
      remove: deleteMutation.mutateAsync,
      updateOnly: ({ token, organizationId, id, data }) =>
        updateMutation.mutateAsync({ token, organizationId, id, data, skipListInvalidation: true }),
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
    };
  }

  function useNavigation() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useCallback(
      (href, item, options = {}) => {
        const id = getItemId(item);
        if (id) {
          queryClient.setQueryData(KEYS.detail(id), item);
        }

        const { scroll = true, replace = false } = options;
        if (replace) {
          router.replace(href, { scroll });
        } else {
          router.push(href, { scroll });
        }
      },
      [queryClient, router]
    );
  }

  return {
    KEYS,
    useList,
    useDetail,
    useActions,
    useNavigation,
  };
}

export default createCrudHooks;
