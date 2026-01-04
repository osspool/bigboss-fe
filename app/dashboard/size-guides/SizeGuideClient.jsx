"use client";
import { useMemo, useState, useCallback } from "react";
import { SizeGuideSheet } from "@/components/platform/size-guide/size-guide-sheet";
import { DataTable } from "@classytic/clarity";
import { useRouter, useSearchParams } from "next/navigation";
import { sizeGuideColumns } from "./size-guide-columns";
import { Plus, Ruler } from "lucide-react";
import { HeaderSection } from "@classytic/clarity/dashboard";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { useSizeGuides, useSizeGuideActions } from "@/hooks/query";


export function SizeGuideClient({ token, userRoles = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Reset selected when sheet closes
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
      sort: "displayOrder", // Sort by display order by default
      ...params,
    };
  }, [searchParams, currentPage]);

  const {
    items: sizeGuides = [],
    pagination,
    isLoading,
  } = useSizeGuides(token, apiParams, { public: false });
  const { remove: deleteSizeGuide, isDeleting } = useSizeGuideActions();

  const handleEdit = useCallback((item) => {
    setSelected(item);
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (item) => {
      if (confirm(`Delete size guide "${item.name}"? This action cannot be undone.`))
        await deleteSizeGuide({ token, id: item._id });
    },
    [deleteSizeGuide, token]
  );

  const handlePageChange = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      router.push(`/dashboard/size-guides?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  // Only allow delete for admin/superadmin roles
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');

  const columns = useMemo(
    () => sizeGuideColumns(handleEdit, isAdmin ? handleDelete : null),
    [handleEdit, handleDelete, isAdmin]
  );

  return (
    <div className="flex flex-col gap-2">
      <HeaderSection
        icon={Ruler}
        title="Size Guides"
        variant="compact"
        description="Manage size guide templates for products"
        actions={[
          {
            icon: Plus,
            text: "Add Size Guide",
            size: "sm",
            onClick: () => setOpen(true),
          },
        ]}
      />

      <ErrorBoundaryWrapper>
        <DataTable
          columns={columns}
          data={sizeGuides}
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

      <SizeGuideSheet
        token={token}
        open={open}
        onOpenChange={handleOpenChange}
        sizeGuide={selected}
      />
    </div>
  );
}
