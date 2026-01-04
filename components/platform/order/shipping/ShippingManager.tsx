"use client";

import { useState, useMemo } from "react";
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CreateShipmentDialog } from "./CreateShipmentDialog";

import {
  usePickupStores,
  useLogisticsActions,
  useTrackShipment,
} from "@/hooks/query";
import type { Order, OrderShipping, ShippingStatus } from "@/types";

// ==================== Status Helpers ====================

const SHIPPING_STATUS_CONFIG: Record<
  ShippingStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "bg-muted text-muted-foreground",
    icon: <Clock className="h-4 w-4" />,
  },
  requested: {
    label: "Pickup Requested",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    icon: <Store className="h-4 w-4" />,
  },
  picked_up: {
    label: "Picked Up",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    icon: <Package className="h-4 w-4" />,
  },
  in_transit: {
    label: "In Transit",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
    icon: <Truck className="h-4 w-4" />,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    icon: <Truck className="h-4 w-4" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-500/10 text-green-600 border-green-500/30",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  failed_attempt: {
    label: "Failed Attempt",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  returned: {
    label: "Returned",
    color: "bg-red-500/10 text-red-600 border-red-500/30",
    icon: <XCircle className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-destructive/10 text-destructive border-destructive/30",
    icon: <XCircle className="h-4 w-4" />,
  },
};

function getStatusConfig(status: ShippingStatus) {
  return (
    SHIPPING_STATUS_CONFIG[status] || {
      label: status,
      color: "bg-muted text-muted-foreground",
      icon: <Clock className="h-4 w-4" />,
    }
  );
}

// ==================== Props ====================

interface ShippingManagerProps {
  token: string;
  order: Order;
  disabled?: boolean;
  onSuccess?: () => void;
}

// ==================== Main Component ====================

