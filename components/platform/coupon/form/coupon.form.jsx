"use client";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { couponCreateSchema, couponUpdateSchema } from "@/schemas/coupon.schema";
import { FormGenerator } from "@/components/form/form-system";
import { FormErrorSummary } from "@/components/form/form-utils/FormErrorSummary";
import { createCouponFormSchema } from "./coupon-form-schema";
import { useCouponActions } from "@/hooks/query/useCoupons";
import { useNotifySubmitState } from "@/hooks/use-form-submit-state";

export function CouponForm({
  token,
  coupon = null,
  onSuccess,
  onCancel,
  onSubmitStateChange,
  formId = "coupon-sheet-form",
}) {
  const isEdit = !!coupon;

  const defaultValues = useMemo(
    () => ({
      code: coupon?.code || "",
      discountType: coupon?.discountType || "",
      discountAmount: coupon?.discountAmount || 0,
      minOrderAmount: coupon?.minOrderAmount || 0,
      maxDiscountAmount: coupon?.maxDiscountAmount || undefined,
      expiresAt: coupon?.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : "",
      usageLimit: coupon?.usageLimit || 100,
      isActive: coupon?.isActive ?? true,
    }),
    [coupon]
  );

  const form = useForm({
    resolver: zodResolver(isEdit ? couponUpdateSchema : couponCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });

  const { create: createCoupon, update: updateCoupon, isCreating, isUpdating } =
    useCouponActions();
  const isSubmitting = isCreating || isUpdating;
  const formErrors = form.formState.errors;

  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  // Create form schema
  const formSchema = useMemo(
    () => createCouponFormSchema({
      isEdit,
      coupon,
    }),
    [isEdit, coupon]
  );

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        // Clean up empty strings and undefined values
        const cleanData = {
          code: data.code.toUpperCase().trim(),
          discountType: data.discountType,
          discountAmount: Number(data.discountAmount),
          minOrderAmount: Number(data.minOrderAmount || 0),
          expiresAt: new Date(data.expiresAt).toISOString(),
          usageLimit: Number(data.usageLimit || 100),
          isActive: data.isActive ?? true,
        };

        // Only include maxDiscountAmount if provided and discount type is percentage
        if (data.maxDiscountAmount && data.discountType === 'percentage') {
          cleanData.maxDiscountAmount = Number(data.maxDiscountAmount);
        }

        if (isEdit) {
          await updateCoupon({ token, id: coupon._id, data: cleanData });
        } else {
          await createCoupon({ token, data: cleanData });
        }
        onSuccess?.();
      } catch (error) {
        console.error(error);
        // Toast is handled by the mutation factory
      }
    },
    [isEdit, updateCoupon, createCoupon, token, coupon?._id, onSuccess]
  );

  const handleFormError = useCallback(() => {
    toast.error("Please fix the validation errors before submitting");
  }, []);

  return (
    <form id={formId} onSubmit={form.handleSubmit(handleSubmitForm, handleFormError)} className="space-y-6">
      <FormGenerator schema={formSchema} control={form.control} disabled={isSubmitting} />
      <FormErrorSummary errors={formErrors} />
    </form>
  );
}
