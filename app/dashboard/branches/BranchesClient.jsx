"use client";
import { useMemo, useState, useCallback } from "react";
import { BranchSheet } from "@/components/platform/branch/branch-sheet";
import { DataTable } from "@/components/custom/ui/data-table";
import { useRouter, useSearchParams } from "next/navigation";
import { branchColumns } from "./branch-columns";
import { Plus, Store } from "lucide-react";
import HeaderSection from "@/components/custom/dashboard/header-section";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { useBranchActions, useBranches } from "@/hooks/query/useBranches";

export function BranchesClient({ token }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleOpenChange = useCallback((isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelected(null);
    }
  }, []);

  const currentPage = Number(searchParams.get("page")) || 1;

  const apiParams = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      page: currentPage,
      limit: 15,
      ...params,
    };
  }, [searchParams, currentPage]);

  const {
    items: branches = [],
    pagination,
    isLoading,
  } = useBranches(token, apiParams, { public: false });
  const { remove: deleteBranch, isDeleting } = useBranchActions();

  const handleEdit = useCallback((item) => {
    setSelected(item);
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (item) => {
      if (confirm(`Delete branch "${item.name}"? This action cannot be undone.`))
        await deleteBranch({ token, id: item._id });
    },
    [deleteBranch, token]
  );

  const handlePageChange = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      router.push(`/dashboard/branches?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  const columns = useMemo(
    () => branchColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  return (
    <div className="flex flex-col gap-2">
      <HeaderSection
        icon={Store}
        title="Branches"
        variant="compact"
        description="Manage store locations and warehouses"
        actions={[
          {
            icon: Plus,
            text: "Add Branch",
            size: "sm",
            onClick: () => setOpen(true),
          },
        ]}
      />

      <ErrorBoundaryWrapper>
        <DataTable
          columns={columns}
          data={branches}
          isLoading={isLoading}
          pagination={{
            total: pagination?.total || 0,
            limit: pagination?.limit || 15,
            page: pagination?.page || currentPage,
            pages: pagination?.pages || 1,
            hasNext: pagination?.hasNext || false,
            hasPrev: pagination?.hasPrev || false,
            onPageChange: handlePageChange,
          }}
          className="h-[74dvh] rounded-lg"
        />
      </ErrorBoundaryWrapper>

      <BranchSheet
        token={token}
        open={open}
        onOpenChange={handleOpenChange}
        branch={selected}
      />
    </div>
  );
}
