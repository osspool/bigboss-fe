import { formatPrice } from "@/lib/constants";
import { CartItem } from "@/types";

interface OrderSummaryProps {
  items: CartItem[];
  getItemPrice: (item: CartItem) => number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export function OrderSummary({
  items,
  getItemPrice,
  subtotal,
  shippingCost,
  discount,
  total,
}: OrderSummaryProps) {
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
          <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium text-lg pt-3 border-t border-border">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
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

  return (
    <div className="flex gap-4">
      <img
        src={getProductImage()}
        alt={item.product.name}
        className="w-16 h-20 object-cover bg-background"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.product.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.variations?.map((v) => v.option.value).join(" / ") || "No variations"}
        </p>
        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
      </div>
      <p className="text-sm font-medium">{formatPrice(price)}</p>
    </div>
  );
}
