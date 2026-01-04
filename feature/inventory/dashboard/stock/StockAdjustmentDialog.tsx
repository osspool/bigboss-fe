"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { DialogWrapper } from "@classytic/clarity";
import { Button } from "@/components/ui/button";
import { FormInput, SelectInput, FormTextarea } from "@classytic/clarity";
import { Package, Edit2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/constants";
import { formatVariantAttributes } from "@/lib/commerce-utils";
import type { StockAdjustmentCapability } from "@/lib/access-control";
import type { AdjustStockPayload } from "@/types";
import type { PosProduct } from "@/types";

const REASON_OPTIONS = [
  { value: "damaged", label: "Damaged" },
  { value: "lost", label: "Lost" },
  { value: "recount", label: "Recount" },
  { value: "correction", label: "Correction" },
];

/**
 * Stock Adjustment Dialog (Simplified)
 *
 * Allows setting stock levels for products.
 * Supports variant products with SKU-based variant selection.
 */
export function StockAdjustmentDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  isSubmitting = false,
  capability = { mode: "set_any" },
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PosProduct | null;
  onSubmit: (payload: Pick<AdjustStockPayload, "mode" | "quantity" | "variantSku" | "reason"> & { notes?: string }) => void;
  isSubmitting?: boolean;
  capability?: StockAdjustmentCapability;
}) {
  const [quantity, setQuantity] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  // Reset form when product changes
  useEffect(() => {
    setQuantity("");
    setSelectedVariant("");
    setReason("");
    setNotes("");
  }, [product]);

  const hasVariants = !!product?.variants && product.variants.length > 0;
  const productType = hasVariants ? "variant" : "simple";

  // Build variant options from new variant system
  const variantOptions = useMemo(() => {
    if (!hasVariants || !product?.variants) return [];

    return product.variants
      .filter((v) => v.isActive)
      .map((variant) => {
        const label = variant.attributes
          ? formatVariantAttributes(variant.attributes)
          : variant.sku;

        // Get stock for this variant from branchStock
        const variantStock = product.branchStock?.variants?.find(
          (vs) => vs.sku === variant.sku
        );

        const stockInfo = variantStock?.quantity || 0;
        const priceInfo = variant.priceModifier && variant.priceModifier !== 0
          ? ` • ${variant.priceModifier > 0 ? '+' : ''}${formatPrice(variant.priceModifier)}`
          : '';

        return {
          value: variant.sku,
          label: `${label} (Stock: ${stockInfo}${priceInfo})`,
        };
      });
  }, [product, hasVariants]);

  const currentStock = useMemo(() => {
    if (!product) return 0;

    // If specific variant selected, show variant stock
    if (selectedVariant && hasVariants) {
      const variantStock = product.branchStock?.variants?.find(
        (v) => v.sku === selectedVariant
      );
      return variantStock?.quantity || 0;
    }

    // Otherwise show total product stock
    return product.branchStock?.quantity ?? product.quantity ?? 0;
  }, [product, selectedVariant, hasVariants]);

  const newStock = useMemo(() => {
    return parseInt(quantity, 10) || 0;
  }, [quantity]);

  const handleSubmit = useCallback(() => {
    if (!quantity || !product) return;

    // For variant products, require variant selection
    if (productType === "variant" && !selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) return;

    const maxAllowed =
      capability?.mode === "set_decrease_only" ? currentStock : undefined;

    if (typeof maxAllowed === "number" && qty > maxAllowed) {
      toast.error(
        `You can only decrease stock here. Max allowed is ${maxAllowed}. Use transfers to increase stock.`
      );
      return;
    }

    onSubmit?.({
      mode: "set", // Always use "set" mode
      quantity: qty,
      variantSku: selectedVariant || undefined,
      reason: reason || undefined,
      notes: notes || undefined,
    });
  }, [quantity, selectedVariant, reason, notes, product, productType, onSubmit, capability, currentStock]);

  if (!product) return null;

  const footerContent = (
    <>
      <Button
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={!quantity || isSubmitting || (productType === "variant" && !selectedVariant)}
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Check className="w-4 h-4 mr-2" />
        )}
        Update Stock
      </Button>
    </>
  );

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="flex items-center gap-2">
          <Edit2 className="w-4 h-4" />
          Set Stock Level
        </span>
      }
      description={undefined}
      trigger={undefined}
      className={undefined}
      headerClassName={undefined}
      contentClassName={undefined}
      footerClassName={undefined}
      size="sm"
      footer={footerContent}
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Product Info */}
        <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-muted/50 border border-border/50">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-muted overflow-hidden ring-1 ring-border/20 shrink-0">
            {product.images?.[0]?.variants?.thumbnail ||
            product.images?.[0]?.url ? (
              <img
                src={
                  product.images[0]?.variants?.thumbnail ||
                  product.images[0]?.url
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-sm sm:text-base">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              SKU: {product.sku || "N/A"}
            </p>
            <p className="text-sm">
              Current stock:{" "}
              <span className="font-bold">{currentStock}</span> units
            </p>
          </div>
        </div>

        {/* Variant Selector (if applicable) */}
        {productType === "variant" && variantOptions.length > 0 && (
          <SelectInput
            name="variant"
            label="Variant"
            placeholder="Select variant"
            items={variantOptions}
            value={selectedVariant}
            onValueChange={setSelectedVariant}
            helperText={!selectedVariant ? "Please select a variant to adjust stock" : undefined}
          />
        )}

        {/* Quantity Input */}
        <FormInput
          name="quantity"
          label="New stock level"
          type="number"
          min={0}
          max={capability?.mode === "set_decrease_only" ? currentStock : undefined}
          placeholder="Enter quantity"
          value={quantity}
          onChange={(val) => setQuantity(String(val))}
          inputClassName="text-base sm:text-lg h-10 sm:h-12"
          autoFocus
          helperText={
            capability?.mode === "set_decrease_only"
              ? capability.reason || `Sub-branches can only decrease stock. Max: ${currentStock}`
              : undefined
          }
        />

        {/* Preview */}
        {quantity && (
          <div className="p-3 sm:p-4 rounded-xl text-sm border bg-primary/10 border-primary/20 text-primary">
            <span className="font-medium">New stock level: </span>
            <span className="font-bold text-base sm:text-lg">{newStock}</span>
            <span className="ml-1">units</span>
            {currentStock !== newStock && (
              <span className="ml-2 text-xs opacity-75">
                ({newStock > currentStock ? '+' : ''}{newStock - currentStock})
              </span>
            )}
          </div>
        )}

        {/* Reason */}
        <SelectInput
          name="reason"
          label="Reason"
          placeholder="Select reason (optional)"
          items={REASON_OPTIONS}
          value={reason}
          onValueChange={setReason}
        />

        {/* Notes */}
        <FormTextarea
          name="notes"
          label="Notes (optional)"
          placeholder="Additional details (optional)"
          value={notes}
          onChange={setNotes}
          rows={2}
          textareaClassName="resize-none"
        />
      </div>
    </DialogWrapper>
  );
}
