"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/api/platform/order-api";
import { createCrudHooks, createListQuery, createDetailQuery } from "@/hooks/factories";
import { toast } from "sonner";

// ==================== Base CRUD Hooks (Admin) ====================

const { KEYS, useList, useDetail, useActions } = createCrudHooks({
  api: orderApi,
  entityKey: "orders",
  singular: "Order",
  plural: "Orders",
  defaults: {
    staleTime: 30 * 1000, // 30 seconds - orders change frequently
    messages: {
      createSuccess: "Order placed successfully",
      updateSuccess: "Order updated successfully",
      deleteSuccess: "Order deleted successfully",
    },
  },
});

// Extend KEYS with custom query keys
const ORDER_KEYS = {
  ...KEYS,
  myOrders: (params) => ["orders", "my", params],
  myDetail: (id) => ["orders", "my", "detail", id],
};

// Alias for admin list
const useOrdersList = useList;

// ==================== Customer Hooks ====================

/**
 * Get my orders (customer)
 * @param {string} token - Access token
 * @param {Object} params - Query params { page, limit, status, sort }
 * @param {Object} options - React Query options
 */
export function useMyOrders(token, params = {}, options = {}) {
  return createListQuery({
    queryKey: ORDER_KEYS.myOrders(params),
    queryFn: () => orderApi.getMyOrders({ token, params }),
    enabled: !!token,
    options: {
      staleTime: 30 * 1000,
      ...options,
    },
    // Prefill detail cache to avoid redundant API calls when viewing order details
    prefillDetailCache: true,
    detailKeyBuilder: (id) => ORDER_KEYS.myDetail(id),
  });
}

/**
 * Get my order detail (customer)
 * @param {string} token - Access token
 * @param {string} orderId - Order ID
 * @param {Object} options - React Query options
 */
export function useMyOrderDetail(token, orderId, options = {}) {
  return createDetailQuery({
    queryKey: ORDER_KEYS.myDetail(orderId),
    queryFn: () => orderApi.getMyOrder({ token, id: orderId }),
    enabled: !!token && !!orderId,
    options: {
      staleTime: 30 * 1000,
      ...options,
    },
  });
}

/**
 * Customer order actions (checkout, cancel)
 * @param {string} token - Access token
 */
export function useOrderActions(token) {
  const queryClient = useQueryClient();

  // Checkout mutation - creates order from cart
  // Backend automatically fetches cart items
  const checkoutMutation = useMutation({
    mutationFn: (data) => orderApi.checkout({ token, data }),
    onSuccess: (result) => {
      // Clear cart and invalidate all order queries
      queryClient.setQueryData(["cart"], null);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(result.message || "Order placed successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to place order");
    },
  });

  // Request cancellation mutation (customer must request, admin approves)
  const requestCancelMutation = useMutation({
    mutationFn: ({ orderId, reason }) =>
      orderApi.requestCancel({ token, id: orderId, data: { reason } }),
    onSuccess: (result) => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Cancellation request submitted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to request cancellation");
    },
  });

  return {
    createOrder: checkoutMutation.mutateAsync,
    isCreating: checkoutMutation.isPending,
    requestCancelOrder: requestCancelMutation.mutateAsync,
    isRequestingCancel: requestCancelMutation.isPending,
  };
}

// ==================== Admin Hooks ====================

/**
 * Admin order actions (updateStatus, fulfill, refund, cancel, shipping)
 * @param {string} token - Admin access token
 */
export function useAdminOrderActions(token) {
  const queryClient = useQueryClient();

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, note }) =>
      orderApi.updateStatus({ token, id: orderId, data: { status, note } }),
    onSuccess: (result) => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(result.message || "Order status updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  // Fulfill order mutation (ship)
  // Accepts branchId or branchSlug for inventory decrement
  const fulfillMutation = useMutation({
    mutationFn: ({ orderId, trackingNumber, carrier, notes, estimatedDelivery, branchId, branchSlug }) =>
      orderApi.fulfill({
        token,
        id: orderId,
        data: { trackingNumber, carrier, notes, estimatedDelivery, branchId, branchSlug }
      }),
    onSuccess: (result) => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Also invalidate branch/inventory queries since stock was decremented
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success(result.message || "Order shipped successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to ship order");
    },
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: ({ orderId, amount, reason }) =>
      orderApi.refund({ token, id: orderId, data: { amount, reason } }),
    onSuccess: (result) => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(result.message || "Refund processed successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process refund");
    },
  });

  // Cancel order mutation (admin can directly cancel)
  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason, refund = false }) =>
      orderApi.cancel({ token, id: orderId, data: { reason, refund } }),
    onSuccess: (result) => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(result.message || "Order cancelled");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel order");
    },
  });

  // Request shipping pickup mutation
  const requestShippingMutation = useMutation({
    mutationFn: ({ orderId, provider, metadata }) =>
      orderApi.requestShipping({ token, id: orderId, data: { provider, metadata } }),
    onSuccess: (result) => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(result.message || "Shipping pickup requested");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to request shipping");
    },
  });

  // Update shipping status mutation
  const updateShippingMutation = useMutation({
    mutationFn: ({ orderId, status, trackingNumber, trackingUrl, note, metadata }) =>
      orderApi.updateShipping({ 
        token, 
        id: orderId, 
        data: { status, trackingNumber, trackingUrl, note, metadata } 
      }),
    onSuccess: (result) => {
      // Invalidate all order-related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(result.message || "Shipping status updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update shipping");
    },
  });

  return {
    // Status
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    // Fulfillment
    fulfillOrder: fulfillMutation.mutateAsync,
    isFulfilling: fulfillMutation.isPending,
    // Refund
    refundOrder: refundMutation.mutateAsync,
    isRefunding: refundMutation.isPending,
    // Cancel
    cancelOrder: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    // Shipping
    requestShipping: requestShippingMutation.mutateAsync,
    isRequestingShipping: requestShippingMutation.isPending,
    updateShipping: updateShippingMutation.mutateAsync,
    isUpdatingShipping: updateShippingMutation.isPending,
  };
}

// ==================== Exports ====================

export {
  ORDER_KEYS,
  // Admin hooks from factory
  useOrdersList,
  useList as useAdminOrders,
  useDetail as useAdminOrderDetail,
  useActions as useAdminCrudActions, // Basic CRUD (create, update, delete)
};
