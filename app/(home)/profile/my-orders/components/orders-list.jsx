// app/profile/my-orders/components/OrdersList.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OrderDetailsDialog from "./order-details-dialog";
import { ApiPagination } from "@/components/custom/ui/api-pagination";
import { useMyOrders, useOrderActions } from "@/hooks/query/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { getStatusColor } from "@/lib/utils";
import { MyOrderSearch } from "./MyOrderSearch";
import { useMyOrderSearch } from "@/hooks/filter/use-my-order-search";
import { formatPrice } from "@/lib/constants";

export default function OrdersList({ initialPage, token }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const myOrderSearch = useMyOrderSearch();

  const currentPage = Number(searchParams.get("page")) || initialPage;

  // Get search params from the search hook
  const searchFilters = myOrderSearch.getSearchParams();

  const { items: orders, pagination, isLoading, error } = useMyOrders(
    token,
    {
      page: currentPage,
      limit: 10,
      ...searchFilters,
    }
  );

  // Customer order actions
  const { requestCancelOrder, isRequestingCancel } = useOrderActions(token);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/profile/my-orders?${params.toString()}`);
  };

  const handleRequestCancel = async (order) => {
    if (window.confirm("Are you sure you want to request cancellation for this order?")) {
      const reason = prompt("Reason for cancellation (optional):");
      if (reason !== null) {
        await requestCancelOrder({
          orderId: order._id,
          reason: reason || undefined,
        });
      }
    }
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading orders: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">My Orders</h2>
      </div>

      <MyOrderSearch />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      ) : orders?.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <Card
              key={order._id}
              className="hover:bg-accent/50 transition-colors"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Order #{order._id.slice(-8).toUpperCase()}
                    {order.isGift && (
                      <Badge variant="secondary" className="text-xs">
                        🎁 Gift
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
                <Badge
                  variant={getStatusColor(order.status)}
                  className="capitalize"
                >
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Items</p>
                    <p className="font-medium">
                      {order.items.reduce(
                        (acc, item) => acc + item.quantity,
                        0
                      )}{" "}
                      items
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="font-medium">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Status
                    </p>
                    <p className="font-medium capitalize">
                      {order.paymentStatus || "Pending"}
                    </p>
                  </div>
                </div>

                {/* Gift order recipient info */}
                {order.isGift && order.deliveryAddress?.recipientName && (
                  <div className="mt-4 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Gift Recipient: <span className="font-medium text-foreground">{order.deliveryAddress.recipientName}</span>
                    </p>
                  </div>
                )}

                {/* Cancellation request notice */}
                {order.cancellationRequest?.requested && (
                  <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm text-warning font-medium">
                      Cancellation requested - Awaiting admin review
                    </p>
                    {order.cancellationRequest.reason && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Reason: {order.cancellationRequest.reason}
                      </p>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-4 flex justify-end gap-2 flex-wrap">
                  {/* Only allow cancel request if order can be cancelled */}
                  {(order.canCancel ?? (order.status !== 'cancelled' && order.status !== 'delivered')) &&
                   !order.cancellationRequest?.requested && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRequestCancel(order)}
                      disabled={isRequestingCancel}
                    >
                      Request Cancellation
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.total > 0 && (
        <ApiPagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          limit={pagination.limit}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          onPageChange={handlePageChange}
        />
      )}

      <OrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        token={token}
      />
    </div>
  );
}
