"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function FilterBar({
  showFilters,
  onToggleFilters,
  activeFilterCount,
  hasActiveFilters,
  onClearFilters,
}: FilterBarProps) {
  return (
    <div className="hidden lg:flex items-center gap-3">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onToggleFilters} 
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        {showFilters ? "Hide Filters" : "Show Filters"}
        {activeFilterCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear All
          <X className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
