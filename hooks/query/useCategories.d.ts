import type { UseQueryResult, UseQueryOptions } from "@tanstack/react-query";
import type { Category } from "@/types/category.types";

// Query Keys
export const CATEGORY_KEYS: {
  all: readonly string[];
  lists: () => readonly string[];
  list: (params?: Record<string, unknown>) => readonly string[];
  details: () => readonly string[];
  detail: (id: string) => readonly string[];
};

// Category Tree Node (extends Category with children)
export interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[];
  depth?: number;
  displayName?: string;
  value?: string;
  label?: string;
}

// API Response type
export interface CategoryTreeResponse {
  success: boolean;
  data: CategoryTreeNode[];
}

// useCategoryTree
export function useCategoryTree(
  token?: string | null,
  options?: UseQueryOptions<CategoryTreeResponse>
): UseQueryResult<CategoryTreeResponse>;

// useCategoryBySlug
export function useCategoryBySlug(
  token: string | null | undefined,
  slug: string,
  options?: UseQueryOptions<{ success: boolean; data: Category }>
): UseQueryResult<{ success: boolean; data: Category }>;

// useCategories (list)
export function useCategories(
  token: string | null,
  params?: Record<string, unknown>,
  options?: Record<string, unknown>
): {
  items: Category[];
  total: number;
  page: number;
  pages: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

// useCategoryDetail
export function useCategoryDetail(
  token: string | null,
  id: string | null,
  options?: Record<string, unknown>
): {
  item: Category | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
};

// useCategoryActions
export interface CategoryActionsResult {
  create: (data: Partial<Category>) => Promise<Category>;
  update: (id: string, data: Partial<Category>) => Promise<Category>;
  remove: (id: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useCategoryActions(token: string): CategoryActionsResult;

// useCategoryNavigation
export interface CategoryNavigationResult {
  selectedId: string | null;
  select: (id: string | null) => void;
  editItem: Category | null;
  setEditItem: (item: Category | null) => void;
  isCreating: boolean;
  setIsCreating: (creating: boolean) => void;
}

export function useCategoryNavigation(): CategoryNavigationResult;

// Helper functions
export function flattenCategoryTree(
  nodes: CategoryTreeNode[] | undefined,
  depth?: number,
  result?: CategoryTreeNode[]
): CategoryTreeNode[];

export function getCategoryChildren(
  tree: CategoryTreeNode[] | undefined,
  parentSlug: string
): CategoryTreeNode[] | null;

export function findCategoryBySlug(
  tree: CategoryTreeNode[] | undefined,
  slug: string
): CategoryTreeNode | null;

export function getRootCategories(tree: CategoryTreeNode[] | undefined): CategoryTreeNode[];

export function getParentCategoryOptions(
  tree: CategoryTreeNode[] | undefined
): Array<{ value: string; label: string }>;

export function getAllCategoryOptions(
  tree: CategoryTreeNode[] | undefined
): Array<{ value: string; label: string }>;
