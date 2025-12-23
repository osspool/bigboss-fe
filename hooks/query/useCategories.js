import { categoryApi } from '@/api/platform/category-api';
import { createCrudHooks } from '@/hooks/factories';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Create standard CRUD hooks
const { KEYS, useList, useDetail, useActions, useNavigation } = createCrudHooks({
  api: categoryApi,
  entityKey: 'categories',
  singular: 'Category',
  plural: 'Categories',
  defaults: {
    staleTime: 30 * 60 * 1000, // 30 minutes (categories change very rarely)
    messages: {
      createSuccess: "Category created successfully",
      updateSuccess: "Category updated successfully",
      deleteSuccess: "Category deleted successfully",
    },
  },
});

/**
 * Hook to get category tree (nested structure)
 * FE should cache this and derive everything else from it
 *
 * @param {string} token - Auth token (optional for public access)
 * @param {object} options - React Query options
 * @returns {object} Query result with tree data
 */
export function useCategoryTree(token, options = {}) {
  return useQuery({
    queryKey: [...KEYS.all, 'tree'],
    queryFn: () => categoryApi.getTree({ token }),
    staleTime: 30 * 60 * 1000, // 30 minutes (categories rarely change)
    gcTime: 60 * 60 * 1000, // 60 minutes
    ...options,
  });
}

/**
 * Hook to get category by slug
 *
 * @param {string} token - Auth token (optional for public access)
 * @param {string} slug - Category slug
 * @param {object} options - React Query options
 * @returns {object} Query result with category data
 */
export function useCategoryBySlug(token, slug, options = {}) {
  return useQuery({
    queryKey: [...KEYS.all, 'slug', slug],
    queryFn: () => categoryApi.getBySlug({ token, slug }),
    enabled: !!slug,
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

/**
 * Hook to sync product counts for all categories
 * POST /categories/sync-product-count
 *
 * Use when manual data fixes or migrations may have desynced counts.
 *
 * @param {string} token - Auth token (admin or inventory staff required)
 * @returns {object} Mutation result with sync function
 */
export function useCategorySyncProductCount(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => categoryApi.syncProductCount({ token }),
    onSuccess: (result) => {
      const count = result?.data?.updated ?? 0;
      toast.success(`Synced product counts for ${count} categories`);
      // Invalidate category queries to refresh counts
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to sync product counts');
    },
  });
}

// === Helper functions for form selects ===

/** Flatten tree with depth indicator (internal use) */
function flattenTree(nodes, depth = 0, result = []) {
  for (const node of nodes || []) {
    result.push({
      ...node,
      depth,
      displayName: '\u00A0\u00A0'.repeat(depth) + node.name,
    });
    if (node.children?.length) {
      flattenTree(node.children, depth + 1, result);
    }
  }
  return result;
}

/**
 * Build parent category options for select (root categories only)
 * @param {Array} tree - Category tree from useCategoryTree
 * @returns {Array} Options array with value/label
 */
export function getParentCategoryOptions(tree) {
  return (tree || []).map(node => ({
    value: node.slug,
    label: node.name,
  }));
}

/**
 * Build all category options for select (flattened with hierarchy)
 * @param {Array} tree - Category tree from useCategoryTree
 * @returns {Array} Options array with value/label
 */
export function getAllCategoryOptions(tree) {
  return flattenTree(tree).map(node => ({
    value: node.slug,
    label: node.displayName,
  }));
}

// Export standard hooks
export {
  KEYS as CATEGORY_KEYS,
  useList as useCategories,
  useDetail as useCategoryDetail,
  useActions as useCategoryActions,
  useNavigation as useCategoryNavigation,
};
