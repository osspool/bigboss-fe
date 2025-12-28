import { sizeGuideApi } from '@/api/platform/size-guide-api';
import { createCrudHooks } from '@/hooks/factories';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import type { SizeGuide } from '@/types/size-guide.types';
import type { ApiResponse } from '@/api/api-factory';

// Create standard CRUD hooks
const { KEYS, useList, useDetail, useActions, useNavigation } = createCrudHooks({
  api: sizeGuideApi,
  entityKey: 'size-guides',
  singular: 'Size Guide',
  plural: 'Size Guides',
  defaults: {
    staleTime: 30 * 60 * 1000, // 30 minutes (size guides change rarely)
    messages: {
      createSuccess: "Size guide created successfully",
      updateSuccess: "Size guide updated successfully",
      deleteSuccess: "Size guide deleted successfully",
    },
  },
});

/**
 * Hook to get size guide by slug
 *
 * @param token - Auth token (optional for public access)
 * @param slug - Size guide slug
 * @param options - React Query options
 * @returns Query result with size guide data
 */
export function useSizeGuideBySlug(
  token: string | null | undefined,
  slug: string,
  options: Omit<UseQueryOptions<ApiResponse<SizeGuide>>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery<ApiResponse<SizeGuide>>({
    queryKey: [...KEYS.all, 'slug', slug],
    queryFn: () => sizeGuideApi.getBySlug({ token, slug }),
    enabled: !!slug,
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

// === Helper functions for form selects ===

interface SelectOption {
  value: string;
  label: string;
}

/**
 * Build size guide options for select
 * @param sizeGuides - Size guide array from useSizeGuides
 * @returns Options array with value (ObjectId) and label
 */
export function getSizeGuideOptions(sizeGuides: SizeGuide[] | undefined): SelectOption[] {
  return (sizeGuides || [])
    .filter(guide => guide._id && guide._id.trim() !== '') // Filter out empty IDs
    .map(guide => ({
      value: guide._id, // Use ObjectId as value for API
      label: guide.name,
    }));
}

// Export standard hooks
export {
  KEYS as SIZE_GUIDE_KEYS,
  useList as useSizeGuides,
  useDetail as useSizeGuideDetail,
  useActions as useSizeGuideActions,
  useNavigation as useSizeGuideNavigation,
};
