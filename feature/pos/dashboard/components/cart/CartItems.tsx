"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/constants";
import type { PosCartItem } from "@/types";

interface CartItemsProps {
  items: PosCartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onClear: () => void;
}

export function CartItems({ items, onUpdateQuantity, onRemoveItem, onClear }: CartItemsProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart ({items.length})
          </h2>
          {items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear} className="h-8 text-xs">
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">Cart is empty</p>
          </div>
        ) : (
          items.map((item, index) => (
            <CartItemRow
              key={`${item.productId}-${item.variantSku || "simple"}`}
              item={item}
              onQuantityChange={(delta) => onUpdateQuantity(index, delta)}
              onRemove={() => onRemoveItem(index)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CartItemRowProps {
  item: PosCartItem;
  onQuantityChange: (delta: number) => void;
  onRemove: () => void;
}

function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  return (
    <div className="flex gap-3 p-3 rounded-lg border bg-card">
      <div className="w-16 h-16 rounded bg-muted overflow-hidden shrink-0">
        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{item.productName}</h4>
        {item.variantLabel && <p className="text-xs text-muted-foreground">{item.variantLabel}</p>}
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onQuantityChange(-1)}>
            -
          </Button>
          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onQuantityChange(1)}>
            +
          </Button>
          <Button variant="ghost" size="sm" className="h-6 ml-auto text-xs" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">{formatPrice(item.lineTotal)}</p>
        <p className="text-xs text-muted-foreground">{formatPrice(item.unitPrice)} each</p>
      </div>
    </div>
  );
}
