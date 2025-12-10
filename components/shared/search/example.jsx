/**
 * Search Component System - Example Usage
 *
 * This file demonstrates how to build search UIs using the new composable system.
 */

import * as Search from "@/components/shared/search";
import {
  CategoryFilter,
  SelectFilter,
  RangeFilter,
  FilterGroup
} from "@/components/shared/search/filters";

// ============================================================================
// EXAMPLE 1: Simple Search (just a search box)
// ============================================================================

export function SimpleSearch({ hook }) {
  return (
    <Search.Root hook={hook}>
      <Search.Container>
        <Search.Input placeholder="Search..." />
        <Search.Actions />
      </Search.Container>
    </Search.Root>
  );
}

// ============================================================================
// EXAMPLE 2: Search with Basic Filters
// ============================================================================

export function SearchWithFilters({ hook, categoryOptions, statusOptions }) {
  return (
    <Search.Root hook={hook}>
      <Search.Container>
        <Search.Input placeholder="Search..." />

        <Search.Filters title="Filters">
          <CategoryFilter
            name="category"
            label="Category"
            options={categoryOptions}
          />
          <SelectFilter
            name="status"
            label="Status"
            options={statusOptions}
          />
        </Search.Filters>

        <Search.Actions />
      </Search.Container>
    </Search.Root>
  );
}

// ============================================================================
// EXAMPLE 3: E-commerce Product Search (Advanced)
// ============================================================================

export function ProductSearch({ hook, brands, categories }) {
  return (
    <Search.Root
      hook={hook}
      className="rounded-lg border bg-card p-4 shadow-sm"
    >
      <Search.Container>
        <Search.Input placeholder="Search products..." />

        <Search.Filters title="Filter Products">
          <FilterGroup title="Product Details">
            <CategoryFilter
              name="category"
              label="Categories"
              options={categories}
            />
            <CategoryFilter
              name="brand"
              label="Brands"
              options={brands}
            />
          </FilterGroup>

          <FilterGroup title="Price">
            <RangeFilter
              minName="minPrice"
              maxName="maxPrice"
              label="Price Range"
            />
          </FilterGroup>
        </Search.Filters>

        <Search.Actions />
      </Search.Container>
    </Search.Root>
  );
}

// ============================================================================
// EXAMPLE 4: Custom Filter Component
// ============================================================================

import { useSearch } from "@/components/shared/search";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function InStockFilter() {
  const { filters, updateFilter } = useSearch();

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="in-stock"
        checked={filters.inStock || false}
        onCheckedChange={(checked) => updateFilter("inStock", checked)}
      />
      <Label htmlFor="in-stock">In stock only</Label>
    </div>
  );
}

export function SearchWithCustomFilter({ hook }) {
  return (
    <Search.Root hook={hook}>
      <Search.Container>
        <Search.Input placeholder="Search..." />

        <Search.Filters>
          <InStockFilter />
        </Search.Filters>

        <Search.Actions />
      </Search.Container>
    </Search.Root>
  );
}

// ============================================================================
// EXAMPLE 5: Mobile-Optimized Layout
// ============================================================================

export function MobileOptimizedSearch({ hook }) {
  return (
    <Search.Root hook={hook}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search input takes full width on mobile */}
        <div className="flex-1">
          <Search.Input
            placeholder="Search..."
            showIcon={true}
          />
        </div>

        {/* Filters and actions side by side on mobile */}
        <div className="flex gap-2">
          <Search.Filters title="Filters">
            <CategoryFilter name="category" options={[]} />
          </Search.Filters>
          <Search.Actions
            showSearchButton={true}
            showClearButton={false} // Hide clear on mobile
          />
        </div>
      </div>
    </Search.Root>
  );
}
