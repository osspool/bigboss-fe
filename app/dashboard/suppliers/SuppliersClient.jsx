"use client";
import { useMemo, useState, useCallback } from "react";
import { SupplierSheet } from "@/components/inventory/supplier/supplier-sheet";
import { DataTable } from "@classytic/clarity";
import { useRouter, useSearchParams } from "next/navigation";
import { SupplierSearch } from "./SupplierSearch";
import { suppliersColumns } from "./supplier-columns";
import { Plus, Building2 } from "lucide-react";
import { HeaderSection } from "@classytic/clarity/dashboard";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { useSupplierActions, useSuppliers } from "@/hooks/query";


export function SuppliersClient({ token, userRoles = [] }) {
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
      ...params,
    };
  }, [searchParams, currentPage]);

  const {
    items: suppliers = [],
    pagination,
    isLoading,
  } = useSuppliers(token, apiParams, { public: false });
  const { remove: deleteSupplier, isDeleting } = useSupplierActions();

  const handleEdit = useCallback((item) => {
    setSelected(item);
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (item) => {
      if (confirm(`Deactivate supplier "${item.name}"? This will preserve audit history.`))
        await deleteSupplier({ token, id: item._id });
    },
    [deleteSupplier, token]
  );

  const handlePageChange = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      router.push(`/dashboard/suppliers?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  // Only allow delete for admin/superadmin roles
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');

  const columns = useMemo(
    () => suppliersColumns(handleEdit, isAdmin ? handleDelete : null),
    [handleEdit, handleDelete, isAdmin]
  );

  return (
    <div className="flex flex-col gap-2">
      <HeaderSection
        icon={Building2}
        title="Suppliers"
        variant="compact"
        description="Manage vendors and supplier information for purchases"
        actions={[
          {
            icon: Plus,
            text: "Add Supplier",
            size: "sm",
            onClick: () => setOpen(true),
          },
        ]}
      />
      <div className="py-4">
        <SupplierSearch />
      </div>

      <ErrorBoundaryWrapper>
        <DataTable
          columns={columns}
          data={suppliers}
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

      <SupplierSheet
        token={token}
        open={open}
        onOpenChange={handleOpenChange}
        supplier={selected}
      />
    </div>
  );
}
