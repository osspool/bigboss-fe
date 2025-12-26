"use client";

import { FormSheet } from "@/components/custom/ui/sheet-wrapper";
import { OrderForm } from "./order.form";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";

/**
 * Order Sheet Component
 *
 * Uses FormSheet wrapper for consistent sheet behavior with footer actions.
 * Order data comes directly from the list API - no separate detail API call needed.
 * 
 * Features:
 * - Proper tabs layout (Summary, Payment, Delivery, Shipping, Timeline, Info)
 * - Payment verification with verify/reject actions
 * - Quick status actions (confirm, ship, deliver, cancel)
 * - Cancellation request handling
 * - No duplicate scroll (handled by SheetWrapper)
 */
export function OrderSheet({
  token,
  open,
  onOpenChange,
  order = null,
}) {
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  const handleSuccess = () => {
    // Sheet stays open to show updated data after mutations
    // Query cache invalidation handled by hooks
  };

  const handleCancel = () => onOpenChange(false);

  if (!order) {
    return null;
  }

  const orderId = order._id || '';
  const shortId = orderId ? orderId.slice(-8).toUpperCase() : 'N/A';
  const createdDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : 'Unknown';

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Order #${shortId}`}
      description={`Placed on ${createdDate}`}
      size="lg"
      innerClassName="overflow-hidden"
      formId="order-sheet-form"
      submitLabel="Save Changes"
      cancelLabel="Close"
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={handleCancel}
    >
      <OrderForm
        token={token}
        order={order}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        onSubmitStateChange={handleSubmitStateChange}
        formId="order-sheet-form"
        hideActions
      />
    </FormSheet>
  );
}
