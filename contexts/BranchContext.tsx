"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBranches, BRANCH_KEYS } from "@/hooks/query/useBranches";
import { storage } from "@/lib/storage-utils";
import type { Branch } from "@/types/branch.types";

// ============================================
// CONSTANTS
// ============================================

const BRANCH_STORAGE_KEY = "selectedBranchId";

// ============================================
// TYPES
// ============================================

export interface BranchContextValue {
  branches: Branch[];
  selectedBranch: Branch | null;
  defaultBranch: Branch | null;
  isLoading: boolean;
  error: Error | null;
  switchBranch: (branchId: string) => void;
  switchBranchByCode: (code: string) => void;
  refreshBranches: () => Promise<void>;
  hasMultipleBranches: boolean;
  selectedBranchId: string | null;
}

// ============================================
// CONTEXT
// ============================================

const BranchContext = createContext<BranchContextValue | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface BranchProviderProps {
  children: ReactNode;
  accessToken: string;
  allowedBranchIds?: string[] | null;
}

export function BranchProvider({ children, accessToken, allowedBranchIds }: BranchProviderProps) {
  const queryClient = useQueryClient();

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(() => {
    return storage.get(BRANCH_STORAGE_KEY, null);
  });

  // Fetch all branches using the CRUD factory hook
  // useBranches returns { items, isLoading, error, refetch } from createListQuery
  const { items, isLoading, error, refetch } = useBranches(accessToken);

  // items is already normalized by the query factory
  const allBranches: Branch[] = items as Branch[];

  const branches: Branch[] = useMemo(() => {
    // `null` or `undefined` means "no restriction" (admin/superadmin)
    if (allowedBranchIds == null) return allBranches;

    // Explicit allowlist (including empty list = no branch access)
    if (Array.isArray(allowedBranchIds)) {
      const allowed = new Set(allowedBranchIds);
      return allBranches.filter((b) => allowed.has(b._id));
    }

    return allBranches;
  }, [allBranches, allowedBranchIds]);

  // Find default branch
  const defaultBranch = useMemo(() => {
    return branches.find((b) => b.isDefault) || branches[0] || null;
  }, [branches]);

  // Resolve selected branch
  const selectedBranch = useMemo(() => {
    if (!branches.length) return null;
    if (selectedBranchId) {
      const found = branches.find((b) => b._id === selectedBranchId);
      if (found) return found;
    }
    return defaultBranch;
  }, [branches, selectedBranchId, defaultBranch]);

  // Sync to localStorage
  useEffect(() => {
    if (selectedBranch) {
      storage.set(BRANCH_STORAGE_KEY, selectedBranch._id);
      setSelectedBranchId(selectedBranch._id);
    }
  }, [selectedBranch]);

  const switchBranch = useCallback(
    (branchId: string) => {
      const branch = branches.find((b) => b._id === branchId);
      if (branch) {
        setSelectedBranchId(branchId);
        storage.set(BRANCH_STORAGE_KEY, branchId);
      }
    },
    [branches]
  );

  const switchBranchByCode = useCallback(
    (code: string) => {
      const branch = branches.find(
        (b) => b.code.toLowerCase() === code.toLowerCase()
      );
      if (branch) {
        switchBranch(branch._id);
      }
    },
    [branches, switchBranch]
  );

  const refreshBranches = useCallback(async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: BRANCH_KEYS.all });
  }, [refetch, queryClient]);

  const value = useMemo<BranchContextValue>(
    () => ({
      branches,
      selectedBranch,
      defaultBranch,
      isLoading,
      error: error as Error | null,
      switchBranch,
      switchBranchByCode,
      refreshBranches,
      hasMultipleBranches: branches.length > 1,
      selectedBranchId,
    }),
    [
      branches,
      selectedBranch,
      defaultBranch,
      isLoading,
      error,
      switchBranch,
      switchBranchByCode,
      refreshBranches,
      selectedBranchId,
    ]
  );

  return (
    <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
  );
}

// ============================================
// HOOKS
// ============================================

export function useBranch(): BranchContextValue {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}

export function useBranchOptional(): BranchContextValue | null {
  return useContext(BranchContext) ?? null;
}

export { BRANCH_STORAGE_KEY };
