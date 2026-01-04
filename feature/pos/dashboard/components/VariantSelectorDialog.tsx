"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/constants";
import {
  calculateVariantPrice,
  formatVariantLabel,
  getVariantStock,
  isInStock,
  getPosProductImage,
} from "@/hooks/query";
import type { PosProduct } from "@/types";
import { Check, Package } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface VariantSelectorDialogProps {
  product: PosProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (variantSku: string) => void;
}

interface VariantOption {
  sku: string;
  attributes: Record<string, string>;
  label: string;
  price: number;
  priceModifier: number;
  stock: number;
  inStock: boolean;
  isActive: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function VariantSelectorDialog({
  product,
  open,
  onOpenChange,
  onSelect,
}: VariantSelectorDialogProps) {
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  // Build variant options
  const variantOptions = useMemo(() => {
    if (!product?.variants) return [];

    return product.variants
      .filter(v => v.isActive)
      .map(variant => {
        const stock = getVariantStock(product, variant.sku);
        const inStock = stock > 0;

        return {
          sku: variant.sku,
          attributes: variant.attributes,
          label: formatVariantLabel(variant.attributes),
          price: calculateVariantPrice(product.basePrice, variant.priceModifier),
          priceModifier: variant.priceModifier || 0,
          stock,
          inStock,
          isActive: variant.isActive,
        } as VariantOption;
      });
  }, [product]);

  // Group variants by attribute (for smart display)
  const attributeKeys = useMemo(() => {
    if (!product?.variants?.[0]?.attributes) return [];
    return Object.keys(product.variants[0].attributes);
  }, [product]);

  const handleConfirm = () => {
    if (selectedSku) {
      onSelect(selectedSku);
      onOpenChange(false);
      setSelectedSku(null);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedSku(null);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Variant</DialogTitle>
          <DialogDescription>
            Choose a variant for {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 border rounded-lg mb-4 bg-muted/30">
            <div className="w-20 h-20 rounded bg-muted overflow-hidden shrink-0">
              <img
                src={getPosProductImage(product)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                Base Price: {formatPrice(product.basePrice)}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {attributeKeys.map(key => (
                  <Badge key={key} variant="outline" className="text-xs capitalize">
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Variant Options */}
          <div className="space-y-2">
            {variantOptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No variants available
                </p>
              </div>
            ) : (
              variantOptions.map(variant => (
                <button
                  key={variant.sku}
                  onClick={() => variant.inStock && setSelectedSku(variant.sku)}
                  disabled={!variant.inStock}
                  className={cn(
                    "w-full flex items-center justify-between p-4 border rounded-lg transition-all",
                    "hover:shadow-md",
                    selectedSku === variant.sku && "border-primary bg-primary/5 ring-2 ring-primary",
                    !variant.inStock && "opacity-50 cursor-not-allowed hover:shadow-none"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Selection indicator */}
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        selectedSku === variant.sku
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {selectedSku === variant.sku && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>

                    {/* Variant info */}
                    <div className="text-left">
                      <p className="font-medium">{variant.label}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        SKU: {variant.sku}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stock badge */}
                    <Badge
                      variant={variant.inStock ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {variant.inStock ? `Stock: ${variant.stock}` : "Out of Stock"}
                    </Badge>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(variant.price)}</p>
                      {variant.priceModifier !== 0 && (
                        <p className="text-xs text-muted-foreground">
                          {variant.priceModifier > 0 ? "+" : ""}
                          {formatPrice(variant.priceModifier)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSku}
          >
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
