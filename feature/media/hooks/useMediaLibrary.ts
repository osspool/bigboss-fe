"use client";
import { useState, useCallback, useMemo } from 'react';
import {
  useMediaList,
  useMediaUpload,
  useMediaBulkDelete,
  useMediaMove,
  useMediaUpdate,
  type Media,
  type MediaFolder,
} from '@classytic/commerce-sdk/content';

interface OffsetPaginationResponse<T> {
  docs: T[];
  total: number;
  pages: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UseMediaLibraryOptions {
  token: string | null;
  initialFolder?: string;
  multiSelect?: boolean;
  selectable?: boolean;
  limit?: number;
}

export function useMediaLibrary(options: UseMediaLibraryOptions) {
  const {
    token,
    initialFolder = 'all',
    multiSelect = true,
    selectable = false,
    limit = 20,
  } = options;

  // UI State (not server state)
  const [selectedFolder, setSelectedFolder] = useState(initialFolder);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [detailItem, setDetailItem] = useState<Media | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // React Query hooks for server state
  const {
    data: mediaResponse,
    isLoading,
    isFetching,
    refetch: refetchMedia,
  } = useMediaList(
    token,
    {
      folder: selectedFolder === 'all' ? undefined : (selectedFolder as MediaFolder),
      page,
      limit,
      sort: '-createdAt',
    },
    {
      enabled: !!token,
    }
  );

  // Mutations (SDK hooks require token)
  const uploadMutation = useMediaUpload(token || '');
  const deleteMutation = useMediaBulkDelete(token || '');
  const moveMutation = useMediaMove(token || '');
  const updateMutation = useMediaUpdate(token || '');

  // Extract data from response with proper typing
  const typedResponse = mediaResponse as OffsetPaginationResponse<Media> | undefined;
  const items = typedResponse?.docs || [];
  const pagination = {
    total: typedResponse?.total || 0,
    pages: typedResponse?.pages || 0,
    page: typedResponse?.page || 1,
    limit: typedResponse?.limit || limit,
    hasNext: typedResponse?.hasNext || false,
    hasPrev: typedResponse?.hasPrev || false,
  };

  // Folder counts (would need separate queries for each folder)
  // For now, using the current folder's total
  const folderCounts = useMemo(() => {
    return {
      [selectedFolder]: pagination.total,
    };
  }, [selectedFolder, pagination.total]);

  // Filtered items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((item: Media) =>
      item.filename.toLowerCase().includes(query) ||
      item.title?.toLowerCase().includes(query) ||
      item.alt?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Selected items
  const selectedItems = useMemo(() => {
    return items.filter((item: Media) => selectedIds.includes(item._id));
  }, [items, selectedIds]);

  // Folder selection
  const selectFolder = useCallback((folder: string) => {
    setSelectedFolder(folder);
    setPage(1); // Reset to page 1 when changing folders
    setSelectedIds([]);
    setDetailItem(null);
  }, []);

  // Item selection
  const selectItem = useCallback((id: string, toggle = false) => {
    setSelectedIds(prev => {
      if (toggle || multiSelect) {
        return prev.includes(id)
          ? prev.filter(i => i !== id)
          : [...prev, id];
      }
      return [id];
    });
  }, [multiSelect]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Detail panel
  const openDetail = useCallback((item: Media) => {
    if (selectable) {
      selectItem(item._id);
    } else {
      setDetailItem(item);
    }
  }, [selectable, selectItem]);

  const closeDetail = useCallback(() => {
    setDetailItem(null);
  }, []);

  // Upload media
  const uploadMedia = useCallback(async (files: File[], folder: string) => {
    if (!token) return;

    const targetFolder = (folder === 'all' ? 'general' : folder) as MediaFolder;
    await uploadMutation.uploadAsync({
      files,
      folder: targetFolder,
    });
  }, [token, uploadMutation]);

  // Delete media
  const deleteMedia = useCallback(async (ids: string[]) => {
    if (!token) return;

    await deleteMutation.bulkDeleteAsync(ids);

    // Update UI state
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    if (detailItem && ids.includes(detailItem._id)) {
      setDetailItem(null);
    }
  }, [token, deleteMutation, detailItem]);

  // Update media
  const updateMedia = useCallback(async (
    id: string,
    data: { alt?: string; title?: string }
  ) => {
    if (!token) return;

    await updateMutation.updateAsync({ id, data });

    // Update detail item if it's the one being updated
    if (detailItem?._id === id) {
      setDetailItem(prev => prev ? { ...prev, ...data } : null);
    }
  }, [token, updateMutation, detailItem]);

  // Move media
  const moveMedia = useCallback(async (ids: string[], targetFolder: string) => {
    if (!token) return;

    await moveMutation.moveAsync({
      ids,
      targetFolder: targetFolder as MediaFolder,
    });
  }, [token, moveMutation]);

  // Manual refetch
  const loadMedia = useCallback(() => {
    refetchMedia();
  }, [refetchMedia]);

  return {
    // Data
    items,
    filteredItems,
    selectedItems,
    loading: isLoading,
    fetching: isFetching,

    // Pagination
    pagination,
    setPage,

    // UI State
    selectedFolder,
    selectedIds,
    viewMode,
    detailItem,
    searchQuery,
    folderCounts,

    // UI Actions
    selectFolder,
    selectItem,
    clearSelection,
    openDetail,
    closeDetail,
    setViewMode,
    setSearchQuery,

    // Server Actions
    loadMedia,
    uploadMedia,
    deleteMedia,
    updateMedia,
    moveMedia,

    // Mutation states
    isUploading: uploadMutation.isUploading,
    isDeleting: deleteMutation.isDeleting,
    isMoving: moveMutation.isMoving,
    isUpdating: updateMutation.isUpdating,
  };
}
