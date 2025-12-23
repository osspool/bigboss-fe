"use client";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supplierCreateSchema, supplierUpdateSchema } from "@/schemas/supplier.schema";
import { FormGenerator } from "@/components/form/form-system";
import { FormErrorSummary } from "@/components/form/form-utils/FormErrorSummary";
import { createSupplierFormSchema } from "./supplier-form-schema";
import { useSupplierActions } from "@/hooks/query/useSuppliers";
import { useNotifySubmitState } from "@/hooks/use-form-submit-state";

export function SupplierForm({
  token,
  supplier = null,
  onSuccess,
  onCancel,
  onSubmitStateChange,
  formId = "supplier-sheet-form",
}) {
  const isEdit = !!supplier;

  const defaultValues = useMemo(
    () => ({
      name: supplier?.name || "",
      type: supplier?.type || "",
      contactPerson: supplier?.contactPerson || "",
      phone: supplier?.phone || "",
      email: supplier?.email || "",
      address: supplier?.address || "",
      taxId: supplier?.taxId || "",
      paymentTerms: supplier?.paymentTerms || "",
      creditDays: supplier?.creditDays || "",
      creditLimit: supplier?.creditLimit || "",
      openingBalance: supplier?.openingBalance || "",
      notes: supplier?.notes || "",
      isActive: supplier?.isActive ?? true,
    }),
    [supplier]
  );

  const form = useForm({
    resolver: zodResolver(isEdit ? supplierUpdateSchema : supplierCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });

  const { create: createSupplier, update: updateSupplier, isCreating, isUpdating } =
    useSupplierActions();
  const isSubmitting = isCreating || isUpdating;
  const formErrors = form.formState.errors;

  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  // Create form schema
  const formSchema = useMemo(
    () => createSupplierFormSchema({
      isEdit,
      supplier,
    }),
    [isEdit, supplier]
  );

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        // Clean up empty strings and undefined values
        const cleanData = {
          name: data.name,
          ...(data.type && { type: data.type }),
          ...(data.contactPerson && { contactPerson: data.contactPerson }),
          ...(data.phone && { phone: data.phone }),
          ...(data.email && { email: data.email }),
          ...(data.address && { address: data.address }),
          ...(data.taxId && { taxId: data.taxId }),
          ...(data.paymentTerms && { paymentTerms: data.paymentTerms }),
          ...(data.creditDays !== "" && data.creditDays !== undefined && { creditDays: Number(data.creditDays) }),
          ...(data.creditLimit !== "" && data.creditLimit !== undefined && { creditLimit: Number(data.creditLimit) }),
          ...(data.openingBalance !== "" && data.openingBalance !== undefined && { openingBalance: Number(data.openingBalance) }),
          ...(data.notes && { notes: data.notes }),
          isActive: data.isActive,
        };

        if (isEdit) {
          await updateSupplier({ token, id: supplier._id, data: cleanData });
        } else {
          await createSupplier({ token, data: cleanData });
        }
        onSuccess?.();
      } catch (error) {
        console.error(error);
        // Toast is handled by the mutation factory
      }
    },
    [isEdit, updateSupplier, createSupplier, token, supplier?._id, onSuccess]
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
