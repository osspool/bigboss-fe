"use client";
import { FormSheet } from "@classytic/clarity";
import { BranchForm } from "./form/branch.form";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";

/**
 * Branch Sheet Component
 *
 * Displays a side sheet for creating/editing branches
 */
export function BranchSheet({
  token,
  open,
  onOpenChange,
  branch = null,
}) {
  const isEdit = !!branch;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  const handleSuccess = () => {
    if (!isEdit) onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Branch" : "Add New Branch"}
      description={isEdit ? "Update branch details" : "Create a new branch location"}
      size="lg"
      className="px-4"
      formId="branch-sheet-form"
      submitLabel={isEdit ? "Update Branch" : "Create Branch"}
      cancelLabel={isEdit ? "Close" : "Cancel"}
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={handleCancel}
    >
      <BranchForm
        token={token}
        branch={branch}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        onSubmitStateChange={handleSubmitStateChange}
        formId="branch-sheet-form"
      />
    </FormSheet>
  );
}
