import { categoryApi } from '@/api/platform/category-api';
import { createCrudHooks } from '@/hooks/factories';
import { useQuery } from '@tanstack/react-query';

// Create standard CRUD hooks
const { KEYS, useList, useDetail, useActions, useNavigation } = createCrudHooks({
  api: categoryApi,
  entityKey: 'categories',
  singular: 'Category',
  plural: 'Categories',
  defaults: {
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change infrequently)
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
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
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
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

// === Helper functions for working with category tree ===

/**
 * Flatten tree for dropdowns with depth indicator
 * @param {Array} nodes - Category tree nodes
 * @param {number} depth - Current depth level
 * @param {Array} result - Accumulated result
 * @returns {Array} Flattened categories with depth info
 */
export function flattenCategoryTree(nodes, depth = 0, result = []) {
  for (const node of nodes || []) {
    result.push({
      ...node,
      depth,
      displayName: '\u00A0\u00A0'.repeat(depth) + node.name,
      // For select components
      value: node.slug,
      label: '\u00A0\u00A0'.repeat(depth) + node.name,
    });
    if (node.children?.length) {
      flattenCategoryTree(node.children, depth + 1, result);
    }
  }
  return result;
}

/**
 * Get children of a specific category
 * @param {Array} tree - Category tree
 * @param {string} parentSlug - Parent category slug
 * @returns {Array|null} Children nodes or null if not found
 */
export function getCategoryChildren(tree, parentSlug) {
  for (const node of tree || []) {
    if (node.slug === parentSlug) return node.children || [];
    const found = getCategoryChildren(node.children, parentSlug);
    if (found) return found;
  }
  return null;
}

/**
 * Find category by slug in tree
 * @param {Array} tree - Category tree
 * @param {string} slug - Category slug to find
 * @returns {Object|null} Category node or null
 */
export function findCategoryBySlug(tree, slug) {
  for (const node of tree || []) {
    if (node.slug === slug) return node;
    const found = findCategoryBySlug(node.children, slug);
    if (found) return found;
  }
  return null;
}

/**
 * Get root categories (parent = null)
 * @param {Array} tree - Category tree
 * @returns {Array} Root level categories
 */
export function getRootCategories(tree) {
  return tree || [];
}

/**
 * Build parent category options for select (root categories only)
 * @param {Array} tree - Category tree
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
 * @param {Array} tree - Category tree
 * @returns {Array} Options array with value/label
 */
export function getAllCategoryOptions(tree) {
  return flattenCategoryTree(tree).map(node => ({
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
