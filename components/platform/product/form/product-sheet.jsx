"use client";
import { FormSheet } from "@classytic/clarity";
import { ProductForm } from "./product.form";
import { useFormSubmitState } from "@/hooks/use-form-submit-state";

/**
 * Product Sheet Component
 *
 * Displays a side sheet for creating/editing products
 * - Allows updating product information and details
 * - System-managed fields (slug, stats, ratings) are read-only
 */
export function ProductSheet({
  token,
  open,
  onOpenChange,
  product = null,
}) {
  const isEdit = !!product;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  const handleSuccess = () => {
    if (!isEdit) onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Product" : "Add New Product"}
      description={isEdit ? "Update product details" : "Create a new product listing"}
      size="lg"
      className="px-4"
      innerClassName="overflow-hidden"
      formId="product-sheet-form"
      submitLabel={isEdit ? "Update Product" : "Create Product"}
      cancelLabel={isEdit ? "Close" : "Cancel"}
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={handleCancel}
    >
      <ProductForm
        token={token}
        product={product}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        onSubmitStateChange={handleSubmitStateChange}
        formId="product-sheet-form"
      />
    </FormSheet>
  );
}
