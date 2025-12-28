"use client";
import { FormSheet } from "@/components/custom/ui/sheet-wrapper";
import { SizeGuideForm } from "./form/size-guide.form";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";

/**
 * Size Guide Sheet Component
 *
 * Displays a side sheet for creating/editing size guides
 * - Allows managing measurement labels
 * - Supports size definitions with dynamic measurements
 * - System-managed fields (slug) are read-only
 */
export function SizeGuideSheet({
  token,
  open,
  onOpenChange,
  sizeGuide = null,
}) {
  const isEdit = !!sizeGuide;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  const handleSuccess = () => {
    if (!isEdit) onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Size Guide" : "Add New Size Guide"}
      description={isEdit ? "Update size guide details" : "Create a new size guide"}
      size="lg"
      className="px-4"
      formId="size-guide-sheet-form"
      submitLabel={isEdit ? "Update Size Guide" : "Create Size Guide"}
      cancelLabel={isEdit ? "Close" : "Cancel"}
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={handleCancel}
    >
      <SizeGuideForm
        token={token}
        sizeGuide={sizeGuide}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        onSubmitStateChange={handleSubmitStateChange}
        formId="size-guide-sheet-form"
      />
    </FormSheet>
  );
}
