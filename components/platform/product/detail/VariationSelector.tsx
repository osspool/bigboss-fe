"use client";

import type { ProductVariation } from "@/types";
import { cn } from "@/lib/utils";
import { COLORS } from "@/data/constants";

interface VariationSelectorProps {
  variations: ProductVariation[];
  selectedVariations: Record<string, string>;
  onVariationChange: (name: string, value: string) => void;
}

export function VariationSelector({
  variations,
  selectedVariations,
  onVariationChange,
}: VariationSelectorProps) {
  // Helper to get color hex value
  const getColorHex = (colorName: string) => {
    const color = COLORS.find(
      (c) => c.name.toLowerCase() === colorName.toLowerCase()
    );
    return color?.value;
  };

  return (
    <div className="space-y-6 pt-4 border-t border-border">
      {variations.map((variation) => {
        const isColorVariation = variation.name.toLowerCase() === "color";

        return (
          <div key={variation.name}>
            <label className="text-sm font-medium uppercase tracking-wider block mb-3">
              {variation.name}:{" "}
              <span className="font-normal">
                {selectedVariations[variation.name]}
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {variation.options.map((option) => {
                const isSelected = selectedVariations[variation.name] === option.value;
                const colorHex = isColorVariation ? getColorHex(option.value) : null;

                return (
                  <button
                    key={option.value}
                    onClick={() => onVariationChange(variation.name, option.value)}
                    disabled={option.quantity === 0}
                    className={cn(
                      "min-w-14 px-4 py-3 border text-sm font-medium transition-all duration-200 rounded-md",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-foreground",
                      option.quantity === 0 &&
                        "opacity-40 cursor-not-allowed line-through"
                    )}
                  >
                    {isColorVariation && colorHex ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: colorHex }}
                        />
                        <span>{option.value}</span>
                      </div>
                    ) : (
                      option.value
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
