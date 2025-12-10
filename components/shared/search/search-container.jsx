"use client";

import { cn } from "@/lib/utils";

/**
 * Container for search input and action buttons
 * Provides responsive layout
 *
 * @example
 * <Search.Container>
 *   <Search.Input />
 *   <Search.Filters />
 *   <Search.Actions />
 * </Search.Container>
 */
export function SearchContainer({ children, className }) {
  return (
    <div className={cn("flex items-center gap-2 flex-1", className)}>
      {children}
    </div>
  );
}
