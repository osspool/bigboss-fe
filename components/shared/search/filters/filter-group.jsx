"use client";

import { cn } from "@/lib/utils";

/**
 * Filter group component for organizing related filters
 *
 * @example
 * <FilterGroup title="Price Range">
 *   <FormInput label="Min" ... />
 *   <FormInput label="Max" ... />
 * </FilterGroup>
 */
export function FilterGroup({ children, title, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
