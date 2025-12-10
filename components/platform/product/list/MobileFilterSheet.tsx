"use client";

import { useState, useEffect } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ProductFilters } from "./ProductFilters";
import { Badge } from "@/components/ui/badge";
import type { PriceRange, ProductFilterState } from "@/types";

interface MobileFilterSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ProductFilterState;
  allColors: string[];
  priceLimit: PriceRange;
  onApplyFilters: (filters: ProductFilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function MobileFilterSheet({
  isOpen,
  onOpenChange,
  filters,
  allColors,
  priceLimit,
  onApplyFilters,
  onClearFilters,
  activeFilterCount,
}: MobileFilterSheetProps) {
  // Local draft state for filters
  const [draftFilters, setDraftFilters] = useState<ProductFilterState>(filters);

  // Reset draft when sheet opens
  useEffect(() => {
    if (isOpen) {
      setDraftFilters(filters);
    }
  }, [isOpen, filters]);

  const handleCategoryChange = (parent: string | null, child: string | null) => {
    setDraftFilters(prev => ({ ...prev, parentCategory: parent, childCategory: child }));
  };

  const handleSizeToggle = (size: string) => {
    setDraftFilters(prev => ({
      ...prev,
      selectedSizes: prev.selectedSizes.includes(size)
        ? prev.selectedSizes.filter(s => s !== size)
        : [...prev.selectedSizes, size]
    }));
  };

  const handleColorToggle = (color: string) => {
    setDraftFilters(prev => ({
      ...prev,
      selectedColors: prev.selectedColors.includes(color)
        ? prev.selectedColors.filter(c => c !== color)
        : [...prev.selectedColors, color]
    }));
  };

  const handlePriceRangeChange = (range: PriceRange) => {
    setDraftFilters(prev => ({ ...prev, priceRange: range }));
  };

  const handleApply = () => {
    onApplyFilters(draftFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const clearedFilters: ProductFilterState = {
      parentCategory: null,
      childCategory: null,
      selectedSizes: [],
      selectedColors: [],
      priceRange: priceLimit,
    };
    setDraftFilters(clearedFilters);
  };

  // Count draft filter changes
  const draftFilterCount = 
    (draftFilters.parentCategory ? 1 : 0) +
    (draftFilters.childCategory ? 1 : 0) +
    draftFilters.selectedSizes.length +
    draftFilters.selectedColors.length +
    (draftFilters.priceRange.min > priceLimit.min || draftFilters.priceRange.max < priceLimit.max ? 1 : 0);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center justify-between">
            <span>Filters</span>
            {draftFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClear}
                className="text-muted-foreground h-8 text-xs gap-1.5"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-6">
          <ProductFilters
            parentCategory={draftFilters.parentCategory}
            childCategory={draftFilters.childCategory}
            selectedSizes={draftFilters.selectedSizes}
            selectedColors={draftFilters.selectedColors}
            allColors={allColors}
            priceRange={draftFilters.priceRange}
            priceLimit={priceLimit}
            onCategoryChange={handleCategoryChange}
            onSizeToggle={handleSizeToggle}
            onColorToggle={handleColorToggle}
            onPriceRangeChange={handlePriceRangeChange}
          />
        </div>

        <SheetFooter className="border-t border-border pt-4">
          <Button 
            className="w-full" 
            onClick={handleApply}
          >
            Apply Filters
            {draftFilterCount > 0 && ` (${draftFilterCount})`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
