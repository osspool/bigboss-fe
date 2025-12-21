"use client";
import { FormSheet } from "@/components/custom/ui/sheet-wrapper";
import { CustomerForm } from "./form/customer.form";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";

/**
 * Customer Sheet Component
 *
 * Displays a side sheet for creating/editing customer profiles
 * - Allows updating customer contact information and details
 * - System-managed fields (userId, stats) are read-only
 */
export function CustomerSheet({
  token,
  open,
  onOpenChange,
  customer = null,
}) {
  const isEdit = !!customer;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  const handleSuccess = () => {
    if (!isEdit) onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Customer" : "Add New Customer"}
      description={isEdit ? "Update customer details" : "Create a new customer profile"}
      size="lg"
      className="px-4"
      formId="customer-sheet-form"
      submitLabel={isEdit ? "Update Customer" : "Create Customer"}
      cancelLabel={isEdit ? "Close" : "Cancel"}
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={handleCancel}
    >
      <CustomerForm
        token={token}
        customer={customer}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        onSubmitStateChange={handleSubmitStateChange}
        formId="customer-sheet-form"
      />
    </FormSheet>
  );
}


