"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Edit2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/constants";
import { formatVariantAttributes } from "@/lib/commerce-utils";
import type { StockAdjustmentCapability } from "@/lib/access-control";
import type { AdjustStockPayload } from "@/types/inventory.types";
import type { PosProduct } from "@/types/pos.types";

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
  const [notes, setNotes] = useState("");

  // Reset form when product changes
  useEffect(() => {
    setQuantity("");
    setSelectedVariant("");
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

        return {
          sku: variant.sku,
          label,
          priceModifier: variant.priceModifier || 0,
          currentStock: variantStock?.quantity || 0,
          attributes: variant.attributes,
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
      notes: notes || undefined,
    });
  }, [quantity, selectedVariant, notes, product, productType, onSubmit, capability, currentStock]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            Set Stock Level
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden ring-1 ring-border/20 shrink-0">
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
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{product.name}</p>
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
            <div className="space-y-2">
              <Label>Variant</Label>
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {variantOptions.map((opt) => (
                    <SelectItem key={opt.sku} value={opt.sku}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span>{opt.label}</span>
                        <span className="text-xs text-muted-foreground">
                          Stock: {opt.currentStock}
                          {opt.priceModifier !== 0 && ` • ${opt.priceModifier > 0 ? '+' : ''}${formatPrice(opt.priceModifier)}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedVariant && (
                <p className="text-xs text-muted-foreground">
                  ⚠️ Please select a variant to adjust stock
                </p>
              )}
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">New stock level</Label>
            {capability?.mode === "set_decrease_only" && (
              <p className="text-xs text-muted-foreground">
                {capability.reason ||
                  "Sub-branches can only decrease stock via adjustments (use transfers to increase)."}
              </p>
            )}
            <Input
              id="quantity"
              type="number"
              min="0"
              max={capability?.mode === "set_decrease_only" ? String(currentStock) : undefined}
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="text-lg h-12"
              autoFocus
            />
            {capability?.mode === "set_decrease_only" && (
              <p className="text-xs text-muted-foreground">
                Max allowed (current stock):{" "}
                <span className="font-medium">{currentStock}</span>
              </p>
            )}
          </div>

          {/* Preview */}
          {quantity && (
            <div className="p-4 rounded-xl text-sm border bg-primary/10 border-primary/20 text-primary">
              <span className="font-medium">New stock level: </span>
              <span className="font-bold text-lg">{newStock}</span>
              <span className="ml-1">units</span>
              {currentStock !== newStock && (
                <span className="ml-2 text-xs opacity-75">
                  ({newStock > currentStock ? '+' : ''}{newStock - currentStock})
                </span>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Reason for adjustment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
