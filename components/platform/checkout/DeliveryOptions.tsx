import { Truck, Check } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { DeliveryOption } from "@/types";
import { cn } from "@/lib/utils";

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { method: "standard", label: "Standard Delivery", price: 150, estimatedDays: "3-5 business days" },
  { method: "express", label: "Express Delivery", price: 300, estimatedDays: "1-2 business days" },
];

interface DeliveryOptionsProps {
  options?: DeliveryOption[];
  selected: DeliveryOption;
  onChange: (option: DeliveryOption) => void;
  freeShippingThreshold?: number;
  subtotal: number;
}

export function DeliveryOptions({
  options = DELIVERY_OPTIONS,
  selected,
  onChange,
  freeShippingThreshold = 5000,
  subtotal,
}: DeliveryOptionsProps) {
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;

  return (
    <div className="space-y-3">
      <h3 className="font-medium flex items-center gap-2">
        <Truck className="h-5 w-5" />
        Delivery Method
      </h3>

      {qualifiesForFreeShipping && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <Check className="h-4 w-4" />
          You qualify for free shipping!
        </p>
      )}

      <div className="grid gap-3">
        {options.map((option) => {
          const isFree = qualifiesForFreeShipping && option.method === "standard";
          const isSelected = selected?.method === option.method;

          return (
            <label
              key={option.method}
              className={cn(
                "flex items-center justify-between p-4 border cursor-pointer transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="delivery"
                  checked={isSelected}
                  onChange={() => onChange(option)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isSelected
                      ? "border-primary"
                      : "border-muted-foreground"
                  )}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.estimatedDays}</p>
                </div>
              </div>
              <span className={cn("font-medium", isFree && "line-through text-muted-foreground")}>
                {isFree ? "Free" : formatPrice(option.price)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
