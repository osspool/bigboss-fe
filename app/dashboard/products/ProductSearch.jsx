"use client";

import { useMemo } from "react";
import * as Search from "@/components/shared/search";
import { useProductSearch } from "@/hooks/filter/use-product-search";
import SelectInput from "@/components/form/form-utils/select-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategoryTree, getParentCategoryOptions, getAllCategoryOptions } from "@/hooks/query/useCategories";

const SEARCH_TYPE_OPTIONS = [
  { value: "name", label: "Search" },
  { value: "slug", label: "Slug" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export function ProductSearch({ token }) {
  const searchHook = useProductSearch();

  // Fetch category tree for dynamic options
  const { data: treeResponse, isLoading: isCategoriesLoading } = useCategoryTree(token);
  const categoryTree = treeResponse?.data || [];

  // Build parent category options from tree
  const parentCategoryOptions = useMemo(() => {
    const options = getParentCategoryOptions(categoryTree);
    return [
      { value: "", label: "All Categories" },
      ...options,
    ];
  }, [categoryTree]);

  // Build subcategory options from tree
  const categoryOptions = useMemo(() => {
    const options = getAllCategoryOptions(categoryTree);
    return [
      { value: "", label: "All Subcategories" },
      ...options,
    ];
  }, [categoryTree]);

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
              items={parentCategoryOptions}
              value={searchHook.parentCategory}
              onValueChange={searchHook.setParentCategory}
              placeholder="All Categories"
              disabled={isCategoriesLoading}
            />

            <SelectInput
              label="Category"
              items={categoryOptions}
              value={searchHook.category}
              onValueChange={searchHook.setCategory}
              placeholder="All Subcategories"
              disabled={isCategoriesLoading}
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
