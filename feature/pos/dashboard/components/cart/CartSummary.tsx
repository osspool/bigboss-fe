"use client";

import { formatPrice } from "@/lib/constants";

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  redemptionDiscount?: number;
  tierDiscount?: number;
  tierName?: string;
  tierColor?: string;
  total: number;
  pointsToEarn?: number;
}

export function CartSummary({
  subtotal,
  discount,
  redemptionDiscount = 0,
  tierDiscount = 0,
  tierName,
  tierColor,
  total,
  pointsToEarn = 0,
}: CartSummaryProps) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatPrice(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Discount</span>
          <span className="font-medium">-{formatPrice(discount)}</span>
        </div>
      )}
      {tierDiscount > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Tier Discount{tierName ? ` (${tierName})` : ""}
          </span>
          <span className="font-medium" style={tierColor ? { color: tierColor } : undefined}>
            -{formatPrice(tierDiscount)}
          </span>
        </div>
      )}
      {redemptionDiscount > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Points Redeemed</span>
          <span className="font-medium">-{formatPrice(redemptionDiscount)}</span>
        </div>
      )}
      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
      {pointsToEarn > 0 && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Points to Earn</span>
          <span
            className="font-medium"
            style={tierColor ? { color: tierColor } : undefined}
          >
            +{pointsToEarn} pts
          </span>
        </div>
      )}
    </div>
  );
}
