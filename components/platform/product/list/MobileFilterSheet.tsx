"use client";

import { useState, useEffect } from "react";
import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { ProductFilters } from "./ProductFilters";
import { Badge } from "@/components/ui/badge";
import type { PriceRange, ProductFilterState } from "@/types";

interface MobileFilterSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ProductFilterState;
  priceLimit: PriceRange;
  onApplyFilters: (filters: ProductFilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function MobileFilterSheet({
  isOpen,
  onOpenChange,
  filters,
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

  const handleTagToggle = (tag: string) => {
    setDraftFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
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
      selectedTags: [],
      priceRange: priceLimit,
    };
    setDraftFilters(clearedFilters);
  };

  // Count draft filter changes
  const draftFilterCount =
    (draftFilters.parentCategory ? 1 : 0) +
    (draftFilters.childCategory ? 1 : 0) +
    draftFilters.selectedTags.length +
    (draftFilters.priceRange.min > priceLimit.min || draftFilters.priceRange.max < priceLimit.max ? 1 : 0);

  // Custom header content
  const headerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5" />
        <span className="font-semibold text-lg">Filters</span>
        {draftFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {draftFilterCount} active
          </Badge>
        )}
      </div>
      {draftFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Reset
        </Button>
      )}
    </div>
  );

  // Footer content
  const footerContent = (
    <Button
      className="w-full h-11 text-base font-semibold"
      onClick={handleApply}
    >
      {draftFilterCount > 0 ? (
        <>Show Results ({draftFilterCount} filter{draftFilterCount !== 1 ? 's' : ''})</>
      ) : (
        <>Show All Products</>
      )}
    </Button>
  );

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        className="gap-2 relative"
        onClick={() => onOpenChange(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <Badge
            variant="default"
            className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full text-xs font-semibold"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Filter Sheet */}
      <SheetWrapper
        open={isOpen}
        onOpenChange={onOpenChange}
        title="Filters"
        header={headerContent}
        footer={footerContent}
        side="left"
        size="sm"
      >
        <ProductFilters
          parentCategory={draftFilters.parentCategory}
          childCategory={draftFilters.childCategory}
          selectedTags={draftFilters.selectedTags}
          priceRange={draftFilters.priceRange}
          priceLimit={priceLimit}
          onCategoryChange={handleCategoryChange}
          onTagToggle={handleTagToggle}
          onPriceRangeChange={handlePriceRangeChange}
        />
      </SheetWrapper>
    </>
  );
}
