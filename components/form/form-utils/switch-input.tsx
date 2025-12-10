"use client";

import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

// ============================================================================
// TYPES
// ============================================================================

interface SwitchInputProps {
  // React Hook Form
  control?: Control<FieldValues>;
  name: string;

  // Field configuration
  label?: string;
  description?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;

  // Layout
  orientation?: "horizontal" | "vertical";

  // Value handling
  value?: boolean;
  onChange?: (value: boolean) => void;
  onValueChange?: (value: boolean) => void;

  // Styling
  className?: string;
  labelClassName?: string;
  switchClassName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SwitchInput - Toggle switch with react-hook-form integration
 *
 * @example
 * ```tsx
 * <SwitchInput
 *   control={form.control}
 *   name="notifications"
 *   label="Enable notifications"
 *   description="Receive email updates"
 * />
 * ```
 */
export default function SwitchInput({
  control,
  name,
  label,
  description,
  helperText,
  required,
  disabled,
  orientation = "horizontal",
  value: propValue,
  onChange: propOnChange,
  onValueChange,
  className,
  labelClassName,
  switchClassName,
}: SwitchInputProps) {
  const descriptionText = description || helperText;

  // For direct usage without React Hook Form
  const [localValue, setLocalValue] = useState<boolean>(propValue || false);

  // Update local value when prop value changes
  useEffect(() => {
    if (propValue !== undefined) {
      setLocalValue(propValue);
    }
  }, [propValue]);

  // Handle direct value changes (without React Hook Form)
  const handleDirectValueChange = (newValue: boolean) => {
    setLocalValue(newValue);
    propOnChange?.(newValue);
    onValueChange?.(newValue);
  };

  const renderSwitch = (
    field?: { value: boolean; onChange: (value: boolean) => void },
    isDisabled?: boolean
  ) => {
    // Get value from either form field or direct props
    const value = field ? (field.value ?? false) : (localValue ?? false);

    const handleCheckedChange = (checked: boolean) => {
      if (field) {
        field.onChange(checked);
      } else {
        handleDirectValueChange(checked);
      }

      onValueChange?.(checked);
    };

    return (
      <Switch
        id={name}
        checked={value}
        onCheckedChange={handleCheckedChange}
        disabled={isDisabled}
        className={switchClassName}
      />
    );
  };

  // Direct usage without React Hook Form
  if (!control) {
    return (
      <Field
        className={className}
        data-disabled={disabled}
        orientation={orientation}
      >
        {renderSwitch(undefined, disabled)}
        <FieldContent>
          {label && (
            <FieldLabel htmlFor={name} className={labelClassName}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FieldLabel>
          )}
          {descriptionText && <FieldDescription>{descriptionText}</FieldDescription>}
        </FieldContent>
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
          orientation={orientation}
        >
          {renderSwitch(field as { value: boolean; onChange: (value: boolean) => void }, disabled)}
          <FieldContent>
            {label && (
              <FieldLabel htmlFor={name} className={labelClassName}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </FieldLabel>
            )}
            {descriptionText && <FieldDescription>{descriptionText}</FieldDescription>}
            {fieldState.invalid && fieldState.error && (
              <FieldError errors={[fieldState.error]} />
            )}
          </FieldContent>
        </Field>
      )}
    />
  );
}

// Named export for flexibility
export { SwitchInput };
export type { SwitchInputProps };

