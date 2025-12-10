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
  useAdminOrderActions 
} from "@/hooks/query/useOrders";

export function OrdersClient({ token, initialLimit = 15 }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sheet state for viewing/editing orders
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleOpenChange = useCallback((isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelected(null);
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
    const customerPhone = searchParams.get("deliveryAddress.phone");
    if (orderId) params._id = orderId;
    if (customerPhone) params["deliveryAddress.phone"] = customerPhone;
    
    // Filter params
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("currentPayment.status");
    const dateFrom = searchParams.get("createdAt[gte]");
    const dateTo = searchParams.get("createdAt[lte]");
    
    if (status) params.status = status;
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

  // ==================== Handlers ====================

  // View/Edit - open sheet with order data from list
  const handleEdit = useCallback((order) => {
    setSelected(order);
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
            totalDocs: pagination?.total || orders.length,
            limit: pagination?.limit || limit,
            currentPage: pagination?.page || currentPage,
            totalPages: pagination?.pages || 1,
            hasNextPage: pagination?.hasNext || false,
            hasPrevPage: pagination?.hasPrev || false,
            onPageChange: handlePageChange,
          }}
          className="h-[74dvh] rounded-lg"
        />
      </ErrorBoundaryWrapper>

      {/* Order Sheet - uses data from list API directly */}
      <OrderSheet
        token={token}
        open={open}
        onOpenChange={handleOpenChange}
        order={selected}
      />
    </div>
  );
}
