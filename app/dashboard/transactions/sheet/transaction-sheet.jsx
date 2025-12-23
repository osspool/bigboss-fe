"use client";
import { FormSheet } from "@/components/custom/ui/sheet-wrapper";
import { TransactionForm } from "./transaction.form";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";

/**
 * Transaction Sheet Component
 *
 * Displays a side sheet for reviewing transactions
 * - Transactions are system-managed (notes only)
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
    onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Transaction Notes"
      description={isEdit ? "Update transaction notes" : "Select a transaction to view details"}
      size="lg"
      className="px-4"
      formId="transaction-sheet-form"
      submitLabel="Save Notes"
      cancelLabel="Close"
      submitDisabled={isSubmitting || !isEdit}
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


