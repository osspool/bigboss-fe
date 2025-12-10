"use client";

import * as Search from "@/components/shared/search";
import { useProductSearch } from "@/hooks/filter/use-product-search";
import SelectInput from "@/components/form/form-utils/select-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/data/constants";

const SEARCH_TYPE_OPTIONS = [
  { value: "name", label: "Search" },
  { value: "slug", label: "Slug" },
];

// Build parent category options
const PARENT_CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  ...Object.entries(CATEGORIES).map(([key, cat]) => ({
    value: cat.slug,
    label: cat.label,
  })),
];

// Build subcategory options
const CATEGORY_OPTIONS = [
  { value: "", label: "All Subcategories" },
  ...Object.values(CATEGORIES).flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      value: sub.slug,
      label: `${cat.label} → ${sub.label}`,
    }))
  ),
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export function ProductSearch() {
  const searchHook = useProductSearch();

  return (
    <Search.Root hook={searchHook}>
      <Search.Container>
        <Search.TypeInput
          placeholder="Search products..."
          searchTypeOptions={SEARCH_TYPE_OPTIONS}
        />

        <Search.Filters title="Product Filters">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectInput
              label="Parent Category"
              items={PARENT_CATEGORY_OPTIONS}
              value={searchHook.parentCategory}
              onValueChange={searchHook.setParentCategory}
              placeholder="All Categories"
            />
            
            <SelectInput
              label="Category"
              items={CATEGORY_OPTIONS}
              value={searchHook.category}
              onValueChange={searchHook.setCategory}
              placeholder="All Subcategories"
            />
            
            <SelectInput
              label="Status"
              items={STATUS_OPTIONS}
              value={searchHook.isActive}
              onValueChange={searchHook.setIsActive}
              placeholder="All Status"
            />

            <div className="space-y-2">
              <Label className="text-sm">Min Price (৳)</Label>
              <Input
                type="number"
                placeholder="0"
                value={searchHook.minPrice}
                onChange={(e) => searchHook.setMinPrice(e.target.value)}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Max Price (৳)</Label>
              <Input
                type="number"
                placeholder="Any"
                value={searchHook.maxPrice}
                onChange={(e) => searchHook.setMaxPrice(e.target.value)}
                min={0}
              />
            </div>
          </div>
        </Search.Filters>

        <Search.Actions />
      </Search.Container>
    </Search.Root>
  );
}
