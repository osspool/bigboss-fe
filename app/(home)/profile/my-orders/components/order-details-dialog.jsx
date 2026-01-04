"use client";

import { useState } from "react";
import { SheetWrapper } from "@classytic/clarity";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useOrderActions } from "@/hooks/query";
import { getStatusColor } from "@/lib/utils";
import { formatPrice } from "@/lib/constants";
import { formatVariantAttributes } from "@/lib/commerce-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function OrderDetailsDialog({ order, onClose, token }) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const { requestCancelOrder, isRequestingCancel } = useOrderActions(token);

  if (!order) return null;

  const handleRequestCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    try {
      await requestCancelOrder({
        orderId: order._id,
        reason: cancelReason,
      });
      setShowCancelDialog(false);
      setCancelReason("");
    } catch (error) {
      // Error is handled by the hook (toast)
    }
  };

  // Calculate subtotal
  const subtotal = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Normalize delivery data (API returns deliveryAddress, legacy UI expected deliveryDetails.address)
  const deliveryAddress =
    order.deliveryAddress ||
    order.deliveryDetails?.address ||
    {};
  const delivery = order.delivery || {};

  // Compute canCancel if not provided by API
  // Users can cancel if order is not already cancelled or delivered
  const canCancel = order.canCancel ?? (
    order.status !== 'cancelled' &&
    order.status !== 'delivered'
  );

 
  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      <SheetWrapper
        open={!!order}
        onOpenChange={onClose}
        title={`Order #${order._id.slice(-8).toUpperCase()}`}
        description={`Placed on ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
        side="right"
        size="lg"
        footer={
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            {canCancel && !order.cancellationRequest?.requested && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                disabled={isRequestingCancel}
                className="flex-1"
              >
                Request Cancellation
              </Button>
            )}
          </div>
        }
      >
      <ScrollArea className="h-full pr-4">
        <div className="space-y-5 pb-6">
          {/* Status Overview Card */}
          <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Order Status</span>
              </div>
              <Badge variant={getStatusColor(order.status)} className="capitalize">
                {order.status}
              </Badge>
            </div>

            {/* Payment Status */}
            {order.currentPayment && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPaymentStatusIcon(order.currentPayment.status)}
                    <Badge variant={order.currentPayment.status === 'verified' ? 'success' : 'secondary'} className="capitalize">
                      {order.currentPayment.status}
                    </Badge>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="pl-6 space-y-2 pt-1">
                  {order.currentPayment?.method && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Method</span>
                      <span className="capitalize font-medium">{order.currentPayment.method}</span>
                    </div>
                  )}
                  {order.currentPayment?.reference && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <span className="font-mono text-xs bg-background px-2 py-1 rounded border">
                        {order.currentPayment.reference}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Shipping Status */}
            {order.shipping && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Shipping</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {order.shipping.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                {order.shipping.trackingNumber && (
                  <div className="pl-6 space-y-2 pt-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tracking</span>
                      <span className="font-mono text-xs bg-background px-2 py-1 rounded border">
                        {order.shipping.trackingNumber}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Cancellation Request Notice */}
          {order.cancellationRequest?.requested && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="font-semibold text-sm text-warning">
                      Cancellation Requested
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your request is awaiting admin review
                    </p>
                  </div>
                  {order.cancellationRequest.reason && (
                    <div className="bg-background/50 rounded p-2 border border-warning/20">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Reason:</p>
                      <p className="text-sm">{order.cancellationRequest.reason}</p>
                    </div>
                  )}
                  {order.cancellationRequest.requestedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Requested on {new Date(order.cancellationRequest.requestedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Order Items</h3>
            </div>
            <div className="bg-muted/30 rounded-lg border divide-y">
              {order.items.map((item, index) => (
                <div key={index} className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">
                        {typeof item.product === 'string'
                          ? item.product
                          : item.product?.name || item.productName || 'Unknown Product'}
                      </p>
                      {item.variantAttributes && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <Badge variant="outline" className="text-xs font-normal">
                            {formatVariantAttributes(item.variantAttributes)}
                          </Badge>
                        </div>
                      )}
                      {item.variantSku && (
                        <p className="text-xs text-muted-foreground font-mono">
                          SKU: {item.variantSku}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Delivery Information</h3>
            </div>
            <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Delivery Method</span>
                <span className="font-medium flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                  {typeof delivery.method === 'string'
                    ? delivery.method
                    : delivery.method?.name || 'Delivery Method'}
                </span>
              </div>

              <Separator />

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-sm space-y-0.5">
                    <p className="font-medium">{deliveryAddress.addressLine1 || "Address not provided"}</p>
                    {deliveryAddress.addressLine2 && (
                      <p className="text-muted-foreground">{deliveryAddress.addressLine2}</p>
                    )}
                    {(deliveryAddress.city || deliveryAddress.state || deliveryAddress.postalCode) && (
                      <p className="text-muted-foreground">
                        {deliveryAddress.city || ""}{deliveryAddress.city && deliveryAddress.state ? ", " : ""}{deliveryAddress.state || ""}{" "}
                        {deliveryAddress.postalCode || ""}
                      </p>
                    )}
                    {deliveryAddress.country && (
                      <p className="text-muted-foreground">{deliveryAddress.country}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">{deliveryAddress.recipientPhone || "Phone not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Payment Summary</h3>
            </div>
            <div className="bg-muted/30 rounded-lg border p-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(order.subtotal || subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">{formatPrice(order.delivery.price)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-success flex items-center gap-1">
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                      {order.couponApplied?.code || 'DISCOUNT'}
                    </Badge>
                    Discount
                  </span>
                  <span className="font-medium text-success">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between pt-1">
                <span className="font-semibold text-base">Total Amount</span>
                <span className="font-bold text-lg">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          {order.createdAt && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2">
              <Calendar className="h-3 w-3" />
              <span>
                Order placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      </ScrollArea>
      </SheetWrapper>

      {/* Cancel Request Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Order Cancellation</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this order. Your request will be reviewed by our admin team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
              <Textarea
                id="cancel-reason"
                placeholder="e.g., Changed my mind, found a better price, wrong item ordered..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This will submit a cancellation request. An admin will review and process your request. You'll be notified once it's approved.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancelReason("");
              }}
              disabled={isRequestingCancel}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRequestCancel}
              disabled={isRequestingCancel || !cancelReason.trim()}
            >
              {isRequestingCancel ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
