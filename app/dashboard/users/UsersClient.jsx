"use client";
import { useMemo, useState, useCallback } from "react";
import { UserSheet } from "@/components/platform/user/user-sheet";
import { DataTable } from "@/components/custom/ui/data-table";
import { useRouter, useSearchParams } from "next/navigation";
import { UserSearch } from "./UserSearch";
import { usersColumns } from "./user-columns";
import { Users } from "lucide-react";
import HeaderSection from "@/components/custom/dashboard/header-section";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { useUserActions, useUsers } from "@/hooks/query/useUsers";
import { toast } from "sonner";

export function UsersClient({ token, userRoles = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Check if current user is superadmin
  const isSuperAdmin = userRoles.includes('superadmin');

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
    items: users = [],
    pagination,
    isLoading,
  } = useUsers(token, apiParams, { public: false });
  const { remove: deleteUser, isDeleting } = useUserActions();

  // Check if target user is a superadmin
  const isTargetSuperAdmin = (user) => {
    return user?.roles?.includes('superadmin');
  };

  const handleEdit = useCallback((item) => {
    // Only superadmin can edit other superadmins
    if (isTargetSuperAdmin(item) && !isSuperAdmin) {
      toast.error("Only superadmins can edit superadmin users");
      return;
    }
    setSelected(item);
    setOpen(true);
  }, [isSuperAdmin]);

  const handleDelete = useCallback(
    async (item) => {
      // Only superadmin can delete other superadmins
      if (isTargetSuperAdmin(item) && !isSuperAdmin) {
        toast.error("Only superadmins can delete superadmin users");
        return;
      }

      if (confirm(`Delete user "${item.name}"? This action cannot be undone.`)) {
        await deleteUser({ token, id: item._id });
      }
    },
    [deleteUser, token, isSuperAdmin]
  );

  const handlePageChange = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      router.push(`/dashboard/users?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  // Pass userRole to columns for conditional rendering
  const columns = useMemo(
    () => usersColumns(handleEdit, isSuperAdmin ? handleDelete : null, { isSuperAdmin }),
    [handleEdit, handleDelete, isSuperAdmin]
  );

  return (
    <div className="flex flex-col gap-2">
      <HeaderSection
        icon={Users}
        title="User Management"
        variant="compact"
        description="Manage staff accounts and permissions"
      />
      <div className="py-4">
        <UserSearch />
      </div>

      <ErrorBoundaryWrapper>
        <DataTable
          columns={columns}
          data={users}
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

      <UserSheet
        token={token}
        open={open}
        onOpenChange={handleOpenChange}
        user={selected}
      />
    </div>
  );
}
