"use client";

import { TAG_OPTIONS, formatPrice } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { CategoryFilter } from "./CategoryFilter";
import { Sparkles } from "lucide-react";
import type { PriceRange } from "@/types";

interface ProductFiltersProps {
  parentCategory: string | null;
  childCategory: string | null;
  selectedTags: string[];
  priceRange: PriceRange;
  priceLimit: PriceRange;
  onCategoryChange: (parent: string | null, child: string | null) => void;
  onTagToggle: (tag: string) => void;
  onPriceRangeChange: (range: PriceRange) => void;
}

export function ProductFilters({
  parentCategory,
  childCategory,
  selectedTags,
  priceRange,
  priceLimit,
  onCategoryChange,
  onTagToggle,
  onPriceRangeChange,
}: ProductFiltersProps) {
  return (
    <div className="space-y-1">
      {/* Categories Section */}
      <FilterSection>
        <CategoryFilter
          parentCategory={parentCategory}
          childCategory={childCategory}
          onCategoryChange={onCategoryChange}
        />
      </FilterSection>

      {/* Collections/Tags Section */}
      <FilterSection>
        <TagFilter
          selectedTags={selectedTags}
          onTagToggle={onTagToggle}
        />
      </FilterSection>

      {/* Price Range Section */}
      <FilterSection>
        <PriceRangeFilter
          priceRange={priceRange}
          priceLimit={priceLimit}
          onPriceRangeChange={onPriceRangeChange}
        />
      </FilterSection>
    </div>
  );
}

// Wrapper component for consistent section styling
function FilterSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-5 border-b border-border last:border-b-0">
      {children}
    </div>
  );
}

function TagFilter({
  selectedTags,
  onTagToggle,
}: {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}) {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        Collections
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {TAG_OPTIONS.map((tag) => {
          const isSelected = selectedTags.includes(tag.value);
          return (
            <button
              key={tag.value}
              onClick={() => onTagToggle(tag.value)}
              className={cn(
                "px-3 py-2.5 text-sm font-medium transition-all rounded-lg text-center",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
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

  const isPriceFiltered = priceRange.min > priceLimit.min || priceRange.max < priceLimit.max;

  return (
    <div>
      <h3 className="font-semibold text-sm mb-4">
        Price Range
      </h3>
      <div className="space-y-5">
        <Slider
          value={[priceRange.min, priceRange.max]}
          min={priceLimit.min}
          max={priceLimit.max}
          step={100}
          onValueChange={handleSliderChange}
          className="w-full"
        />
        <div className="flex items-center justify-between">
          <PriceInput
            value={priceRange.min}
            isActive={priceRange.min > priceLimit.min}
          />
          <span className="text-muted-foreground text-xs px-2">to</span>
          <PriceInput
            value={priceRange.max}
            isActive={priceRange.max < priceLimit.max}
          />
        </div>
        {isPriceFiltered && (
          <p className="text-xs text-muted-foreground text-center">
            Showing products in selected price range
          </p>
        )}
      </div>
    </div>
  );
}

function PriceInput({ value, isActive }: { value: number; isActive: boolean }) {
  return (
    <div
      className={cn(
        "px-3 py-2 rounded-lg text-sm font-medium min-w-[90px] text-center transition-colors",
        isActive
          ? "bg-primary/10 text-primary border border-primary/20"
          : "bg-muted/50 text-muted-foreground"
      )}
    >
      {formatPrice(value)}
    </div>
  );
}
