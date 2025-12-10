"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const decrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const increase = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="flex items-center border border-border rounded-md">
      <button
        onClick={decrease}
        disabled={quantity <= min}
        className="w-14 h-14 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 rounded-l-md"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-14 h-14 flex items-center justify-center border-x border-border font-medium text-lg">
        {quantity}
      </span>
      <button
        onClick={increase}
        disabled={quantity >= max}
        className="w-14 h-14 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50 rounded-r-md"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
