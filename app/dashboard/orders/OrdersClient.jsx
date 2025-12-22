"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList } from "lucide-react";

import HeaderSection from "@/components/custom/dashboard/header-section";
import { DataTable } from "@/components/custom/ui/data-table";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { OrderSheet } from "@/components/platform/order/form/order-sheet";
import { orderColumns } from "./order-columns";
import { OrdersSearch } from "./OrdersSearch";
import {
  useOrdersList,
  useAdminCrudActions,
  useAdminOrderActions,
} from "@/hooks/query/useOrders";

export function OrdersClient({ token, initialLimit = 15 }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sheet state - store only the ID, derive order from list
  // This ensures sheet always shows fresh data after ANY mutation
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleOpenChange = useCallback((isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedId(null);
    }
  }, []);

  const currentPage = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || initialLimit;

  // Build API params from URL search params
  const apiParams = useMemo(() => {
    const params = {};
    
    // Pagination
    params.page = currentPage;
    params.limit = limit;
    
    // Search params
    const orderId = searchParams.get("_id");
    const customerPhone = searchParams.get("deliveryAddress.recipientPhone");
    if (orderId) params._id = orderId;
    if (customerPhone) params["deliveryAddress.recipientPhone"] = customerPhone;
    
    // Filter params
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const paymentStatus = searchParams.get("currentPayment.status");
    const dateFrom = searchParams.get("createdAt[gte]");
    const dateTo = searchParams.get("createdAt[lte]");

    if (status) params.status = status;
    if (source) params.source = source;
    if (paymentStatus) params["currentPayment.status"] = paymentStatus;
    if (dateFrom) params["createdAt[gte]"] = dateFrom;
    if (dateTo) params["createdAt[lte]"] = dateTo;
    
    // Sort - default to newest first
    params.sort = searchParams.get("sort") || "-createdAt";
    
    return params;
  }, [currentPage, limit, searchParams]);

  // Data hooks
  const { items: orders = [], pagination, isLoading } = useOrdersList(
    token,
    apiParams,
    { public: false }
  );

  const { remove: deleteOrder, isDeleting } = useAdminCrudActions();
  const {
    updateStatus,
    isUpdatingStatus,
    cancelOrder,
    isCancelling,
  } = useAdminOrderActions(token);

  // Derive selected order from list - always fresh after any mutation
  // Works for: status updates, payment verification, cancellation, etc.
  // Create a shallow copy to ensure React detects the change even with structural sharing
  const selectedOrder = useMemo(() => {
    if (!selectedId || orders.length === 0) return null;
    const found = orders.find((o) => o._id === selectedId);
    // Shallow copy ensures new reference when order data changes
    // This prevents React Query's structural sharing from blocking re-renders
    return found ? { ...found } : null;
  }, [selectedId, orders]);

  // ==================== Handlers ====================

  // View/Edit - store ID only, order is derived from list
  const handleEdit = useCallback((order) => {
    setSelectedId(order._id);
    setOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (order) => {
      const confirmed = window.confirm(
        `Delete order ${order?._id?.slice(-8) ?? ""}? This action cannot be undone.`
      );
      if (!confirmed) return;

      try {
        await deleteOrder({ token, id: order._id });
      } catch (error) {
        console.error(error);
      }
    },
    [deleteOrder, token]
  );

  const handleStatusChange = useCallback(
    async (order, newStatus) => {
      const statusLabels = {
        confirmed: "confirm",
        shipped: "mark as shipped",
        delivered: "mark as delivered",
        cancelled: "cancel",
      };

      const action = statusLabels[newStatus] || `change to ${newStatus}`;
      const confirmed = window.confirm(`Are you sure you want to ${action} this order?`);
      if (!confirmed) return;

      try {
        if (newStatus === "cancelled") {
          await cancelOrder({ orderId: order._id, reason: "Cancelled by admin" });
        } else {
          await updateStatus({ orderId: order._id, status: newStatus });
        }
      } catch (error) {
        console.error(error);
      }
    },
    [updateStatus, cancelOrder]
  );

  const handlePageChange = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      params.set("limit", String(limit));
      router.push(`/dashboard/orders?${params.toString()}`, {
        scroll: false,
      });
    },
    [limit, router, searchParams]
  );

  // ==================== Columns ====================

  const columns = useMemo(
    () => orderColumns(handleEdit, handleEdit, handleDelete, handleStatusChange),
    [handleEdit, handleDelete, handleStatusChange]
  );

  // ==================== Render ====================

  const isProcessing = isDeleting || isUpdatingStatus || isCancelling;

  return (
    <div className="flex flex-col gap-4">
      <HeaderSection
        icon={ClipboardList}
        title="Orders"
        description="View and manage customer orders"
      />

      <div className="">
        <OrdersSearch />
      </div>

      <ErrorBoundaryWrapper>
        <DataTable
          columns={columns}
          data={orders}
          isLoading={isLoading || isProcessing}
          pagination={{
            total: pagination?.total || 0,
            limit: pagination?.limit || limit,
            page: pagination?.page || currentPage,
            pages: pagination?.pages || 1,
            hasNext: pagination?.hasNext || false,
            hasPrev: pagination?.hasPrev || false,
            onPageChange: handlePageChange,
          }}
          className="h-[74dvh] rounded-lg"
        />
      </ErrorBoundaryWrapper>

      {/* Order Sheet - order derived from list, always fresh */}
      <OrderSheet
        token={token}
        open={open}
        onOpenChange={handleOpenChange}
        order={selectedOrder}
      />
    </div>
  );
}
