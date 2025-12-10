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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// ============================================================================
// TYPES
// ============================================================================

interface RadioChoice {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioInputProps {
  // React Hook Form
  control?: Control<FieldValues>;
  name: string;

  // Field configuration
  label?: string;
  description?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;

  // Radio options
  choices?: RadioChoice[];
  items?: RadioChoice[]; // Alias for choices (for FormKit compatibility)

  // Layout
  orientation?: "vertical" | "horizontal";

  // Value handling
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;

  // Styling
  className?: string;
  labelClassName?: string;
  radioGroupClassName?: string;
  radioItemClassName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * RadioInput - Radio group with react-hook-form integration
 *
 * @example
 * ```tsx
 * <RadioInput
 *   control={form.control}
 *   name="plan"
 *   label="Select Plan"
 *   choices={[
 *     { value: "free", label: "Free" },
 *     { value: "pro", label: "Pro" },
 *     { value: "enterprise", label: "Enterprise" },
 *   ]}
 *   orientation="horizontal"
 * />
 * ```
 */
export default function RadioInput({
  control,
  name,
  label,
  description,
  helperText,
  required,
  disabled,
  choices = [],
  items,
  orientation = "vertical",
  value: propValue,
  onChange: propOnChange,
  onValueChange,
  className,
  labelClassName,
  radioGroupClassName,
  radioItemClassName,
}: RadioInputProps) {
  const descriptionText = description || helperText;

  // Support both 'choices' and 'items' prop names
  const radioOptions = items || choices;

  // For direct usage without React Hook Form
  const [localValue, setLocalValue] = useState<string>(propValue || "");

  // Update local value when prop value changes
  useEffect(() => {
    if (propValue !== undefined) {
      setLocalValue(propValue);
    }
  }, [propValue]);

  // Handle direct value changes (without React Hook Form)
  const handleDirectValueChange = (newValue: string) => {
    setLocalValue(newValue);
    propOnChange?.(newValue);
    onValueChange?.(newValue);
  };

  const renderRadioGroup = (
    field?: { value: string; onChange: (value: string) => void },
    isDisabled?: boolean
  ) => {
    // Get value from either form field or direct props
    const value = field ? field.value : localValue;

    const handleValueChange = (newValue: string) => {
      if (field) {
        field.onChange(newValue);
      } else {
        handleDirectValueChange(newValue);
      }

      onValueChange?.(newValue);
    };

    return (
      <RadioGroup
        value={value}
        onValueChange={handleValueChange}
        className={cn(
          orientation === "horizontal"
            ? "flex flex-row flex-wrap gap-4"
            : "flex flex-col space-y-2",
          radioGroupClassName
        )}
      >
        {radioOptions.map((choice) => (
          <div
            key={choice.value}
            className={cn(
              "flex items-center space-x-2 space-y-0",
              radioItemClassName
            )}
          >
            <RadioGroupItem
              id={`${name}-${choice.value}`}
              value={choice.value}
              disabled={isDisabled || choice.disabled}
            />
            <label
              htmlFor={`${name}-${choice.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {choice.label}
            </label>
          </div>
        ))}
      </RadioGroup>
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
        {renderRadioGroup(undefined, disabled)}
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
          {renderRadioGroup(field as { value: string; onChange: (value: string) => void }, disabled)}
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
export { RadioInput };
export type { RadioInputProps, RadioChoice };

