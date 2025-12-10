"use client";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { ProductForm } from "./product.form";
import { Button } from "@/components/ui/button";

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

  const handleSuccess = () => {
    if (!isEdit) onOpenChange(false);
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Product" : "Add New Product"}
      description={isEdit ? "Update product details" : "Create a new product listing"}
      size="lg"
      className="px-4"
      footer={(
        <div className="flex gap-2 w-full">
          <Button variant="outline" type="button" className="flex-1" onClick={handleCancel}>
            {isEdit ? "Close" : "Cancel"}
          </Button>
          <Button type="submit" form="product-sheet-form" className="flex-1">
            {isEdit ? "Update Product" : "Create Product"}
          </Button>
        </div>
      )}
    >
      <ProductForm
        token={token}
        product={product}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        formId="product-sheet-form"
      />
    </SheetWrapper>
  );
}
