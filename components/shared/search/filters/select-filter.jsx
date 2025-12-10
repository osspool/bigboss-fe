"use client";

import SelectInput from "@/components/form/form-utils/select-input";
import { useSearch } from "../search-context";

/**
 * Reusable select filter component
 *
 * @example
 * <SelectFilter
 *   name="status"
 *   label="Status"
 *   options={STATUS_OPTIONS}
 * />
 */
export function SelectFilter({
  name,
  label,
  options,
  placeholder = "All",
  disabled
}) {
  const { filters, updateFilter } = useSearch();

  return (
    <SelectInput
      label={label}
      items={options}
      value={filters?.[name] ?? ""}
      onValueChange={(value) => updateFilter?.(name, value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
