"use client";

import { cn } from "@/lib/utils";
import FormInput from "@/components/form/form-utils/form-input";
import { useSearch } from "../search-context";

/**
 * Reusable range filter component (min/max)
 *
 * @example
 * <RangeFilter
 *   minName="minPrice"
 *   maxName="maxPrice"
 *   label="Price Range"
 *   minPlaceholder="0"
 *   maxPlaceholder="Any"
 * />
 */
export function RangeFilter({
  minName,
  maxName,
  label,
  minLabel = "Min",
  maxLabel = "Max",
  minPlaceholder = "0",
  maxPlaceholder = "Any",
  type = "number",
  disabled,
  className
}) {
  const { filters, updateFilter } = useSearch();

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <FormInput
          name={minName}
          label={minLabel}
          type={type}
          placeholder={minPlaceholder}
          value={filters?.[minName] ?? ""}
          onChange={(value) => updateFilter?.(minName, value)}
          min={0}
          inputMode="decimal"
          disabled={disabled}
        />
        <FormInput
          name={maxName}
          label={maxLabel}
          type={type}
          placeholder={maxPlaceholder}
          value={filters?.[maxName] ?? ""}
          onChange={(value) => updateFilter?.(maxName, value)}
          min={0}
          inputMode="decimal"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
