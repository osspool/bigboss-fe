"use client";

import { Search, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSearch } from "./search-context";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Search action button
 * Note: Clear functionality is handled by the X button in Search.Input
 *
 * @example
 * <Search.Actions />
 */
export function SearchActions({
  showSearchButton = true,
  showClearButton = true,
  searchButtonText,
  clearButtonText = "Clear",
  disabled,
  className
}) {
  const { handleSearch, clearSearch, searchValue, hasActiveFilters, hasActiveSearch } = useSearch();
  const isMobile = useIsMobile();

  const canSearch = Boolean(searchValue?.trim() || hasActiveFilters);
  const canClear = Boolean(searchValue?.trim() || hasActiveFilters || hasActiveSearch);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showClearButton && canClear && (
        isMobile ? (
          <Button
            variant="outline"
            size="icon"
            onClick={clearSearch}
            aria-label={clearButtonText}
            title={clearButtonText}
            className="shrink-0"
          >
            <RotateCcw />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="default"
            onClick={clearSearch}
            className="h-10 shrink-0"
          >
            {clearButtonText}
          </Button>
        )
      )}
      {showSearchButton && (
        <Button
          size="default"
          onClick={handleSearch}
          disabled={disabled || !canSearch}
          className="h-10 shrink-0 px-3 sm:px-4"
        >
          <Search size={16} className={cn(searchButtonText ? "mr-2" : "sm:mr-2")} />
          <span className="hidden sm:inline">
            {searchButtonText || "Search"}
          </span>
        </Button>
      )}
    </div>
  );
}
