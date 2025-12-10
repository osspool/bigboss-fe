"use client";

import * as React from "react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type DateValue = Date | string | null | undefined;

interface DateInputProps {
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

  // Date constraints
  minDate?: DateValue;
  maxDate?: DateValue;

  // Value handling
  value?: DateValue;
  onChange?: (date: Date | undefined) => void;
  onValueChange?: (date: Date | undefined) => void;

  // Styling
  className?: string;
  labelClassName?: string;
  inputClassName?: string;

  // Options
  Icon?: React.ComponentType<{ className?: string }>;
  allowClear?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert various date formats to Date object
 */
function toDate(val: DateValue): Date | undefined {
  if (!val) return undefined;
  if (val instanceof Date) return val;
  // Handle YYYY-MM-DD format
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split("-").map(Number);
    const dt = new Date(y!, (m || 1) - 1, d || 1);
    return isNaN(dt.getTime()) ? undefined : dt;
  }
  const dt = new Date(val);
  return isNaN(dt.getTime()) ? undefined : dt;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * DateInput - Date picker with react-hook-form integration
 *
 * @example
 * ```tsx
 * <DateInput
 *   control={form.control}
 *   name="birthDate"
 *   label="Date of Birth"
 *   minDate="1900-01-01"
 *   maxDate={new Date()}
 * />
 * ```
 */
export default function DateInput({
  control,
  name,
  label,
  description,
  helperText,
  placeholder = "Pick a date",
  required,
  disabled,
  className,
  labelClassName,
  inputClassName,
  minDate,
  maxDate,
  onValueChange,
  value: propValue,
  onChange: propOnChange,
  Icon = CalendarIcon,
  allowClear = true,
}: DateInputProps) {
  const descriptionText = description || helperText;

  // Check if date should be disabled
  const isDateDisabled = (date: Date): boolean => {
    if (!date) return false;
    const minDateObj = toDate(minDate);
    const maxDateObj = toDate(maxDate);
    if (minDateObj && date < minDateObj) return true;
    if (maxDateObj && date > maxDateObj) return true;
    return false;
  };

  // Render the date picker UI
  const renderDateInput = (
    field?: { value: DateValue; onChange: (date: Date | undefined) => void },
    isDisabled?: boolean
  ) => {
    const value = field ? field.value : propValue;
    const selected = toDate(value);
    const [open, setOpen] = useState(false);

    const handleSelect = (date: Date | undefined) => {
      if (field) field.onChange(date);
      else if (propOnChange) propOnChange(date);
      onValueChange?.(date);
      setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
      e?.stopPropagation?.();
      if (field) field.onChange(undefined);
      else if (propOnChange) propOnChange(undefined);
      onValueChange?.(undefined);
    };

    const displayText = selected
      ? selected.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : placeholder;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground",
              inputClassName
            )}
            disabled={isDisabled}
          >
            <Icon className="mr-2 h-4 w-4" />
            {displayText}
            {allowClear && selected && !isDisabled && (
              <X
                className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            defaultMonth={selected}
            selected={selected}
            onSelect={handleSelect}
            disabled={isDateDisabled}
            initialFocus
          />
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
            {required && <span className="text-destructive ml-1">*</span>}
          </FieldLabel>
        )}
        {renderDateInput(undefined, disabled)}
        {descriptionText && <FieldDescription>{descriptionText}</FieldDescription>}
      </Field>
    );
  }

  // Using with React Hook Form via Controller
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
              {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>
          )}
          {renderDateInput(field as { value: DateValue; onChange: (date: Date | undefined) => void }, disabled)}
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
export { DateInput };
export type { DateInputProps };

