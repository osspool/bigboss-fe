"use client";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { TransactionForm } from "./transaction.form";
import { Button } from "@/components/ui/button";

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

  const handleSuccess = () => {
    if (!isEdit) onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Transaction" : "Add New Transaction"}
      description={isEdit ? "Update transaction details" : "Create a new manual transaction"}
      size="lg"
      className="px-4"
      footer={(
        <div className="flex gap-2 w-full">
          <Button variant="outline" type="button" className="flex-1" onClick={handleCancel}>
            {isEdit ? "Close" : "Cancel"}
          </Button>
          <Button type="submit" form="transaction-sheet-form" className="flex-1">
            {isEdit ? "Update Transaction" : "Create Transaction"}
          </Button>
        </div>
      )}
    >
      <TransactionForm
        token={token}
        transaction={transaction}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        formId="transaction-sheet-form"
      />
    </SheetWrapper>
  );
}


