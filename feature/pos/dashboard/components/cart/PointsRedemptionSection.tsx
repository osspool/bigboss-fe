"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/constants";

interface PointsRedemptionSectionProps {
  enabled: boolean;
  pointsBalance: number;
  minRedeemPoints: number;
  maxRedeemPoints: number;
  pointsPerBdt: number;
  estimatedDiscount: number;
  error?: string | null;
  value: string;
  onChange: (value: string) => void;
  onUseMax: () => void;
}

export function PointsRedemptionSection({
  enabled,
  pointsBalance,
  minRedeemPoints,
  maxRedeemPoints,
  pointsPerBdt,
  estimatedDiscount,
  error,
  value,
  onChange,
  onUseMax,
}: PointsRedemptionSectionProps) {
  if (!enabled) return null;

  const helperText =
    maxRedeemPoints > 0
      ? `Up to ${maxRedeemPoints} pts (${formatPrice(maxRedeemPoints / pointsPerBdt)})`
      : "Not eligible for redemption";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Redeem Points</p>
        <span className="text-xs text-muted-foreground">
          Balance: {pointsBalance} pts
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder={`Min ${minRedeemPoints} pts`}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={maxRedeemPoints <= 0}
        />
        <Button
          type="button"
          variant="outline"
          onClick={onUseMax}
          disabled={maxRedeemPoints <= 0}
        >
          Use Max
        </Button>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{helperText}</span>
        {estimatedDiscount > 0 && (
          <span>-{formatPrice(estimatedDiscount)}</span>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