export function ShippingManager({
  token,
  order,
  disabled = false,
  onSuccess,
}: ShippingManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const shipping = order.shipping;
  const hasShipping = !!shipping?.provider || !!shipping?.trackingNumber;
  const canCreateShipment =
    order.status === "confirmed" && !hasShipping;
  const canCancelShipment =
    hasShipping &&
    shipping?.status &&
    !["delivered", "cancelled", "returned"].includes(shipping.status);

  // Logistics actions
  const { cancelShipment, isCancellingShipment, isLoading } =
    useLogisticsActions(token);

  // Track shipment if we have a consignment ID
  const { data: trackingData, refetch: refetchTracking, isRefetching } =
    useTrackShipment(
      token,
      shipping?.consignmentId || null,
      { enabled: !!shipping?.consignmentId }
    );

  const handleCancelShipment = async () => {
    if (!shipping?.consignmentId) return;
    if (
      !window.confirm(
        "Cancel this shipment? This action may not be reversible."
      )
    )
      return;

    try {
      await cancelShipment({
        shipmentId: shipping.consignmentId,
        reason: "Cancelled by admin",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to cancel shipment:", error);
    }
  };

  const handleRefreshTracking = () => {
    refetchTracking();
  };

  const statusConfig = shipping?.status
    ? getStatusConfig(shipping.status as ShippingStatus)
    : null;

  return (
    <div className="space-y-6">
      {/* No Shipping Yet - Show Create Option */}
      {!hasShipping && (
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
          <Truck className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <h4 className="font-medium text-sm mb-1">No Shipping Information</h4>
          <p className="text-xs text-muted-foreground mb-4">
            {canCreateShipment
              ? "Create a shipment to request courier pickup"
              : "Order must be confirmed before creating shipment"}
          </p>
          {canCreateShipment && (
            <Button
              type="button"
              onClick={() => setShowCreateDialog(true)}
              disabled={disabled || isLoading}
              size="sm"
            >
              <Package className="h-4 w-4 mr-2" />
              Create Shipment
            </Button>
          )}
        </div>
      )}

      {/* Shipping Status Card */}
      {hasShipping && statusConfig && (
        <div
          className={`rounded-lg border p-4 space-y-4 ${statusConfig.color}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {statusConfig.icon}
              <h4 className="font-semibold">Shipping Status</h4>
            </div>
            <Badge variant="outline" className="capitalize">
              {statusConfig.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {shipping?.provider && (
              <div>
                <span className="text-xs opacity-70">Provider</span>
                <p className="font-semibold capitalize">{shipping.provider}</p>
              </div>
            )}
            {shipping?.trackingNumber && (
              <div>
                <span className="text-xs opacity-70">Tracking #</span>
                <p className="font-mono text-xs">{shipping.trackingNumber}</p>
              </div>
            )}
            {shipping?.estimatedDelivery && (
              <div>
                <span className="text-xs opacity-70">Est. Delivery</span>
                <p className="font-medium">
                  {new Date(shipping.estimatedDelivery).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-current/20">
            {shipping?.trackingUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-xs"
              >
                <a
                  href={shipping.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3 mr-1.5" />
                  Track Package
                </a>
              </Button>
            )}
            {shipping?.consignmentId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshTracking}
                disabled={isRefetching}
                className="text-xs"
              >
                {isRefetching ? (
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1.5" />
                )}
                Refresh Status
              </Button>
            )}
            {canCancelShipment && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelShipment}
                disabled={disabled || isCancellingShipment}
                className="text-xs"
              >
                {isCancellingShipment ? (
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1.5" />
                )}
                Cancel Shipment
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Shipping Details (Collapsible) */}
      {hasShipping && (
        <Collapsible className="border rounded-lg">
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              <span>Shipping Details</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 border-t space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {shipping?.consignmentId && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Consignment ID
                    </span>
                    <p className="font-mono text-xs">{shipping.consignmentId}</p>
                  </div>
                )}
                {shipping?.requestedAt && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Requested At
                    </span>
                    <p className="text-xs">
                      {new Date(shipping.requestedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {shipping?.pickedUpAt && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Picked Up At
                    </span>
                    <p className="text-xs">
                      {new Date(shipping.pickedUpAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {shipping?.deliveredAt && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Delivered At
                    </span>
                    <p className="text-xs">
                      {new Date(shipping.deliveredAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {shipping?.labelUrl && (
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground">
                      Shipping Label
                    </span>
                    <a
                      href={shipping.labelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Download Label
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Shipping History Timeline */}
      {shipping?.history && shipping.history.length > 0 && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium">Shipping History</h4>
            <p className="text-xs text-muted-foreground">Status updates from courier</p>
          </div>
          <ShippingTimeline history={shipping.history} />
        </div>
      )}

      {/* Create Shipment Dialog */}
      <CreateShipmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        token={token}
        order={order}
        onSuccess={() => {
          setShowCreateDialog(false);
          onSuccess?.();
        }}
      />
    </div>
  );
}

// ==================== Shipping Timeline ====================

interface ShippingTimelineProps {
  history: NonNullable<OrderShipping["history"]>;
}

function ShippingTimeline({ history }: ShippingTimelineProps) {
  // Sort by timestamp descending (newest first)
  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [history]
  );

  return (
    <div className="relative space-y-3">
      {/* Vertical line */}
      <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

      {sortedHistory.map((entry, idx) => {
        const statusConfig = getStatusConfig(entry.status as ShippingStatus);
        const isFirst = idx === 0;

        return (
          <div key={idx} className="relative flex gap-3 pl-1">
            {/* Timeline dot */}
            <div
              className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                isFirst
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-muted-foreground/30"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isFirst ? "bg-primary-foreground" : "bg-muted-foreground/50"
                }`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 pb-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${isFirst ? statusConfig.color : ""}`}
                >
                  {statusConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              {entry.note && (
                <p className="text-sm text-muted-foreground mt-1">
                  {entry.note}
                </p>
              )}
              {entry.actor && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  By: {entry.actor}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==================== Loading State ====================

export function ShippingManagerSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}
