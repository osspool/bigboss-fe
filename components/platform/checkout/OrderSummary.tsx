import { formatPrice } from "@/lib/constants";
import { CartItem } from "@/types";
import type { PlatformVatConfig } from "@/types/common.types";
import { Skeleton } from "@/components/ui/skeleton";
import { getCartItemVariant, formatVariantAttributes } from "@/lib/commerce-utils";

interface OrderSummaryProps {
  items: CartItem[];
  getItemPrice: (item: CartItem) => number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  isShippingLoading?: boolean;
  vatConfig?: PlatformVatConfig | null;
}

export function OrderSummary({
  items,
  getItemPrice,
  subtotal,
  shippingCost,
  discount,
  total,
  isShippingLoading,
  vatConfig,
}: OrderSummaryProps) {
  // Calculate VAT if applicable
  const vatAmount = vatConfig?.isRegistered && vatConfig?.defaultRate
    ? vatConfig.pricesIncludeVat
      ? (subtotal - discount) * vatConfig.defaultRate / (100 + vatConfig.defaultRate) // Extract VAT from inclusive prices
      : (subtotal - discount) * vatConfig.defaultRate / 100 // Add VAT to exclusive prices
    : 0;

  // Adjust total if VAT is exclusive (needs to be added)
  const displayTotal = vatConfig?.isRegistered && !vatConfig?.pricesIncludeVat
    ? total + vatAmount
    : total;

  return (
    <div className="bg-muted p-6 ">
      <h2 className="font-display text-xl mb-6">Order Summary</h2>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <OrderItem key={index} item={item} price={getItemPrice(item)} />
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          {isShippingLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
          )}
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        {vatConfig?.isRegistered && vatAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              VAT ({vatConfig.defaultRate}%{vatConfig.pricesIncludeVat ? " incl." : ""})
            </span>
            <span>{formatPrice(Math.round(vatAmount))}</span>
          </div>
        )}
        <div className="flex justify-between font-medium text-lg pt-3 border-t border-border">
          <span>Total</span>
          <span>{formatPrice(displayTotal)}</span>
        </div>
        {vatConfig?.isRegistered && vatConfig?.bin && (
          <p className="text-xs text-muted-foreground pt-1">
            VAT/BIN: {vatConfig.bin}
          </p>
        )}
      </div>
    </div>
  );
}

function OrderItem({ item, price }: { item: CartItem; price: number }) {
  // Get product image - prefer thumbnail, fallback to url
  const getProductImage = () => {
    const firstImage = item.product.images?.[0];
    if (!firstImage) return '/placeholder.png';
    return firstImage.variants?.thumbnail || firstImage.url;
  };

  // Get variant info using new variant system
  const variant = getCartItemVariant(item);
  const variantLabel = variant?.attributes
    ? formatVariantAttributes(variant.attributes)
    : null;

  return (
    <div className="flex gap-4">
      <img
        src={getProductImage()}
        alt={item.product.name}
        className="w-16 h-20 object-cover bg-background"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.product.name}</p>
        {variantLabel && (
          <p className="text-xs text-muted-foreground">{variantLabel}</p>
        )}
        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
      </div>
      <p className="text-sm font-medium">{formatPrice(price)}</p>
    </div>
  );
}
