"use client";

import type { ChangeEvent } from "react";
import * as React from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface TransformFunctions {
  input?: (value: unknown) => string;
  output?: (value: string) => unknown;
}

interface FormInputProps {
  // React Hook Form
  control?: Control<FieldValues>;
  name: string;

  // Field configuration
  label?: string;
  placeholder?: string;
  description?: string;
  helperText?: string; // Alias for description
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  type?: string;

  // Styling
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  inputGroupClassName?: string;

  // Input group addons
  IconLeft?: ReactNode;
  IconRight?: ReactNode;
  AddonLeft?: ReactNode;
  AddonRight?: ReactNode;

  // Value transformation
  transform?: TransformFunctions;
  onValueChange?: (value: unknown) => void;

  // Direct usage (without react-hook-form)
  value?: string | number;
  onChange?: (value: unknown) => void;

  // HTML input attributes
  min?: number | string;
  max?: number | string;
  step?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;

  // Additional props
  [key: string]: unknown;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FormInput - Text input with react-hook-form integration
 *
 * Features:
 * - Works with react-hook-form Controller
 * - Supports input groups with icons/addons
 * - Value transformation (input/output)
 * - Can be used standalone without form
 *
 * @example
 * ```tsx
 * // With react-hook-form
 * <FormInput
 *   control={form.control}
 *   name="email"
 *   type="email"
 *   label="Email"
 *   placeholder="user@example.com"
 *   required
 * />
 *
 * // With icon
 * <FormInput
 *   control={form.control}
 *   name="search"
 *   IconLeft={<SearchIcon />}
 *   placeholder="Search..."
 * />
 * ```
 */
export default function FormInput({
  control,
  name,
  label,
  placeholder,
  description,
  helperText,
  required,
  disabled,
  readOnly,
  type = "text",
  className,
  labelClassName,
  inputClassName,
  inputGroupClassName,
  IconLeft,
  IconRight,
  AddonLeft,
  AddonRight,
  onValueChange,
  transform,
  value,
  onChange,
  min,
  max,
  step,
  minLength,
  maxLength,
  pattern,
  autoComplete,
  autoFocus,
  ...props
}: FormInputProps) {
  // Use helperText as alias for description
  const descriptionText = description || helperText;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    field?: { onChange: (value: unknown) => void }
  ) => {
    const newValue = transform?.output
      ? transform.output(e.target.value)
      : e.target.value;

    if (field) {
      field.onChange(newValue);
    } else if (onChange) {
      onChange(newValue);
    }

    onValueChange?.(newValue);
  };

  // Determine if we need InputGroup (has icons or addons)
  const hasInputGroup = IconLeft || IconRight || AddonLeft || AddonRight;

  const renderInput = (
    field?: { value: unknown; onChange: (value: unknown) => void; onBlur: () => void; name: string; ref: React.Ref<HTMLInputElement> },
    isDisabled?: boolean,
    fieldState?: { invalid?: boolean; error?: { message?: string } }
  ) => {
    const rawValue = field
      ? transform?.input
        ? transform.input(field.value)
        : field.value
      : transform?.input
        ? transform.input(value)
        : value;
    const safeValue = (rawValue as string) ?? "";

    const inputProps: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> } = {
      id: name,
      name: name,
      type,
      disabled: isDisabled,
      readOnly,
      placeholder,
      value: safeValue,
      onChange: (e: ChangeEvent<HTMLInputElement>) => handleChange(e, field),
      "aria-invalid": fieldState?.invalid,
      min,
      max,
      step,
      minLength,
      maxLength,
      pattern,
      autoComplete,
      autoFocus,
    };
    
    // Add field ref if present
    if (field?.ref) {
      inputProps.ref = field.ref;
    }

    if (hasInputGroup) {
      return (
        <InputGroup className={cn(inputGroupClassName)}>
          {(AddonLeft || IconLeft) && (
            <InputGroupAddon align="inline-start">
              {AddonLeft || IconLeft}
            </InputGroupAddon>
          )}
          <InputGroupInput {...inputProps} className={inputClassName} />
          {(AddonRight || IconRight) && (
            <InputGroupAddon align="inline-end">
              {AddonRight || IconRight}
            </InputGroupAddon>
          )}
        </InputGroup>
      );
    }

    return <Input {...inputProps} className={inputClassName} />;
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
        {renderInput(undefined, disabled, undefined)}
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
          {renderInput(field, disabled, fieldState)}
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
export { FormInput };
export type { FormInputProps };

