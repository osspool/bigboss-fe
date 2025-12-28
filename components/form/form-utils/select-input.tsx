"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

// ============================================================================
// TYPES
// ============================================================================

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectOptionGroup {
  label: string;
  items: SelectOption[];
}

interface SelectInputProps {
  // React Hook Form
  control?: Control<FieldValues>;
  name: string;

  // Field configuration
  label?: string;
  placeholder?: string;
  description?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;

  // Options
  items?: SelectOption[];
  groups?: SelectOptionGroup[];
  allOption?: SelectOption;

  // Value handling
  valueKey?: string;
  displayKey?: string;
  value?: string | number;
  onValueChange?: (value: string) => void;

  // Styling
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  Icon?: React.ComponentType<{ className?: string }>;

  // Select behavior
  defaultOpen?: boolean;
  position?: "item-aligned" | "popper";
  maxHeight?: string;
  sideOffset?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SelectInput - Select dropdown with react-hook-form integration
 *
 * Features:
 * - Flat and grouped options
 * - Custom placeholder
 * - Optional "All" option
 * - Custom styling
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SelectInput
 *   control={form.control}
 *   name="role"
 *   label="Role"
 *   items={[
 *     { value: "admin", label: "Admin" },
 *     { value: "user", label: "User" },
 *   ]}
 * />
 *
 * // Grouped options
 * <SelectInput
 *   control={form.control}
 *   name="country"
 *   label="Country"
 *   groups={[
 *     { label: "Asia", items: [{ value: "jp", label: "Japan" }] },
 *     { label: "Europe", items: [{ value: "de", label: "Germany" }] },
 *   ]}
 * />
 * ```
 */
export default function SelectInput({
  control,
  items = [],
  groups = [],
  name,
  label,
  placeholder = "Select option",
  allOption,
  description,
  helperText,
  required,
  disabled,
  className,
  labelClassName,
  triggerClassName,
  contentClassName,
  itemClassName,
  Icon,
  valueKey = "value",
  displayKey = "label",
  onValueChange,
  value: propValue,
  defaultOpen,
  position = "popper",
  maxHeight = "320px",
  sideOffset = 4,
}: SelectInputProps) {
  const descriptionText = description || helperText;

  // Create a new array with the "All" option if provided
  // Filter out items with empty string values (Radix Select doesn't support them)
  const filteredItems = items.filter(item => {
    const val = item.value;
    return val !== undefined && val !== null && val !== "";
  });
  const displayItems = allOption ? [allOption, ...filteredItems] : filteredItems;

  // Filter groups to remove items with empty values
  const filteredGroups = groups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      const val = item.value;
      return val !== undefined && val !== null && val !== "";
    }),
  })).filter(group => group.items.length > 0); // Remove empty groups

  // For direct usage without React Hook Form
  const [localValue, setLocalValue] = useState<string>(propValue?.toString() || "");

  // Update local value when prop value changes
  useEffect(() => {
    if (propValue !== undefined) {
      setLocalValue(propValue.toString());
    }
  }, [propValue]);

  // Handle direct value changes (without React Hook Form)
  const handleDirectValueChange = (newValue: string) => {
    setLocalValue(newValue);
    onValueChange?.(newValue);
  };

  const renderSelect = (
    field?: { value: unknown; onChange: (value: string) => void },
    isDisabled?: boolean
  ) => {
    // Use field value if React Hook Form is used, otherwise use local state
    const value = field ? field.value?.toString() : localValue;

    const handleChange = (newValue: string) => {
      if (field) {
        field.onChange(newValue);
      } else {
        setLocalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    // Helper to get value from item (filter out empty strings for Radix Select compatibility)
    const getItemValue = (item: SelectOption, fallback: string): string => {
      const val = item.value !== undefined && item.value !== null
        ? item.value.toString()
        : fallback;
      // Radix Select doesn't allow empty strings, use fallback if empty
      return val === "" ? fallback : val;
    };

    // Helper to get label from item
    const getItemLabel = (item: SelectOption): string => {
      return item.label;
    };

    const getUniqueReactKey = (
      item: SelectOption,
      fallback: string,
      seen: Map<string, number>
    ): string => {
      const itemValue = getItemValue(item, fallback);
      const itemLabel = getItemLabel(item);
      const baseKey = `${itemValue}::${itemLabel}`;
      const nextCount = (seen.get(baseKey) ?? 0) + 1;
      seen.set(baseKey, nextCount);
      return nextCount === 1 ? baseKey : `${baseKey}::${nextCount}`;
    };

    // Render grouped options
    const renderGroupedContent = () => {
      if (filteredGroups.length === 0) return null;

      return filteredGroups.map((group, groupIdx) => {
        const seenKeys = new Map<string, number>();

        return (
          <SelectGroup key={`group-${groupIdx}`}>
            {group.label && <SelectLabel>{group.label}</SelectLabel>}
            {group.items.map((item, idx) => {
              const itemValue = getItemValue(item, `item-${groupIdx}-${idx}`);
              return (
                <SelectItem
                  key={getUniqueReactKey(
                    item,
                    `item-${groupIdx}-${idx}`,
                    seenKeys
                  )}
                  value={itemValue}
                  className={cn("cursor-pointer", itemClassName)}
                  disabled={item.disabled}
                >
                  {getItemLabel(item)}
                </SelectItem>
              );
            })}
          </SelectGroup>
        );
      });
    };

    // Render flat options
    const renderFlatContent = () => {
      if (displayItems.length === 0) {
        return (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No options available
          </div>
        );
      }

      const seenKeys = new Map<string, number>();
      return displayItems.map((item, idx) => {
        const itemValue = getItemValue(item, `item-${idx}`);
        return (
          <SelectItem
            key={getUniqueReactKey(item, `item-${idx}`, seenKeys)}
            value={itemValue}
            className={cn("cursor-pointer", itemClassName)}
            disabled={item.disabled}
          >
            {getItemLabel(item)}
          </SelectItem>
        );
      });
    };

    return (
      <Select
        onValueChange={handleChange}
        value={(value || "").toString()}
        disabled={isDisabled}
        defaultOpen={defaultOpen}
      >
        <SelectTrigger className={cn("w-full", triggerClassName)}>
          {Icon && <Icon className="mr-2 h-4 w-4 text-primary" />}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={cn(contentClassName)}
          position={position}
          sideOffset={sideOffset}
          style={{ maxHeight }}
        >
          {filteredGroups.length > 0 ? renderGroupedContent() : renderFlatContent()}
        </SelectContent>
      </Select>
    );
  };

  // Direct usage without React Hook Form
  if (!control) {
    return (
      <Field className={className} data-disabled={disabled}>
        {label && (
          <FieldLabel htmlFor={name} className={labelClassName}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FieldLabel>
        )}
        {renderSelect(undefined, disabled)}
        {descriptionText && <FieldDescription>{descriptionText}</FieldDescription>}
      </Field>
    );
  }

  // Using with React Hook Form
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          className={className}
          data-disabled={disabled}
          data-invalid={fieldState.invalid}
        >
          {label && (
            <FieldLabel htmlFor={name} className={labelClassName}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FieldLabel>
          )}
          {renderSelect(field, disabled)}
          {descriptionText && <FieldDescription>{descriptionText}</FieldDescription>}
          {fieldState.invalid && fieldState.error && (
            <FieldError errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
}

// Named export for flexibility
export { SelectInput };
export type { SelectInputProps, SelectOption, SelectOptionGroup };

