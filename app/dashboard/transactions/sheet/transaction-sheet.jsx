"use client";
import { FormSheet } from "@/components/custom/ui/sheet-wrapper";
import { TransactionForm } from "./transaction.form";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";

/**
 * Transaction Sheet Component
 *
 * Displays a side sheet for creating/editing transactions
 * - Frontend can create manual operational transactions
 * - Library-managed transactions have restricted editable fields
 */
export function TransactionSheet({
  token,
  open,
  onOpenChange,
  transaction = null,
}) {
  const isEdit = !!transaction;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  const handleSuccess = () => {
    if (!isEdit) onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Transaction" : "Add New Transaction"}
      description={isEdit ? "Update transaction details" : "Create a new manual transaction"}
      size="lg"
      className="px-4"
      formId="transaction-sheet-form"
      submitLabel={isEdit ? "Update Transaction" : "Create Transaction"}
      cancelLabel={isEdit ? "Close" : "Cancel"}
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={handleCancel}
    >
      <TransactionForm
        token={token}
        transaction={transaction}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        onSubmitStateChange={handleSubmitStateChange}
        formId="transaction-sheet-form"
      />
    </FormSheet>
  );
}


