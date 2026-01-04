"use client";
import { FormSheet } from "@classytic/clarity";
import { CouponForm } from "./form/coupon.form";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";

/**
 * Coupon Sheet Component
 *
 * Displays a side sheet for creating/editing coupons
 * - Allows updating coupon details, discount rules, and validity settings
 * - System-managed fields (usedCount, timestamps) are read-only
 */
export function CouponSheet({
  token,
  open,
  onOpenChange,
  coupon = null,
}) {
  const isEdit = !!coupon;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  const handleSuccess = () => {
    if (!isEdit) onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Coupon" : "Add New Coupon"}
      description={isEdit ? "Update coupon details and settings" : "Create a new discount coupon"}
      size="lg"
      className="px-4"
      formId="coupon-sheet-form"
      submitLabel={isEdit ? "Update Coupon" : "Create Coupon"}
      cancelLabel={isEdit ? "Close" : "Cancel"}
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={handleCancel}
    >
      <CouponForm
        token={token}
        coupon={coupon}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        onSubmitStateChange={handleSubmitStateChange}
        formId="coupon-sheet-form"
      />
    </FormSheet>
  );
}
