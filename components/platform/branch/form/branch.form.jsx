"use client";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { branchCreateSchema, branchUpdateSchema } from "@/schemas/branch.schema";
import { FormGenerator } from "@/components/form/form-system";
import { FormErrorSummary } from "@/components/form/form-utils/FormErrorSummary";
import { createBranchFormSchema } from "./branch-form-schema";
import { useBranchActions } from "@/hooks/query/useBranches";
import { useNotifySubmitState } from "@/hooks/use-form-submit-state";

export function BranchForm({
  token,
  branch = null,
  onSuccess,
  onCancel,
  onSubmitStateChange,
  formId = "branch-sheet-form",
}) {
  const isEdit = !!branch;

  const defaultValues = useMemo(
    () => ({
      code: branch?.code || "",
      name: branch?.name || "",
      type: branch?.type || "store",
      phone: branch?.phone || "",
      email: branch?.email || "",
      operatingHours: branch?.operatingHours || "",
      isDefault: branch?.isDefault || false,
      isActive: branch?.isActive ?? true,
      address: {
        line1: branch?.address?.line1 || "",
        line2: branch?.address?.line2 || "",
        city: branch?.address?.city || "",
        state: branch?.address?.state || "",
        postalCode: branch?.address?.postalCode || "",
        country: branch?.address?.country || "Bangladesh",
      },
    }),
    [branch]
  );

  const form = useForm({
    resolver: zodResolver(isEdit ? branchUpdateSchema : branchCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });

  // Reset form when branch data changes (after query invalidation)
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const { create: createBranch, update: updateBranch, isCreating, isUpdating } =
    useBranchActions();
  const isSubmitting = isCreating || isUpdating;
  const formErrors = form.formState.errors;

  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  // Create form schema
  const formSchema = useMemo(
    () => createBranchFormSchema({
      isEdit,
      branch,
    }),
    [isEdit, branch]
  );

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        // Clean up empty strings and undefined values
        const cleanData = {
          code: data.code.toUpperCase(),
          name: data.name,
          type: data.type || "store",
          ...(data.phone && { phone: data.phone }),
          ...(data.email && { email: data.email }),
          ...(data.operatingHours && { operatingHours: data.operatingHours }),
          isDefault: data.isDefault || false,
        };

        // Only include isActive for updates
        if (isEdit) {
          cleanData.isActive = data.isActive ?? true;
        }

        // Clean up address - only include if any field has value
        if (data.address) {
          const hasAddressData = Object.values(data.address).some(v => v && v.trim());
          if (hasAddressData) {
            cleanData.address = {};
            if (data.address.line1) cleanData.address.line1 = data.address.line1;
            if (data.address.line2) cleanData.address.line2 = data.address.line2;
            if (data.address.city) cleanData.address.city = data.address.city;
            if (data.address.state) cleanData.address.state = data.address.state;
            if (data.address.postalCode) cleanData.address.postalCode = data.address.postalCode;
            if (data.address.country) cleanData.address.country = data.address.country;
          }
        }

        if (isEdit) {
          await updateBranch({ token, id: branch._id, data: cleanData });
        } else {
          await createBranch({ token, data: cleanData });
        }
        onSuccess?.();
      } catch (error) {
        console.error(error);
        // Toast is handled by the mutation factory
      }
    },
    [isEdit, updateBranch, createBranch, token, branch?._id, onSuccess]
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
