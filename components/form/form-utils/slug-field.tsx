"use client";

import { forwardRef, type ChangeEvent } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues, FieldError as RHFFieldError } from "react-hook-form";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Wand2 } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface SlugFieldProps {
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

  // Slug generation
  sourceValue?: string;
  onGenerate?: (sourceValue: string) => string;

  // Value handling
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  onValueChange?: (value: string) => void;

  // Styling
  className?: string;
  labelClassName?: string;
  inputClassName?: string;

  // Error (for direct usage)
  error?: RHFFieldError;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generates a URL-friendly slug from a string
 */
export function generateSlug(text: string | undefined): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SlugField - URL slug input with auto-generation
 *
 * @example
 * ```tsx
 * <SlugField
 *   control={form.control}
 *   name="slug"
 *   label="URL Slug"
 *   sourceValue={form.watch("title")}
 *   description="This will be used in the page URL"
 *   required
 * />
 * ```
 */
const SlugField = forwardRef<HTMLInputElement, SlugFieldProps>(
  (
    {
      control,
      name,
      description,
      helperText,
      required,
      label,
      placeholder = "my-page-slug",
      disabled,
      sourceValue,
      onGenerate,
      className,
      inputClassName,
      labelClassName,
      onValueChange,
      value,
      onChange,
      error,
    },
    ref
  ) => {
    const descriptionText = description || helperText;

    const handleGenerate = (
      _currentValue: string | undefined,
      fieldOnChange?: (value: string) => void
    ) => {
      const newSlug = onGenerate
        ? onGenerate(sourceValue || "")
        : generateSlug(sourceValue);
      fieldOnChange?.(newSlug);
      onValueChange?.(newSlug);
    };

    const renderInput = (
      fieldValue: string | undefined,
      fieldOnChange?: (value: string) => void,
      isDisabled?: boolean,
      fieldState?: { invalid?: boolean; error?: RHFFieldError }
    ) => {
      return (
        <InputGroup>
          <InputGroupInput
            ref={ref}
            id={name}
            type="text"
            disabled={isDisabled}
            placeholder={placeholder}
            value={fieldValue || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const newValue = e.target.value;
              fieldOnChange?.(newValue);
              onValueChange?.(newValue);
            }}
            aria-invalid={fieldState?.invalid}
            className={inputClassName}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="sm"
              onClick={() => handleGenerate(fieldValue, fieldOnChange)}
              disabled={isDisabled || !sourceValue}
              title="Generate slug from source"
            >
              <Wand2 className="h-4 w-4" />
              Generate
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      );
    };

    // With react-hook-form
    if (control && name) {
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
              {renderInput(field.value, field.onChange, disabled, fieldState)}
              {descriptionText && <FieldDescription>{descriptionText}</FieldDescription>}
              {fieldState.invalid && fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      );
    }

    // Direct usage (without react-hook-form)
    const handleDirectChange = (newValue: string) => {
      onChange?.({ target: { value: newValue } });
      onValueChange?.(newValue);
    };

    return (
      <Field className={className} data-disabled={disabled}>
        {label && (
          <FieldLabel htmlFor={name} className={labelClassName}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FieldLabel>
        )}
        {renderInput(value, handleDirectChange, disabled, { error })}
        {descriptionText && <FieldDescription>{descriptionText}</FieldDescription>}
        {error && <FieldError errors={[error]} />}
      </Field>
    );
  }
);

SlugField.displayName = "SlugField";

export default SlugField;
export { SlugField };
export type { SlugFieldProps };

