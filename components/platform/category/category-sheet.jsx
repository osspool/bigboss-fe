"use client";
import { FormSheet } from "@classytic/clarity";
import { CategoryForm } from "./form/category.form";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";

/**
 * Category Sheet Component
 *
 * Displays a side sheet for creating/editing categories
 * - Allows managing category hierarchy (parent/child relationships)
 * - Supports image and SEO settings
 * - System-managed fields (slug, productCount) are read-only
 */
export function CategorySheet({
  token,
  open,
  onOpenChange,
  category = null,
}) {
  const isEdit = !!category;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  const handleSuccess = () => {
    if (!isEdit) onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Category" : "Add New Category"}
      description={isEdit ? "Update category details" : "Create a new category"}
      size="lg"
      className="px-4"
      formId="category-sheet-form"
      submitLabel={isEdit ? "Update Category" : "Create Category"}
      cancelLabel={isEdit ? "Close" : "Cancel"}
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={handleCancel}
    >
      <CategoryForm
        token={token}
        category={category}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        onSubmitStateChange={handleSubmitStateChange}
        formId="category-sheet-form"
      />
    </FormSheet>
  );
}
