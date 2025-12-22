"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  Clock,
  User,
  CreditCard,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormErrorSummary } from "@/components/form/form-utils/FormErrorSummary";
import { DynamicTabs } from "@/components/custom/ui/tabs-wrapper";
import { FormGenerator, FormSection } from "@/components/form/form-system";

import { useAdminCrudActions, useAdminOrderActions } from "@/hooks/query/useOrders";
import { useVerifyPayment, useRejectPayment } from "@/hooks/query/usePaymentVerification";
import { useBranchOptional } from "@/contexts/BranchContext";
import { formatPrice } from "@/lib/constants";
import { useNotifySubmitState } from "@/hooks/use-form-submit-state";
import { formatVariantAttributes } from "@/lib/commerce-utils";
import {
  orderUpdateSchema,
  normalizeOrderForForm,
} from "@/schemas/order.schema";
import {
  orderSummarySchema,
  deliveryAddressSchema,
  deliveryMethodSchema,
} from "./order-form-schema";
import { ShippingManager } from "../shipping";

/**
 * Order Edit Form
 * 
 * Orders are created via checkout flow (POST /orders).
 * This form is for EDITING existing orders only.
 * 
 * Tabs:
 * - Summary: Status, notes, order totals, items (read-only)
 * - Payment: Payment info with verify/reject actions
 * - Delivery: Address and delivery method
 * - Shipping: Courier information and history
 * - Timeline: Order events history
 * - Info: Customer, coupon, cancellation, timestamps
 */
