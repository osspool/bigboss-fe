"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface FormTextareaProps {
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
  readOnly?: boolean;
  rows?: number;

  // Value handling
  value?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;

  // Styling
  className?: string;
  labelClassName?: string;
  textareaClassName?: string;

  // HTML textarea attributes
  minLength?: number;
  maxLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;

  // Additional props
  [key: string]: unknown;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FormTextarea - Textarea with react-hook-form integration
 *
 * @example
 * ```tsx
 * <FormTextarea
 *   control={form.control}
 *   name="bio"
 *   label="Biography"
 *   placeholder="Tell us about yourself..."
 *   rows={5}
 * />
 * ```
 */
export default function FormTextarea({
  control,
  name,
  label,
  description,
  helperText,
  required,
  disabled,
  readOnly,
  placeholder,
  value: propValue,
  onChange: propOnChange,
  onValueChange,
  className,
  labelClassName,
  textareaClassName,
  rows = 3,
  minLength,
  maxLength,
  autoComplete,
  autoFocus,
  ...props
}: FormTextareaProps) {
  // Filter out non-HTML props that shouldn't reach the DOM
  const { fullWidth, ...domProps } = props as any;
  const descriptionText = description || helperText;

  // For direct usage without React Hook Form
  const [localValue, setLocalValue] = useState<string>(propValue || "");

  // Update local value when prop value changes
  useEffect(() => {
    if (propValue !== undefined) {
      setLocalValue(propValue);
    }
  }, [propValue]);

  // Handle direct value changes (without React Hook Form)
  const handleDirectValueChange = (value: string) => {
    setLocalValue(value);
    propOnChange?.(value);
    onValueChange?.(value);
  };

  const renderTextarea = (
    field?: { value: string; onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; onBlur: () => void; name: string; ref: React.Ref<HTMLTextAreaElement> },
    isDisabled?: boolean
  ) => {
    // Get value from either form field or direct props
    const value = field ? field.value : localValue;

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      if (field) {
        field.onChange(e);
      } else {
        handleDirectValueChange(newValue);
      }

      onValueChange?.(newValue);
    };

    return (
      <Textarea
        {...(field || {})}
        id={name}
        name={name}
        {...(field || propValue !== undefined ? { value: value ?? "" } : {})}
        placeholder={placeholder}
        disabled={isDisabled}
        readOnly={readOnly}
        className={cn("overflow-auto resize-none", textareaClassName)}
        rows={rows}
        minLength={minLength}
        maxLength={maxLength}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        {...(field || propOnChange || onValueChange
          ? { onChange: handleChange }
          : {})}
        {...domProps}
      />
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
        {renderTextarea(undefined, disabled)}
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
          {renderTextarea(field, disabled)}
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
export { FormTextarea };
export type { FormTextareaProps };

