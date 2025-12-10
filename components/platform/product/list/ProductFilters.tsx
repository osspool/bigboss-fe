"use client";

import { SIZES, formatPrice } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { CategoryFilter } from "./CategoryFilter";
import type { PriceRange } from "@/types";

interface ProductFiltersProps {
  parentCategory: string | null;
  childCategory: string | null;
  selectedSizes: string[];
  selectedColors: string[];
  allColors: string[];
  priceRange: PriceRange;
  priceLimit: PriceRange;
  onCategoryChange: (parent: string | null, child: string | null) => void;
  onSizeToggle: (size: string) => void;
  onColorToggle: (color: string) => void;
  onPriceRangeChange: (range: PriceRange) => void;
}

export function ProductFilters({
  parentCategory,
  childCategory,
  selectedSizes,
  selectedColors,
  allColors,
  priceRange,
  priceLimit,
  onCategoryChange,
  onSizeToggle,
  onColorToggle,
  onPriceRangeChange,
}: ProductFiltersProps) {
  return (
    <div className="space-y-6">
      <CategoryFilter
        parentCategory={parentCategory}
        childCategory={childCategory}
        onCategoryChange={onCategoryChange}
      />
      <PriceRangeFilter
        priceRange={priceRange}
        priceLimit={priceLimit}
        onPriceRangeChange={onPriceRangeChange}
      />
      <SizeFilter
        selectedSizes={selectedSizes}
        onSizeToggle={onSizeToggle}
      />
      <ColorFilter
        selectedColors={selectedColors}
        allColors={allColors}
        onColorToggle={onColorToggle}
      />
    </div>
  );
}

function PriceRangeFilter({
  priceRange,
  priceLimit,
  onPriceRangeChange,
}: {
  priceRange: PriceRange;
  priceLimit: PriceRange;
  onPriceRangeChange: (range: PriceRange) => void;
}) {
  const handleSliderChange = (values: number[]) => {
    onPriceRangeChange({ min: values[0], max: values[1] });
  };

  return (
    <div>
      <h3 className="font-medium uppercase tracking-wider text-sm mb-4">
        Price Range
      </h3>
      <div className="space-y-4">
        <Slider
          value={[priceRange.min, priceRange.max]}
          min={priceLimit.min}
          max={priceLimit.max}
          step={100}
          onValueChange={handleSliderChange}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange.min)}</span>
          <span>{formatPrice(priceRange.max)}</span>
        </div>
      </div>
    </div>
  );
}

function SizeFilter({
  selectedSizes,
  onSizeToggle,
}: {
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
}) {
  return (
    <div>
      <h3 className="font-medium uppercase tracking-wider text-sm mb-4">
        Size
      </h3>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((size) => (
          <button
            key={size}
            onClick={() => onSizeToggle(size)}
            className={cn(
              "w-10 h-10 border text-sm transition-colors rounded-md",
              selectedSizes.includes(size)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-foreground"
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorFilter({
  selectedColors,
  allColors,
  onColorToggle,
}: {
  selectedColors: string[];
  allColors: string[];
  onColorToggle: (color: string) => void;
}) {
  return (
    <div>
      <h3 className="font-medium uppercase tracking-wider text-sm mb-4">
        Color
      </h3>
      <div className="flex flex-wrap gap-2">
        {allColors.map((color) => (
          <button
            key={color}
            onClick={() => onColorToggle(color)}
            className={cn(
              "px-3 py-1.5 border text-sm transition-colors rounded-md",
              selectedColors.includes(color)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-foreground"
            )}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
}
