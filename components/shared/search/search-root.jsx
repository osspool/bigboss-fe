"use client";

import { cn } from "@/lib/utils";
import { SearchProvider } from "./search-context";

/**
 * Root search component that provides context to all child components
 *
 * @example
 * <Search.Root hook={useMySearch()}>
 *   <Search.Input />
 *   <Search.Filters />
 *   <Search.Actions />
 * </Search.Root>
 */
export function SearchRoot({ children, hook, className }) {
  return (
    <SearchProvider value={hook}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </SearchProvider>
  );
}
