"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearch } from "./search-context";

/**
 * Filter actions component (Reset/Apply buttons)
 * Used inside filter popovers/sheets
 */
export function SearchFilterActions({ onClose, disabled }) {
  const { handleSearch, clearSearch, hasActiveFilters } = useSearch();

  const handleApply = () => {
    handleSearch?.();
    onClose?.();
  };

  return (
    <div className="flex gap-2 border-t bg-muted/30 p-4 pt-3 -mx-4 -mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={clearSearch}
        className="flex-1"
        disabled={disabled || !hasActiveFilters}
      >
        Reset
      </Button>
      <Button
        size="sm"
        onClick={handleApply}
        className="flex-1"
        disabled={disabled}
      >
        <Search size={16} className="mr-2" />
        Apply
      </Button>
    </div>
  );
}
