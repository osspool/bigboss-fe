import { mediaApi } from '@/api/platform/media-api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { MediaFolder, Media, MoveFilesPayload, BulkDeleteResult, MoveFilesResult, MediaQueryParams, UpdateMediaPayload } from '@/types/media.types';

// Query Keys for React Query
export const MEDIA_KEYS = {
  all: ['media'] as const,
  lists: () => [...MEDIA_KEYS.all, 'list'] as const,
  list: (params: MediaQueryParams) => [...MEDIA_KEYS.lists(), params] as const,
  details: () => [...MEDIA_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MEDIA_KEYS.details(), id] as const,
  folders: () => [...MEDIA_KEYS.all, 'folders'] as const,
};

/**
 * Hook to get media list with folder filtering
 * Uses caching and automatic background refetching
 */
export function useMediaList(
  token: string | null,
  params: MediaQueryParams = {},
  options: any = {}
) {
  return useQuery({
    queryKey: MEDIA_KEYS.list(params),
    queryFn: () => mediaApi.getAll({ token: token!, params }),
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Hook to get single media by ID
 */
export function useMediaDetail(
  token: string | null,
  id: string | null,
  options: any = {}
) {
  return useQuery({
    queryKey: MEDIA_KEYS.detail(id!),
    queryFn: () => mediaApi.getById({ token: token!, id: id! }),
    enabled: !!token && !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to get allowed folders
 */
export function useMediaFolders(token: string | null, options: any = {}) {
  return useQuery({
    queryKey: MEDIA_KEYS.folders(),
    queryFn: () => mediaApi.getFolders({ token: token! }),
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes (folders rarely change)
    gcTime: 15 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to upload multiple media files
 * Automatically invalidates media queries after upload
 */
export function useMediaUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      token,
      files,
      folder,
    }: {
      token: string;
      files: (File | Blob)[];
      folder?: MediaFolder;
    }) => {
      return mediaApi.uploadMultiple({ token, files, folder });
    },
    onSuccess: () => {
      // Invalidate all media lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: MEDIA_KEYS.lists() });
      toast.success('Media uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      toast.error('Failed to upload media');
    },
  });
}

/**
 * Hook to bulk delete media
 * Automatically invalidates media queries after deletion
 */
export function useMediaBulkDelete() {
  const queryClient = useQueryClient();

  return useMutation<
    BulkDeleteResult,
    Error,
    { token: string; ids: string[] },
    { previousLists: [any, any][] }
  >({
    mutationFn: async ({ token, ids }) => {
      const response = await mediaApi.bulkDelete({ token, ids });
      return response.data as BulkDeleteResult;
    },
    onMutate: async ({ ids }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: MEDIA_KEYS.lists() });

      // Snapshot previous value
      const previousLists = queryClient.getQueriesData({ queryKey: MEDIA_KEYS.lists() });

      // Optimistically update cache
      queryClient.setQueriesData({ queryKey: MEDIA_KEYS.lists() }, (old: any) => {
        if (!old?.docs) return old;
        return {
          ...old,
          docs: old.docs.filter((item: Media) => !ids.includes(item._id)),
          total: old.total - ids.length,
        };
      });

      return { previousLists };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to delete media');
    },
    onSuccess: (data) => {
      const deletedCount = data.success.length;
      toast.success(`${deletedCount} item(s) deleted successfully`);
    },
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: MEDIA_KEYS.lists() });
    },
  });
}

/**
 * Hook to move media to different folder
 * Automatically invalidates media queries after move
 */
export function useMediaMove() {
  const queryClient = useQueryClient();

  return useMutation<MoveFilesResult, Error, { token: string; data: MoveFilesPayload }>({
    mutationFn: async ({ token, data }) => {
      const response = await mediaApi.moveToFolder({ token, data });
      return response.data as MoveFilesResult;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEYS.lists() });
      toast.success(`${data.modifiedCount} item(s) moved to ${variables.data.targetFolder}`);
    },
    onError: (error) => {
      console.error('Move failed:', error);
      toast.error('Failed to move media');
    },
  });
}

/**
 * Hook to update media metadata
 * Automatically invalidates specific item and lists
 */
export function useMediaUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      token,
      id,
      data,
    }: {
      token: string;
      id: string;
      data: UpdateMediaPayload;
    }) => {
      return mediaApi.update({ token, id, data });
    },
    onMutate: async ({ id, data }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: MEDIA_KEYS.detail(id) });

      // Snapshot
      const previous = queryClient.getQueryData(MEDIA_KEYS.detail(id));

      // Optimistic update
      queryClient.setQueryData(MEDIA_KEYS.detail(id), (old: any) => ({
        ...old,
        ...data,
      }));

      return { previous, id };
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(MEDIA_KEYS.detail(context.id), context.previous);
      }
      toast.error('Failed to update media');
    },
    onSuccess: () => {
      toast.success('Media updated successfully');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: MEDIA_KEYS.lists() });
    },
  });
}
