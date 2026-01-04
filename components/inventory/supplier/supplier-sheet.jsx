"use client";
import { FormSheet } from "@classytic/clarity";
import { SupplierForm } from "./form/supplier.form";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";

/**
 * Supplier Sheet Component
 *
 * Displays a side sheet for creating/editing supplier profiles
 * - Allows updating supplier contact information and payment terms
 * - System-managed fields (code, timestamps) are read-only
 */
export function SupplierSheet({
  token,
  open,
  onOpenChange,
  supplier = null,
}) {
  const isEdit = !!supplier;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  const handleSuccess = () => {
    if (!isEdit) onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Supplier" : "Add New Supplier"}
      description={isEdit ? "Update supplier details" : "Create a new supplier/vendor"}
      size="lg"
      className="px-4"
      formId="supplier-sheet-form"
      submitLabel={isEdit ? "Update Supplier" : "Create Supplier"}
      cancelLabel={isEdit ? "Close" : "Cancel"}
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={handleCancel}
    >
      <SupplierForm
        token={token}
        supplier={supplier}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        onSubmitStateChange={handleSubmitStateChange}
        formId="supplier-sheet-form"
      />
    </FormSheet>
  );
}