export function OrderForm({
  token,
  order,
  onSuccess,
  onCancel,
  onSubmitStateChange,
  formId = "order-form",
  hideActions = false,
}) {
  // Payment verification states
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  // Payment verification hooks
  const { verifyPayment, isVerifying } = useVerifyPayment(token);
  const { rejectPayment, isRejecting } = useRejectPayment(token);

  // Branch context for fulfillment (uses selected branch for inventory decrement)
  const branchContext = useBranchOptional();

  // Orders must exist - no create mode
  if (!order?._id) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>No order selected. Orders are created via the checkout flow.</p>
      </div>
    );
  }

  const normalizedDefaults = useMemo(() => 
    normalizeOrderForForm(order), 
    [order]
  );

  const form = useForm({
    resolver: zodResolver(orderUpdateSchema),
    defaultValues: normalizedDefaults,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    form.reset(normalizedDefaults);
  }, [normalizedDefaults, form]);

  const { update: updateOrder, isUpdating } = useAdminCrudActions();
  const { 
    updateStatus, 
    cancelOrder,
    fulfillOrder,
    isUpdatingStatus,
    isCancelling,
    isFulfilling,
  } = useAdminOrderActions(token);

  const isSubmitting = isUpdating || isUpdatingStatus || isCancelling || isFulfilling || isVerifying || isRejecting;

  useNotifySubmitState(isSubmitting, onSubmitStateChange);
  const formErrors = form.formState.errors;

  // ==================== Payment Verification Handlers ====================

  const transactionId = order.currentPayment?.transactionId || order.currentPayment?._id;
  const isPendingPayment = order.currentPayment?.status === 'pending' && transactionId;

  const handleVerifyPayment = useCallback(async () => {
    if (!window.confirm("Verify this payment? This will update the order status to confirmed.")) {
      return;
    }

    try {
      await verifyPayment({
        transactionId,
        notes: `Verified by admin for Order #${order._id?.slice(-8)}`,
      });

      onSuccess?.();
    } catch (error) {
      console.error("Payment verification failed:", error);
    }
  }, [transactionId, order._id, verifyPayment, onSuccess]);

  const handleRejectPayment = useCallback(async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await rejectPayment({
        transactionId,
        reason: rejectReason,
      });

      setShowRejectDialog(false);
      setRejectReason("");
      onSuccess?.();
    } catch (error) {
      console.error("Payment rejection failed:", error);
    }
  }, [transactionId, rejectReason, rejectPayment, onSuccess]);

  // ==================== Form Handlers ====================

  const handleSubmit = useCallback(
    async (values) => {
      try {
        // Build update payload - only send changed fields
        const payload = {};
        
        if (values.status && values.status !== order.status) {
          payload.status = values.status;
        }
        
        if (values.notes !== order.notes) {
          payload.notes = values.notes;
        }

        // Check if delivery address changed
        const addrFields = ['label', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country', 'phone', 'recipientName'];
        const addrChanged = addrFields.some(f =>
          values.deliveryAddress?.[f] !== order.deliveryAddress?.[f]
        );
        if (addrChanged) {
          payload.deliveryAddress = values.deliveryAddress;
        }

        // Check if delivery method changed
        if (values.delivery?.method !== order.delivery?.method ||
            values.delivery?.price !== order.delivery?.price) {
          payload.delivery = values.delivery;
        }

        // Check if shipping info changed
        const shipFields = ['provider', 'trackingNumber', 'trackingUrl', 'consignmentId', 'estimatedDelivery'];
        const shipChanged = shipFields.some(f => 
          values.shipping?.[f] !== order.shipping?.[f]
        );
        if (shipChanged) {
          payload.shipping = values.shipping;
        }

        if (Object.keys(payload).length === 0) {
          toast.info("No changes to save");
          return;
        }

        await updateOrder({ token, id: order._id, data: payload });
        onSuccess?.();
      } catch (error) {
        console.error(error);
      }
    },
    [order, updateOrder, token, onSuccess]
  );

  const handleSubmitError = useCallback((errors) => {
    console.warn("Order form validation failed", errors);
    toast.error("Please resolve validation errors before submitting");
  }, []);

  // ==================== Quick Actions ====================

  const handleQuickStatus = useCallback(async (newStatus) => {
    const confirmMsg = {
      confirmed: "Confirm this order?",
      shipped: "Mark this order as shipped?",
      delivered: "Mark this order as delivered?",
      cancelled: "Cancel this order?",
    };
    
    if (!window.confirm(confirmMsg[newStatus] || `Change status to ${newStatus}?`)) {
      return;
    }

    try {
      if (newStatus === 'cancelled') {
        await cancelOrder({ orderId: order._id, reason: "Cancelled by admin" });
      } else {
        await updateStatus({ orderId: order._id, status: newStatus });
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  }, [order._id, updateStatus, cancelOrder, onSuccess]);

  const handleFulfill = useCallback(async () => {
    const trackingNumber = form.getValues("shipping.trackingNumber");
    const carrier = form.getValues("shipping.provider");

    // Get selected branch for inventory decrement
    const branchId = branchContext?.selectedBranch?._id;
    const branchName = branchContext?.selectedBranch?.name || 'default branch';

    if (!window.confirm(`Ship this order from ${branchName}?`)) return;

    try {
      await fulfillOrder({
        orderId: order._id,
        trackingNumber,
        carrier,
        branchId, // Pass selected branch for inventory decrement
      });
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  }, [order._id, fulfillOrder, form, onSuccess, branchContext?.selectedBranch]);

  // ==================== Status Helpers ====================

  const canConfirm = order.status === 'pending' || order.status === 'processing';
  const canShip = order.status === 'confirmed';
  const canDeliver = order.status === 'shipped';
  const canCancel = order.status !== 'cancelled' && order.status !== 'delivered';

  // ==================== Payment Status Helpers ====================

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return 'bg-success/10 text-success border-success/30';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'failed':
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'refunded':
      case 'partially_refunded':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // ==================== Tabs ====================

  const tabs = [
    {
      value: "summary",
      label: "Summary",
      content: (
        <div className="space-y-6">
          {/* Cancellation Request Alert - Show prominently at top (hide once cancelled) */}
          {order.cancellationRequest?.requested && order.status !== 'cancelled' && (
            <div className="bg-warning/10 border-2 border-warning/40 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="font-semibold text-base text-warning">
                      ⚠️ Customer Requested Cancellation
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This order has a pending cancellation request. Review and take action.
                    </p>
                  </div>
                  {order.cancellationRequest.reason && (
                    <div className="bg-background/80 rounded p-3 border border-warning/30">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Customer&apos;s Reason:</p>
                      <p className="text-sm font-medium">{order.cancellationRequest.reason}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Requested: {order.cancellationRequest.requestedAt
                          ? new Date(order.cancellationRequest.requestedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleQuickStatus('cancelled')}
                      disabled={isSubmitting}
                    >
                      Approve & Cancel Order
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("Cancellation request ignored. Order will continue processing.")}
                      disabled={isSubmitting}
                    >
                      Ignore Request
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Status Actions */}
          <div className="flex flex-wrap gap-2">
            {canConfirm && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickStatus('confirmed')}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Order
              </Button>
            )}
            {canShip && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFulfill}
                disabled={isSubmitting}
              >
                <Truck className="h-4 w-4 mr-2" />
                Ship Order
              </Button>
            )}
            {canDeliver && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickStatus('delivered')}
                disabled={isSubmitting}
              >
                <Package className="h-4 w-4 mr-2" />
                Mark Delivered
              </Button>
            )}
            {canCancel && !order.cancellationRequest?.requested && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleQuickStatus('cancelled')}
                disabled={isSubmitting}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            )}
          </div>

          <Separator />

          <FormGenerator
            schema={orderSummarySchema}
            control={form.control}
            disabled={isSubmitting}
          />

          {/* Order Totals (Read-only) */}
          <FormSection
            title="Order Totals"
            description="Calculated at checkout (read-only)"
            variant="muted"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Subtotal</span>
                <p className="font-semibold">{formatPrice(order.subtotal || 0)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Delivery</span>
                <p className="font-semibold">{formatPrice(order.delivery?.price || 0)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Discount</span>
                <p className="font-semibold">-{formatPrice(order.discountAmount || 0)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Total</span>
                <p className="font-semibold text-primary">{formatPrice(order.totalAmount || 0)}</p>
              </div>
            </div>
          </FormSection>

          {/* Items Summary (Read-only) */}
          <FormSection
            title="Order Items"
            description={`${order.items?.length || 0} item(s)`}
            variant="muted"
          >
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                  <div className="flex-1">
                    <span className="font-medium">{item.productName}</span>
                    {item.variantSku && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        SKU: {item.variantSku}
                      </span>
                    )}
                    {item.variantAttributes && (
                      <span className="text-muted-foreground ml-2">
                        ({formatVariantAttributes(item.variantAttributes)})
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">×{item.quantity}</span>
                    <span className="ml-2 font-medium">{formatPrice(item.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </FormSection>
        </div>
      ),
    },
    {
      value: "payment",
      label: "Payment",
      content: (
        <div className="space-y-6">
          {/* Payment Status Card */}
          {order.currentPayment && (
            <div className={`rounded-lg border p-4 space-y-4 ${getPaymentStatusColor(order.currentPayment.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <h4 className="font-semibold">Payment Status</h4>
                </div>
                <Badge variant="outline" className="capitalize text-sm">
                  {order.currentPayment.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs opacity-70">Amount</span>
                  <p className="font-bold text-lg">
                    {formatPrice((order.currentPayment.amount || 0) / 100)}
                  </p>
                </div>
                <div>
                  <span className="text-xs opacity-70">Method</span>
                  <p className="font-semibold capitalize">{order.currentPayment.method}</p>
                </div>
                {order.currentPayment.reference && (
                  <div className="col-span-2 md:col-span-1">
                    <span className="text-xs opacity-70">Transaction ID</span>
                    <p className="font-mono text-xs bg-background/80 px-2 py-1 rounded truncate">
                      {order.currentPayment.reference}
                    </p>
                  </div>
                )}
              </div>

              {order.currentPayment.verifiedAt && (
                <div className="text-xs opacity-70 pt-2 border-t border-current/20">
                  Verified: {new Date(order.currentPayment.verifiedAt).toLocaleString()}
                  {order.currentPayment.verifiedBy && ` by ${order.currentPayment.verifiedBy}`}
                </div>
              )}
            </div>
          )}

          {/* Payment Verification Actions */}
          {isPendingPayment && (
            <div className="bg-warning/10 border-2 border-warning/40 rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-warning">Payment Verification Required</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    This payment is pending verification. Review the customer&apos;s payment details and verify or reject.
                  </p>
                </div>
              </div>

              {/* Customer Payment Reference Info */}
              <div className="bg-background/80 rounded-lg p-3 border border-warning/30">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Customer Payment Info:</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Method:</span>
                    <p className="font-medium capitalize">{order.currentPayment?.method}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Amount:</span>
                    <p className="font-medium">{formatPrice((order.currentPayment?.amount || 0) / 100)}</p>
                  </div>
                  {order.currentPayment?.reference && (
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground">Customer TrxID:</span>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded mt-1">
                        {order.currentPayment.reference}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleVerifyPayment}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Verify Payment
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isRejecting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject Payment
                </Button>
              </div>
            </div>
          )}

          {/* No Payment Info */}
          {!order.currentPayment && (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No payment information available</p>
            </div>
          )}

          {/* Payment Already Processed */}
          {order.currentPayment && !isPendingPayment && order.currentPayment.status !== 'pending' && (
            <FormSection
              title="Payment Status"
              variant="muted"
            >
              <p className="text-sm text-muted-foreground">
                Payment has been processed. Status: <strong className="capitalize">{order.currentPayment.status}</strong>
              </p>
            </FormSection>
          )}
        </div>
      ),
    },
    {
      value: "delivery",
      label: "Delivery",
      content: (
        <div className="space-y-6">
          <FormGenerator
            schema={deliveryAddressSchema}
            control={form.control}
            disabled={isSubmitting}
          />
          <FormGenerator
            schema={deliveryMethodSchema}
            control={form.control}
            disabled={isSubmitting}
          />
        </div>
      ),
    },
    {
      value: "shipping",
      label: "Shipping",
      content: (
        <ShippingManager
          token={token}
          order={order}
          disabled={isSubmitting}
          onSuccess={onSuccess}
        />
      ),
    },
    {
      value: "timeline",
      label: "Timeline",
      content: (
        <div className="space-y-4">
          {/* Timeline Section */}
          <FormSection
            title="Order Timeline"
            description="Chronological history of order events"
            variant="muted"
          >
            {order.timeline && order.timeline.length > 0 ? (
              <div className="relative space-y-4">
                {/* Vertical timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                {order.timeline.map((event, idx) => {
                  // Determine icon based on event type
                  const getEventIcon = (eventType) => {
                    if (eventType.includes('created')) return <Package className="h-4 w-4" />;
                    if (eventType.includes('confirmed')) return <CheckCircle className="h-4 w-4" />;
                    if (eventType.includes('shipped') || eventType.includes('ship')) return <Truck className="h-4 w-4" />;
                    if (eventType.includes('delivered')) return <CheckCircle className="h-4 w-4" />;
                    if (eventType.includes('cancelled') || eventType.includes('cancel')) return <XCircle className="h-4 w-4" />;
                    if (eventType.includes('payment')) return <CreditCard className="h-4 w-4" />;
                    if (eventType.includes('status')) return <Clock className="h-4 w-4" />;
                    return <Clock className="h-4 w-4" />;
                  };

                  const getEventColor = (eventType) => {
                    if (eventType.includes('created')) return 'text-blue-500';
                    if (eventType.includes('confirmed')) return 'text-green-500';
                    if (eventType.includes('shipped') || eventType.includes('ship')) return 'text-purple-500';
                    if (eventType.includes('delivered')) return 'text-green-600';
                    if (eventType.includes('cancelled') || eventType.includes('cancel')) return 'text-red-500';
                    if (eventType.includes('payment')) return 'text-yellow-500';
                    return 'text-muted-foreground';
                  };

                  return (
                    <div key={idx} className="relative flex gap-4">
                      {/* Timeline dot with icon */}
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 ${getEventColor(event.event)}`}>
                        {getEventIcon(event.event)}
                      </div>

                      {/* Event content */}
                      <div className="flex-1 pb-8">
                        <div className="bg-muted/30 rounded-lg border p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{event.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs font-mono">
                                  {event.event}
                                </Badge>
                                {event.metadata?.actorRole && (
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {event.metadata.actorRole}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs text-muted-foreground">
                                {event.timestamp
                                  ? new Date(event.timestamp).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })
                                  : '-'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {event.timestamp
                                  ? new Date(event.timestamp).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : ''}
                              </p>
                            </div>
                          </div>

                          {/* Event metadata */}
                          {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {event.metadata.previousStatus && event.metadata.newStatus && (
                                  <div>
                                    <span className="text-muted-foreground">Status Change: </span>
                                    <span className="font-medium">
                                      {event.metadata.previousStatus} → {event.metadata.newStatus}
                                    </span>
                                  </div>
                                )}
                                {event.metadata.reason && (
                                  <div className="col-span-full">
                                    <span className="text-muted-foreground">Reason: </span>
                                    <span className="font-medium">{event.metadata.reason}</span>
                                  </div>
                                )}
                                {event.metadata.itemCount && (
                                  <div>
                                    <span className="text-muted-foreground">Items: </span>
                                    <span className="font-medium">{event.metadata.itemCount}</span>
                                  </div>
                                )}
                                {event.metadata.total && (
                                  <div>
                                    <span className="text-muted-foreground">Total: </span>
                                    <span className="font-medium">{formatPrice(event.metadata.total)}</span>
                                  </div>
                                )}
                                {event.metadata.paymentMethod && (
                                  <div>
                                    <span className="text-muted-foreground">Payment: </span>
                                    <span className="font-medium capitalize">{event.metadata.paymentMethod}</span>
                                  </div>
                                )}
                                {event.metadata.selfService && (
                                  <div>
                                    <span className="text-muted-foreground">Self-service: </span>
                                    <span className="font-medium">Yes</span>
                                  </div>
                                )}
                                {event.performedBy && (
                                  <div className="col-span-full flex items-center gap-1.5 text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span>By: {event.performedBy}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No timeline events available</p>
              </div>
            )}
          </FormSection>
        </div>
      ),
    },
    {
      value: "info",
      label: "Info",
      content: (() => {
        // Determine if recipient differs from customer (gift/proxy order)
        const recipientName = order.deliveryAddress?.recipientName;
        const recipientPhone = order.deliveryAddress?.recipientPhone;
        const hasDistinctRecipient = recipientName && recipientName !== order.customerName;

        // Source display config
        const sourceLabels = { pos: 'Point of Sale', web: 'Website', api: 'API Integration' };
        const sourceColors = {
          pos: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
          web: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          api: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
        };

        return (
          <div className="space-y-6">
            {/* Order Source & Channel Info */}
            <FormSection
              title="Order Source"
              description="Where and how this order was placed"
              variant="muted"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Channel</span>
                  <div>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${sourceColors[order.source] || sourceColors.web}`}>
                      {sourceLabels[order.source] || order.source || 'Unknown'}
                    </span>
                  </div>
                </div>
                {order.branch && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Fulfillment Branch</span>
                    <p className="font-mono text-xs">{order.branch}</p>
                  </div>
                )}
                {order.source === 'pos' && order.cashier && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Processed By (Cashier)</span>
                    <p className="font-mono text-xs">{order.cashier}</p>
                  </div>
                )}
                {order.source === 'pos' && order.terminalId && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Terminal ID</span>
                    <p className="font-mono text-xs">{order.terminalId}</p>
                  </div>
                )}
                {order.idempotencyKey && (
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-muted-foreground">Idempotency Key</span>
                    <p className="font-mono text-xs truncate" title={order.idempotencyKey}>
                      {order.idempotencyKey}
                    </p>
                  </div>
                )}
              </div>
            </FormSection>

            {/* Customer Info (Read-only) - The buyer */}
            <FormSection
              title="Customer (Buyer)"
              description="Who placed the order"
              variant="muted"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Name</span>
                  <p className="font-medium">{order.customerName || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Phone</span>
                  <p className="font-medium">{order.customerPhone || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium">{order.customerEmail || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Customer ID</span>
                  <p className="font-mono text-xs">{order.customer || 'Guest'}</p>
                </div>
                {order.userId && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground">User Account</span>
                    <p className="font-mono text-xs">{order.userId}</p>
                  </div>
                )}
              </div>
            </FormSection>

            {/* Delivery Recipient - Only show if different from customer */}
            {(order.isGift || hasDistinctRecipient) && (
              <FormSection
                title="Delivery Recipient"
                description={order.isGift ? "Gift recipient details" : "Order placed on behalf of someone else"}
                variant="muted"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1 md:col-span-2">
                    <Badge variant="secondary" className="text-sm mb-2">
                      {order.isGift ? '🎁 Gift Order' : '👤 Proxy Order'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Recipient Name</span>
                    <p className="font-medium">{recipientName || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Recipient Phone</span>
                    <p className="font-medium">{recipientPhone || '-'}</p>
                  </div>
                </div>
              </FormSection>
            )}

          {/* Coupon Info (Read-only) */}
          {order.couponApplied && (
            <FormSection
              title="Coupon Applied"
              description="Applied at checkout"
              variant="muted"
            >
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className="text-sm font-mono">
                  {order.couponApplied.code}
                </Badge>
                <span>
                  {order.couponApplied.discountType === 'percentage'
                    ? `${order.couponApplied.discountValue}% off (${formatPrice(order.couponApplied.discountAmount)} discount)`
                    : `${formatPrice(order.couponApplied.discountValue)} off (${formatPrice(order.couponApplied.discountAmount)} discount)`
                  }
                </span>
              </div>
            </FormSection>
          )}

          {/* Cancellation Info (Read-only) */}
          {order.cancellationRequest?.requested && (
            <FormSection
              title="Cancellation Request"
              description="Customer requested cancellation"
              variant="destructive"
            >
              <div className="space-y-2 text-sm">
                <p><strong>Reason:</strong> {order.cancellationRequest.reason || 'No reason provided'}</p>
                <p className="text-muted-foreground text-xs">
                  Requested: {order.cancellationRequest.requestedAt 
                    ? new Date(order.cancellationRequest.requestedAt).toLocaleString() 
                    : 'Unknown'}
                </p>
              </div>
            </FormSection>
          )}

          {/* Timestamps */}
          <FormSection
            title="Timestamps"
            variant="muted"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Created</span>
                <p>{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Updated</span>
                <p>{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '-'}</p>
              </div>
            </div>
          </FormSection>
        </div>
        );
      })(),
    },
  ];

  return (
    <>
      <form
        id={formId}
        onSubmit={form.handleSubmit(handleSubmit, handleSubmitError)}
        className="space-y-6"
      >
        <DynamicTabs
          defaultValue="summary"
          tabs={tabs}
          variant="outline"
        />

        <FormErrorSummary errors={formErrors} />

        {!hideActions && (
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Close
            </Button>
          </div>
        )}
      </form>

      {/* Reject Payment Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Rejection Reason</Label>
              <Textarea
                id="reject-reason"
                placeholder="e.g., Invalid transaction ID, insufficient amount, payment not received..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-muted-foreground">
                <strong>Warning:</strong> Rejecting this payment will mark the transaction as failed
                and the order payment status will be updated accordingly.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
              }}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectPayment}
              disabled={isRejecting || !rejectReason.trim()}
            >
              {isRejecting ? "Rejecting..." : "Reject Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
