"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/constants";
import {
  getAvailableVariants,
  getPosProductImage,
  isVariantProduct,
  calculateVariantPrice,
} from "@/hooks/query/usePos";
import type { PosProduct } from "@/types/pos.types";

interface ProductCardProps {
  product: PosProduct;
  onAddToCart: (product: PosProduct, variantSku?: string) => void;
  onOpenVariantSelector: (product: PosProduct) => void;
}

export function ProductCard({
  product,
  onAddToCart,
  onOpenVariantSelector,
}: ProductCardProps) {
  const hasVariants = isVariantProduct(product);
  const inStock = product.branchStock?.inStock ?? false;
  const lowStock = product.branchStock?.lowStock ?? false;
  const stockQty = product.branchStock?.quantity ?? 0;

  // Calculate price display for variant products
  const getPriceDisplay = () => {
    if (!hasVariants) {
      return { price: product.basePrice, showFrom: false };
    }

    const variants = getAvailableVariants(product);
    if (variants.length === 0) {
      return { price: product.basePrice, showFrom: false };
    }

    // Calculate all variant prices
    const prices = variants.map((v) =>
      calculateVariantPrice(product.basePrice, v.priceModifier || 0)
    );
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Show "From" if there's a price range
    return {
      price: minPrice,
      showFrom: minPrice !== maxPrice,
    };
  };

  const { price: displayPrice, showFrom } = getPriceDisplay();

  const handleClick = () => {
    if (!inStock) return;

    if (hasVariants) {
      const variants = getAvailableVariants(product);
      if (variants.length === 1) {
        onAddToCart(product, variants[0].sku);
      } else {
        onOpenVariantSelector(product);
      }
    } else {
      onAddToCart(product);
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] group relative overflow-hidden",
        !inStock && "opacity-50 cursor-not-allowed hover:scale-100"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
          {!inStock ? (
            <Badge variant="destructive" className="text-xs shadow-md">
              Out of Stock
            </Badge>
          ) : lowStock ? (
            <Badge variant="secondary" className="text-xs shadow-md">
              Low Stock
            </Badge>
          ) : null}
          {hasVariants && (
            <Badge
              variant="outline"
              className="text-xs bg-background/90 backdrop-blur-sm shadow-md"
            >
              {getAvailableVariants(product).length} variants
            </Badge>
          )}
        </div>

        <div className="aspect-square bg-muted overflow-hidden relative">
          <img
            src={getPosProductImage(product)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="p-3 space-y-1.5">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-10">
            {product.name}
          </h3>

          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-bold text-primary">
              {showFrom && <span className="text-xs font-normal text-muted-foreground mr-1">From</span>}
              {formatPrice(displayPrice)}
            </span>
            {inStock && (
              <span className="text-xs text-muted-foreground">Qty: {stockQty}</span>
            )}
          </div>
        </div>

        {inStock && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
        )}
      </CardContent>
    </Card>
  );
}
