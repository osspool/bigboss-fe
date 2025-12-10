import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTransition } from 'react';
import { toast } from 'sonner';

export function useMutationWithTransition(config) {
  const {
    mutationFn,
    invalidateQueries = [],
    onSuccess,
    onError,
    messages = {},
    useTransition: shouldUseTransition = true,
    showToast = true,
  } = config;

  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const mutation = useMutation({
    mutationFn,

    onSuccess: (data, variables, context) => {
      if (shouldUseTransition && invalidateQueries.length > 0) {
        startTransition(() => {
          invalidateQueries.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey });
          });
        });
      } else if (invalidateQueries.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      if (showToast && messages.success) {
        toast.success(
          typeof messages.success === 'function'
            ? messages.success(data, variables)
            : messages.success
        );
      }

      onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      if (showToast) {
        const errorMessage =
          typeof messages.error === 'function'
            ? messages.error(error, variables)
            : messages.error || error?.message || 'An error occurred';

        toast.error(errorMessage);
      }

      onError?.(error, variables, context);
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending || isPending,
    isPending: mutation.isPending || isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

export function useMutationWithOptimistic(config) {
  const {
    mutationFn,
    queryKeys = [],
    optimisticUpdate,
    messages = {},
    onSuccess,
    onError,
    showToast = true,
  } = config;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn,

    onMutate: async (variables) => {
      await Promise.all(
        queryKeys.map((queryKey) =>
          queryClient.cancelQueries({ queryKey })
        )
      );

      const previousData = queryKeys.map((queryKey) => ({
        queryKey,
        data: queryClient.getQueryData(queryKey),
      }));

      if (optimisticUpdate) {
        queryKeys.forEach((queryKey) => {
          queryClient.setQueryData(queryKey, (old) =>
            optimisticUpdate(old, variables)
          );
        });
      }

      return { previousData };
    },

    onSuccess: (data, variables, context) => {
      queryKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      if (showToast && messages.success) {
        toast.success(
          typeof messages.success === 'function'
            ? messages.success(data, variables)
            : messages.success
        );
      }

      onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (showToast) {
        const errorMessage =
          typeof messages.error === 'function'
            ? messages.error(error, variables)
            : messages.error || error?.message || 'An error occurred';

        toast.error(errorMessage);
      }

      onError?.(error, variables, context);
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

export function createOptimisticMutation({
  mutationFn,
  queryClient,
  queryKeys,
  optimisticUpdate,
  onSuccess,
  onError,
  messages,
}) {
  return useMutation({
    mutationFn,

    onMutate: async (variables) => {
      await Promise.all(
        queryKeys.map((key) =>
          queryClient.cancelQueries({ queryKey: key, exact: false })
        )
      );

      const previous = queryKeys.map((key) => ({
        key,
        data: queryClient.getQueriesData({ queryKey: key }),
      }));

      if (optimisticUpdate) {
        queryKeys.forEach((key) => {
          const queries = queryClient.getQueriesData({ queryKey: key });
          queries.forEach(([queryKey, queryData]) => {
            queryClient.setQueryData(
              queryKey,
              optimisticUpdate(queryData, variables)
            );
          });
        });
      }

      return { previous };
    },

    onSuccess: (data, variables, context) => {
      if (messages?.success) {
        toast.success(
          typeof messages.success === 'function'
            ? messages.success(data, variables)
            : messages.success
        );
      }

      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      if (context?.previous) {
        context.previous.forEach(({ data }) => {
          data.forEach(([queryKey, queryData]) => {
            queryClient.setQueryData(queryKey, queryData);
          });
        });
      }

      toast.error(
        typeof messages?.error === 'function'
          ? messages.error(error, variables)
          : messages?.error || error?.message || 'An error occurred'
      );

      onError?.(error, variables, context);
    },
  });
}

export const QUERY_CONFIGS = {
  realtime: { staleTime: 20000, refetchInterval: 30000 },
  frequent: { staleTime: 60000, refetchInterval: false },
  stable: { staleTime: 300000, refetchInterval: false },
  static: { staleTime: 600000, refetchInterval: false },
};

export const createMessage = (fn) => fn;
