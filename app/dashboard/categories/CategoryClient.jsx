"use client";
import { useMemo, useState, useCallback } from "react";
import { CategorySheet } from "@/components/platform/category/category-sheet";
import { DataTable } from "@classytic/clarity";
import { useRouter, useSearchParams } from "next/navigation";
import { CategorySearch } from "./CategorySearch";
import { categoryColumns } from "./category-columns";
import { Plus, FolderTree } from "lucide-react";
import { HeaderSection } from "@classytic/clarity/dashboard";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { useCategories, useCategoryActions } from "@/hooks/query";


export function CategoriesClient({ token, userRoles = [] }) {
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
    items: categories = [],
    pagination,
    isLoading,
  } = useCategories(token, apiParams, { public: false });
  const { remove: deleteCategory, isDeleting } = useCategoryActions();

  const handleEdit = useCallback((item) => {
    setSelected(item);
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (item) => {
      // Check if category has products
      if (item.productCount > 0) {
        alert(`Cannot delete category "${item.name}" - it has ${item.productCount} products. Move products to another category first.`);
        return;
      }

      if (confirm(`Delete category "${item.name}"? This action cannot be undone.`))
        await deleteCategory({ token, id: item._id });
    },
    [deleteCategory, token]
  );

  const handlePageChange = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      router.push(`/dashboard/categories?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  // Only allow delete for admin/superadmin roles
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');

  const columns = useMemo(
    () => categoryColumns(handleEdit, isAdmin ? handleDelete : null),
    [handleEdit, handleDelete, isAdmin]
  );

  return (
    <div className="flex flex-col gap-2">
      <HeaderSection
        icon={FolderTree}
        title="Categories"
        variant="compact"
        description="Manage product categories and hierarchy"
        actions={[
          {
            icon: Plus,
            text: "Add Category",
            size: "sm",
            onClick: () => setOpen(true),
          },
        ]}
      />
      <div className="py-4">
        <CategorySearch token={token} />
      </div>

      <ErrorBoundaryWrapper>
        <DataTable
          columns={columns}
          data={categories}
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

      <CategorySheet
        token={token}
        open={open}
        onOpenChange={handleOpenChange}
        category={selected}
      />
    </div>
  );
}
