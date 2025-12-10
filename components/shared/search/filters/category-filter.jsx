"use client";

import { TagChoiceInput } from "@/components/form/form-utils/tag-choice-input";
import { useSearch } from "../search-context";

/**
 * Reusable category/tag filter component
 *
 * @example
 * <CategoryFilter
 *   name="category"
 *   label="Categories"
 *   options={CATEGORY_OPTIONS}
 * />
 */
export function CategoryFilter({
  name,
  label,
  options,
  placeholder = "Select options",
  disabled
}) {
  const { filters, updateFilter } = useSearch();

  return (
    <TagChoiceInput
      label={label}
      items={options}
      value={filters?.[name] ?? []}
      onValueChange={(value) => updateFilter?.(name, value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
