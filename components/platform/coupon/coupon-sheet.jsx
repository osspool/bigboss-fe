"use client";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { CouponForm } from "./form/coupon.form";
import { Button } from "@/components/ui/button";

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

  const handleSuccess = () => {
    if (!isEdit) onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Coupon" : "Add New Coupon"}
      description={isEdit ? "Update coupon details and settings" : "Create a new discount coupon"}
      size="lg"
      className="px-4"
      footer={(
        <div className="flex gap-2 w-full">
          <Button variant="outline" type="button" className="flex-1" onClick={handleCancel}>
            {isEdit ? "Close" : "Cancel"}
          </Button>
          <Button type="submit" form="coupon-sheet-form" className="flex-1">
            {isEdit ? "Update Coupon" : "Create Coupon"}
          </Button>
        </div>
      )}
    >
      <CouponForm
        token={token}
        coupon={coupon}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        formId="coupon-sheet-form"
      />
    </SheetWrapper>
  );
}
