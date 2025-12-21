"use client";

import type { VariationAttribute, ProductVariant } from "@/types";
import { cn } from "@/lib/utils";
import { COLORS } from "@/data/constants";
import { Check } from "lucide-react";

interface VariationSelectorProps {
  variationAttributes: VariationAttribute[];
  variants: ProductVariant[];
  selectedAttributes: Record<string, string>;
  onAttributeChange: (name: string, value: string) => void;
}

export function VariationSelector({
  variationAttributes,
  variants,
  selectedAttributes,
  onAttributeChange,
}: VariationSelectorProps) {
  // Helper to get color hex value
  const getColorHex = (colorName: string) => {
    const color = COLORS.find(
      (c) => c.name.toLowerCase() === colorName.toLowerCase()
    );
    return color?.value;
  };

  // Check if color is light (for determining check icon color)
  const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6;
  };

  // Check if a specific variant combination is available
  const isValueAvailable = (attrName: string, value: string) => {
    const testAttributes = { ...selectedAttributes, [attrName.toLowerCase()]: value };

    // Find if any active variant matches this combination
    return variants.some(variant => {
      if (!variant.isActive) return false;

      // Check if this variant matches all selected attributes
      return Object.entries(testAttributes).every(([key, val]) =>
        variant.attributes[key] === val
      );
    });
  };

  return (
    <div className="space-y-5">
      {variationAttributes.map((attribute) => {
        const isColorVariation = attribute.name.toLowerCase() === "color";
        const attrKey = attribute.name.toLowerCase();

        return (
          <div key={attribute.name}>
            <label className="text-sm font-medium text-foreground block mb-3">
              {attribute.name}:{" "}
              <span className="text-muted-foreground font-normal">
                {selectedAttributes[attrKey]}
              </span>
            </label>

            {isColorVariation ? (
              // Color swatches - minimal circular design
              <div className="flex flex-wrap gap-3">
                {attribute.values.map((value) => {
                  const isSelected = selectedAttributes[attrKey] === value;
                  const isAvailable = isValueAvailable(attribute.name, value);
                  const colorHex = getColorHex(value) || "#888888";
                  const needsDarkCheck = isLightColor(colorHex);

                  return (
                    <button
                      key={value}
                      onClick={() => onAttributeChange(attrKey, value)}
                      disabled={!isAvailable}
                      title={value}
                      className={cn(
                        "relative w-9 h-9 rounded-full transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isSelected && "ring-2 ring-foreground ring-offset-2",
                        !isAvailable && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute inset-0 rounded-full border",
                          isSelected ? "border-transparent" : "border-border"
                        )}
                        style={{ backgroundColor: colorHex }}
                      />
                      {isSelected && (
                        <Check
                          className={cn(
                            "absolute inset-0 m-auto w-4 h-4",
                            needsDarkCheck ? "text-foreground" : "text-white"
                          )}
                          strokeWidth={3}
                        />
                      )}
                      {!isAvailable && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-px bg-foreground/50 rotate-45 absolute" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Size/other attributes - clean pill buttons
              <div className="flex flex-wrap gap-2">
                {attribute.values.map((value) => {
                  const isSelected = selectedAttributes[attrKey] === value;
                  const isAvailable = isValueAvailable(attribute.name, value);

                  return (
                    <button
                      key={value}
                      onClick={() => onAttributeChange(attrKey, value)}
                      disabled={!isAvailable}
                      className={cn(
                        "min-w-12 h-10 px-4 text-sm font-medium transition-all duration-150 rounded-md border",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isSelected
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-input hover:border-foreground",
                        !isAvailable &&
                          "opacity-30 cursor-not-allowed line-through decoration-foreground/50"
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
