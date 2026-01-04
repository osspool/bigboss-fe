"use client";
import { useMemo, useState, useCallback } from "react";
import { CustomerSheet } from "@/components/platform/customer/customer-sheet";
import { DataTable } from "@classytic/clarity";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomerSearch } from "./CustomerSearch";
import { customersColumns } from "./customer-columns";
import { Plus, Users } from "lucide-react";
import { HeaderSection } from "@classytic/clarity/dashboard";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { useCustomerActions, useCustomers } from "@/hooks/query";


export function CustomersClient({ token, userRoles = [] }) {
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
    items: customers = [],
    pagination,
    isLoading,
  } = useCustomers(token, apiParams, { public: false });
  const { remove: deleteCustomer, isDeleting } = useCustomerActions();

  const handleEdit = useCallback((item) => {
    setSelected(item);
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (item) => {
      if (confirm(`Delete customer "${item.name}"? This action cannot be undone.`))
        await deleteCustomer({ token, id: item._id });
    },
    [deleteCustomer, token]
  );

  const handlePageChange = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      router.push(`/dashboard/customers?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  // Only allow delete for admin/superadmin roles
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');

  const columns = useMemo(
    () => customersColumns(handleEdit, isAdmin ? handleDelete : null),
    [handleEdit, handleDelete, isAdmin]
  );

  return (
    <div className="flex flex-col gap-2">
      <HeaderSection
        icon={Users}
        title="Customers"
        variant="compact"
        description="Manage customer profiles and CRM data"
        actions={[
          {
            icon: Plus,
            text: "Add Customer",
            size: "sm",
            onClick: () => setOpen(true),
          },
        ]}
      />
      <div className="py-4">
        <CustomerSearch />
      </div>

      <ErrorBoundaryWrapper>
        <DataTable
          columns={columns}
          data={customers}
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

      <CustomerSheet
        token={token}
        open={open}
        onOpenChange={handleOpenChange}
        customer={selected}
      />
    </div>
  );
}
