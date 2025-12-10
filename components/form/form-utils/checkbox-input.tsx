"use client";

import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";

// ============================================================================
// TYPES
// ============================================================================

interface CheckboxItem {
  id: string;
  label: string;
  disabled?: boolean;
}

interface CheckboxInputProps {
  // React Hook Form
  control?: Control<FieldValues>;
  name: string;

  // Field configuration
  label?: string;
  description?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;

  // Checkbox items (for multi-checkbox)
  items?: CheckboxItem[];

  // Value handling (for direct usage)
  value?: string[];
  onChange?: (values: string[]) => void;
  onValueChange?: (values: string[]) => void;

  // Styling
  className?: string;
  labelClassName?: string;
  checkboxClassName?: string;
  itemClassName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CheckboxInput - Checkbox group with react-hook-form integration
 *
 * Features:
 * - Multiple checkbox items
 * - Array value support
 * - Can be used standalone
 *
 * @example
 * ```tsx
 * <CheckboxInput
 *   control={form.control}
 *   name="features"
 *   label="Features"
 *   items={[
 *     { id: "wifi", label: "WiFi" },
 *     { id: "parking", label: "Parking" },
 *     { id: "pool", label: "Pool" },
 *   ]}
 * />
 * ```
 */
export default function CheckboxInput({
  control,
  name,
  label,
  description,
  helperText,
  required,
  disabled,
  items = [],
  value: propValue,
  onChange: propOnChange,
  onValueChange,
  className,
  labelClassName,
  checkboxClassName,
  itemClassName,
}: CheckboxInputProps) {
  const descriptionText = description || helperText;

  // For direct usage without React Hook Form
  const [localValues, setLocalValues] = useState<string[]>(propValue || []);

  // Update local value when prop value changes
  useEffect(() => {
    if (propValue !== undefined) {
      setLocalValues(propValue);
    }
  }, [propValue]);

  // Handle direct value changes (without React Hook Form)
  const handleDirectValueChange = (newValues: string[]) => {
    setLocalValues(newValues);
    propOnChange?.(newValues);
    onValueChange?.(newValues);
  };

  const renderCheckboxes = (
    field?: { value: string[]; onChange: (values: string[]) => void },
    isDisabled?: boolean
  ) => {
    // Get values from either form field or direct props
    const values: string[] = field?.value || localValues || [];

    const handleCheckedChange = (itemId: string, checked: boolean) => {
      const newValues = checked
        ? [...values, itemId]
        : values.filter((value) => value !== itemId);

      if (field) {
        field.onChange(newValues);
      } else {
        handleDirectValueChange(newValues);
      }

      onValueChange?.(newValues);
    };

    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn("flex items-center space-x-2", itemClassName)}
          >
            <Checkbox
              id={`${name}-${item.id}`}
              className={checkboxClassName}
              checked={values.includes(item.id)}
              disabled={isDisabled || item.disabled}
              onCheckedChange={(checked) =>
                handleCheckedChange(item.id, checked as boolean)
              }
            />
            <label
              htmlFor={`${name}-${item.id}`}
              className="text-sm font-normal cursor-pointer"
            >
              {item.label}
            </label>
          </div>
        ))}
      </div>
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
        {renderCheckboxes(undefined, disabled)}
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
          {renderCheckboxes(field as { value: string[]; onChange: (values: string[]) => void }, disabled)}
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
export { CheckboxInput };
export type { CheckboxInputProps, CheckboxItem };

