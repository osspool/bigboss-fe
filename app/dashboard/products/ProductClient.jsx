"use client";
import { useMemo, useState, useCallback } from "react";
import { ProductSheet } from "@/components/platform/product/form/product-sheet";
import { DataTable } from "@/components/custom/ui/data-table";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductSearch } from "./ProductSearch";
import { productColumns } from "./product-columns";
import { Plus, Package } from "lucide-react";
import HeaderSection from "@/components/custom/dashboard/header-section";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { useProductActions, useProducts } from "@/hooks/query/useProducts";
import { revalidateProductsList } from "@/lib/revalidation";

export function ProductsClient({ token, userRoles = [] }) {
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
      sort: "-createdAt",
      ...params,
    };
  }, [searchParams, currentPage]);

  const {
    items: products = [],
    pagination,
    isLoading,
  } = useProducts(token, apiParams, { public: false });
  const { remove: deleteProduct, isDeleting } = useProductActions();

  const handleEdit = useCallback((item) => {
    setSelected(item);
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (item) => {
      if (confirm(`Delete product "${item.name}"? This action cannot be undone.`)) {
        await deleteProduct({ token, id: item._id });
        // Revalidate cache after deletion
        await revalidateProductsList();
      }
    },
    [deleteProduct, token]
  );

  const handlePageChange = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      router.push(`/dashboard/products?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  // Only allow delete for admin/superadmin roles
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');

  const columns = useMemo(
    () => productColumns(handleEdit, isAdmin ? handleDelete : null),
    [handleEdit, handleDelete, isAdmin]
  );

  return (
    <div className="flex flex-col gap-2">
      <HeaderSection
        icon={Package}
        title="Products"
        variant="compact"
        description="Manage your product catalog and inventory"
        actions={[
          {
            icon: Plus,
            text: "Add Product",
            size: "sm",
            onClick: () => setOpen(true),
          },
        ]}
      />
      <div className="py-4">
        <ProductSearch token={token} />
      </div>

      <ErrorBoundaryWrapper>
        <DataTable
          columns={columns}
          data={products}
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

      <ProductSheet
        token={token}
        open={open}
        onOpenChange={handleOpenChange}
        product={selected}
      />
    </div>
  );
}
