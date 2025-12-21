"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { CategoryTreeNode } from "@/types/category.types";
import {
  flattenCategoryTree,
  getParentCategoryOptions,
  getAllCategoryOptions,
  findCategoryBySlug,
  getCategoryChildren,
} from "@/hooks/query/useCategories";

interface CategoryContextValue {
  /** Category tree (nested structure) */
  categoryTree: CategoryTreeNode[];
  /** Root categories only */
  parentCategories: CategoryTreeNode[];
  /** Flattened categories with depth info */
  flattenedCategories: ReturnType<typeof flattenCategoryTree>;
  /** Options for parent category select */
  parentCategoryOptions: { value: string; label: string }[];
  /** Options for all categories select (with hierarchy) */
  allCategoryOptions: { value: string; label: string }[];
  /** Find category by slug */
  findBySlug: (slug: string) => CategoryTreeNode | null;
  /** Get children of a category */
  getChildren: (parentSlug: string) => CategoryTreeNode[] | null;
  /** Loading state */
  isLoading: boolean;
}

const CategoryContext = createContext<CategoryContextValue | null>(null);

interface CategoryProviderProps {
  children: ReactNode;
  /** Pre-fetched category tree from server */
  initialTree?: CategoryTreeNode[];
  /** Loading state */
  isLoading?: boolean;
}

/**
 * CategoryProvider - Provides category data to the entire app
 *
 * Categories are prefetched on the server and passed here to avoid
 * waterfall requests. The tree is then cached for client-side usage.
 */
export function CategoryProvider({
  children,
  initialTree = [],
  isLoading = false,
}: CategoryProviderProps) {
  const value = useMemo<CategoryContextValue>(() => {
    const tree = initialTree;
    const flattened = flattenCategoryTree(tree);

    return {
      categoryTree: tree,
      parentCategories: tree,
      flattenedCategories: flattened,
      parentCategoryOptions: getParentCategoryOptions(tree),
      allCategoryOptions: getAllCategoryOptions(tree),
      findBySlug: (slug: string) => findCategoryBySlug(tree, slug) as CategoryTreeNode | null,
      getChildren: (parentSlug: string) => getCategoryChildren(tree, parentSlug) as CategoryTreeNode[] | null,
      isLoading,
    };
  }, [initialTree, isLoading]);

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

/**
 * Hook to access category data
 * Must be used within CategoryProvider
 */
export function useCategories() {
  const context = useContext(CategoryContext);

  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }

  return context;
}

/**
 * Hook to get category data with fallback (for components that might render outside provider)
 */
export function useCategoriesSafe() {
  const context = useContext(CategoryContext);

  return context ?? {
    categoryTree: [],
    parentCategories: [],
    flattenedCategories: [],
    parentCategoryOptions: [],
    allCategoryOptions: [],
    findBySlug: () => null,
    getChildren: () => null,
    isLoading: true,
  };
}
