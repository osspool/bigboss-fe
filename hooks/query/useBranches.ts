import { branchApi } from '@/api/platform/branch-api';
import { createCrudHooks } from '@/hooks/factories';
import { useQuery } from '@tanstack/react-query';
import type { Branch } from '@/types/branch.types';

// Create standard CRUD hooks
const { KEYS, useList, useDetail, useActions, useNavigation } = createCrudHooks({
  api: branchApi,
  entityKey: 'branches',
  singular: 'Branch',
  plural: 'Branches',
  defaults: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    messages: {
      createSuccess: 'Branch created successfully',
      updateSuccess: 'Branch updated successfully',
      deleteSuccess: 'Branch deleted successfully',
    },
  },
});

/**
 * Hook to get default branch
 * @param token - Auth token
 * @param options - React Query options
 */
export function useDefaultBranch(token: string, options = {}) {
  return useQuery({
    queryKey: [...KEYS.all, 'default'],
    queryFn: () => branchApi.getDefault({ token }),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data as Branch,
    ...options,
  });
}



/**
 * Hook to get branch by code
 * @param token - Auth token
 * @param code - Branch code
 * @param options - React Query options
 */
export function useBranchByCode(token: string, code: string, options = {}) {
  return useQuery({
    queryKey: [...KEYS.all, 'code', code],
    queryFn: () => branchApi.getByCode({ token, code }),
    enabled: !!token && !!code,
    staleTime: 5 * 60 * 1000,
    select: (data) => data?.data as Branch,
    ...options,
  });
}

// Export standard hooks
export {
  KEYS as BRANCH_KEYS,
  useList as useBranches,
  useDetail as useBranchDetail,
  useActions as useBranchActions,
  useNavigation as useBranchNavigation,
};
