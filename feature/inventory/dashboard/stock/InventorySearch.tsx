"use client";

import { Search, SelectInput } from "@classytic/clarity";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PARENT_CATEGORY_OPTIONS,
  CATEGORY_OPTIONS,
  STOCK_STATUS_OPTIONS,
  type InventorySearchHook,
} from "@/hooks/filter/use-inventory-search";

/**
 * Inventory Search & Filter Bar
 * Uses the composable Search component system
 * Follows the same pattern as product search with separate parent category and category filters
 */
export function InventorySearch({
  searchHook,
  onRefresh,
  isRefreshing = false,
}: {
  searchHook: InventorySearchHook;
  onRefresh: () => void;
  isRefreshing?: boolean;
}) {
  const searchTypeOptions = [
    { value: "lookup", label: "Lookup" },
    { value: "name", label: "Name" },
  ];

  const placeholder =
    searchHook.searchType === "name"
      ? "Search by product name..."
      : "Scan/search barcode or SKU...";

  return (
    <Search.Root hook={searchHook}>
      <Search.Container>
        <Search.TypeInput
          placeholder={placeholder}
          searchTypeOptions={searchTypeOptions}
          showClearButton={true}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
        />

        <Search.Filters title="Inventory Filters">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectInput
              name="parentCategory"
              label="Parent Category"
              items={PARENT_CATEGORY_OPTIONS}
              value={searchHook.parentCategory}
              onValueChange={searchHook.setParentCategory}
              placeholder="All Categories"
            />
            <SelectInput
              name="category"
              label="Category"
              items={CATEGORY_OPTIONS}
              value={searchHook.category}
              onValueChange={searchHook.setCategory}
              placeholder="All Subcategories"
            />
            <SelectInput
              name="stockStatus"
              label="Stock Status"
              items={STOCK_STATUS_OPTIONS}
              value={searchHook.stockStatus}
              onValueChange={searchHook.setStockStatus}
              placeholder="All Stock"
            />
          </div>
        </Search.Filters>

        <Search.Actions />

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn("size-4", isRefreshing && "animate-spin")}
          />
        </Button>
      </Search.Container>
    </Search.Root>
  );
}
