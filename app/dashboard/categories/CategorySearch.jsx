"use client";

import * as Search from "@/components/shared/search";
import { useCategorySearch } from "@/hooks/filter/use-category-search";
import SelectInput from "@/components/form/form-utils/select-input";
import { useCategoryTree, getParentCategoryOptions } from "@/hooks/query/useCategories";

const SEARCH_TYPE_OPTIONS = [
  { value: "name", label: "Name" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export function CategorySearch({ token }) {
  const searchHook = useCategorySearch();

  // Fetch category tree for parent filter
  const { data: treeResponse } = useCategoryTree(token);
  const categoryTree = treeResponse?.data || [];
  const parentOptions = [
    { value: "", label: "All Parents" },
    { value: "null", label: "Root Categories Only" },
    ...getParentCategoryOptions(categoryTree),
  ];

  return (
    <Search.Root hook={searchHook}>
      <Search.Container>
        <Search.TypeInput
          placeholder="Search categories..."
          searchTypeOptions={SEARCH_TYPE_OPTIONS}
        />

        <Search.Filters title="Category Filters">
          <SelectInput
            label="Status"
            items={STATUS_OPTIONS}
            value={searchHook.isActive}
            onValueChange={searchHook.setIsActive}
            placeholder="All Status"
          />
          <SelectInput
            label="Parent Category"
            items={parentOptions}
            value={searchHook.parent}
            onValueChange={searchHook.setParent}
            placeholder="All Parents"
          />
        </Search.Filters>

        <Search.Actions />
      </Search.Container>
    </Search.Root>
  );
}
