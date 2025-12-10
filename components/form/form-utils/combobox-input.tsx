"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues } from "react-hook-form";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, generateStableKey } from "@/lib/utils";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxInputProps {
  // React Hook Form
  control?: Control<FieldValues>;
  name: string;

  // Field configuration
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  description?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;

  // Options
  items?: ComboboxOption[];

  // Value handling
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;

  // Styling
  className?: string;
  labelClassName?: string;
  triggerClassName?: string;

  // Custom rendering
  renderOption?: (option: ComboboxOption) => ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ComboboxInput - Searchable select with react-hook-form integration
 *
 * @example
 * ```tsx
 * <ComboboxInput
 *   control={form.control}
 *   name="country"
 *   label="Country"
 *   items={[
 *     { value: "us", label: "United States" },
 *     { value: "uk", label: "United Kingdom" },
 *   ]}
 *   searchPlaceholder="Search countries..."
 * />
 * ```
 */
export default function ComboboxInput({
  control,
  name,
  label,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No items found.",
  description,
  helperText,
  required,
  disabled,
  items = [],
  className,
  labelClassName,
  triggerClassName,
  onValueChange,
  renderOption,
  value: propValue,
  onChange: propOnChange,
}: ComboboxInputProps) {
  const descriptionText = description || helperText;
  const [open, setOpen] = useState(false);

  const handleSelect = (
    selectedValue: string,
    field?: { onChange: (value: string) => void }
  ) => {
    if (field) {
      field.onChange(selectedValue);
    } else if (propOnChange) {
      propOnChange(selectedValue);
    }
    onValueChange?.(selectedValue);
    setOpen(false);
  };

  const renderCombobox = (
    currentValue: string | undefined,
    field?: { onChange: (value: string) => void },
    isDisabled?: boolean
  ) => {
    const selectedItem = items.find((item) => item.value === currentValue);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isDisabled}
            className={cn(
              "w-full justify-between font-normal",
              !currentValue && "text-muted-foreground",
              triggerClassName
            )}
          >
            {selectedItem ? selectedItem.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {items.map((item, index) => {
                  const itemKey = generateStableKey(item, index, name || "combobox");
                  return (
                  <CommandItem
                    key={itemKey}
                    value={item.label}
                    disabled={item.disabled}
                    onSelect={() => handleSelect(item.value, field)}
                  >
                    {renderOption ? renderOption(item) : item.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        currentValue === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
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
        {renderCombobox(propValue, undefined, disabled)}
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
          {renderCombobox(field.value, field, disabled)}
          {descriptionText && <FieldDescription>{descriptionText}</FieldDescription>}
          {fieldState.invalid && fieldState.error && (
            <FieldError errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
}

// Named export
export { ComboboxInput };
export type { ComboboxInputProps, ComboboxOption };
