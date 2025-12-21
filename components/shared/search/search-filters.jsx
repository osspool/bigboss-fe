"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearch } from "./search-context";
import { SearchFilterActions } from "./search-filter-actions";

/**
 * Search filters component with mobile sheet support
 *
 * @example
 * <Search.Filters>
 *   <TagChoiceInput label="Category" ... />
 *   <SelectInput label="Status" ... />
 * </Search.Filters>
 */
export function SearchFilters({
  children,
  title = "Filters",
  description = "Refine your search results",
  disabled,
  className
}) {
  const { hasActiveFilters, filters = {} } = useSearch();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Count active filters (excluding default "all" values)
  const activeFilterCount = Object.values(filters).filter((value) => {
    if (Array.isArray(value)) {
      return value.filter(Boolean).length > 0;
    }
    if (typeof value === "string") {
      // Exclude "all" as it's the default/neutral state
      return value.trim().length > 0 && value !== "all";
    }
    if (typeof value === "number") {
      return value !== undefined && value !== null && value !== "" && !Number.isNaN(value);
    }
    if (typeof value === "boolean") {
      return value;
    }
    return Boolean(value);
  }).length;

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="space-y-4">
        {children}
      </div>
      <SearchFilterActions onClose={() => setIsOpen(false)} />
    </div>
  );

  const triggerButton = (
    <Button
      variant="outline"
      size="default"
      className={cn(
        "relative h-10 w-10 shrink-0 px-0 sm:w-auto sm:px-4",
        hasActiveFilters && "bg-primary/10 border-primary hover:bg-primary/15"
      )}
      disabled={disabled}
      aria-label="Open filters"
    >
      <Filter className="size-4" />
      <span className="hidden sm:inline ml-2">Filters</span>
      {activeFilterCount > 0 && (
        <Badge
          variant="secondary"
          className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground"
        >
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          size="default"
          className={cn(
            "relative h-10 w-10 shrink-0 px-0",
            hasActiveFilters && "bg-primary/10 border-primary hover:bg-primary/15"
          )}
          disabled={disabled}
          aria-label="Open filters"
          onClick={() => setIsOpen(true)}
        >
          <Filter className="size-4" />
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        <SheetWrapper
          open={isOpen}
          onOpenChange={setIsOpen}
          title={title}
          description={description}
          side="bottom"
          size="default"
        >
          <FilterContent />
        </SheetWrapper>
      </>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 sm:w-96" align="end" sideOffset={8}>
        <FilterContent />
      </PopoverContent>
    </Popover>
  );
}
