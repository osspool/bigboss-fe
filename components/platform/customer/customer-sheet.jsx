"use client";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { CustomerForm } from "./form/customer.form";
import { Button } from "@/components/ui/button";

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

  const handleSuccess = () => {
    if (!isEdit) onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Customer" : "Add New Customer"}
      description={isEdit ? "Update customer details" : "Create a new customer profile"}
      size="lg"
      className="px-4"
      footer={(
        <div className="flex gap-2 w-full">
          <Button variant="outline" type="button" className="flex-1" onClick={handleCancel}>
            {isEdit ? "Close" : "Cancel"}
          </Button>
          <Button type="submit" form="customer-sheet-form" className="flex-1">
            {isEdit ? "Update Customer" : "Create Customer"}
          </Button>
        </div>
      )}
    >
      <CustomerForm
        token={token}
        customer={customer}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        formId="customer-sheet-form"
      />
    </SheetWrapper>
  );
}


