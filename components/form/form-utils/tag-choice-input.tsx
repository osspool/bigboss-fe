"use client";

import { useState } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues } from "react-hook-form";
import { Check, ChevronDown, X, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

// ============================================================================
// TYPES
// ============================================================================

interface TagChoiceItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface TagChoiceInputProps {
  // React Hook Form
  control?: Control<FieldValues>;
  name?: string;

  // Field configuration
  label?: string;
  placeholder?: string;
  description?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;

  // Options
  items?: TagChoiceItem[];

  // Value handling
  value?: string[];
  onValueChange?: (values: string[]) => void;

  // Styling
  className?: string;
}

interface TagChoiceInputInternalProps {
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  items: TagChoiceItem[];
  value: string[];
  onValueChange?: (values: string[]) => void;
  error?: string;
}

// ============================================================================
// INTERNAL COMPONENT
// ============================================================================

function TagChoiceInputInternal({
  label,
  description,
  placeholder = "Select...",
  required,
  disabled,
  className,
  items = [],
  value = [],
  onValueChange,
  error,
}: TagChoiceInputInternalProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedValues = value || [];

  const handleSelect = (itemValue: string) => {
    const isSelected = selectedValues.includes(itemValue);
    const newValue = isSelected
      ? selectedValues.filter((v) => v !== itemValue)
      : [...selectedValues, itemValue];
    onValueChange?.(newValue);
  };

  const handleRemove = (valueToRemove: string) => {
    const newValue = selectedValues.filter((v) => v !== valueToRemove);
    onValueChange?.(newValue);
  };

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Field className={className} data-disabled={disabled} data-invalid={!!error}>
      {label && (
        <FieldLabel>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </FieldLabel>
      )}

      <FieldContent>
        {/* Selected Tags Display */}
        {selectedValues.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-1.5 mb-3",
              "p-2.5 rounded-md bg-muted/30 border border-border/50"
            )}
          >
            {selectedValues.map((val) => {
              const item = items.find((i) => i.value === val);
              return (
                <Badge
                  key={val}
                  variant="secondary"
                  className={cn(
                    "group flex items-center gap-1.5 px-2.5 py-1",
                    "bg-background border border-border shadow-sm",
                    "hover:border-primary/50 transition-all duration-200",
                    disabled && "opacity-60"
                  )}
                >
                  <TagIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {item?.label || val}
                  </span>
                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-4 w-4 p-0 ml-0.5",
                        "text-muted-foreground/60 hover:text-destructive",
                        "hover:bg-destructive/10 rounded-sm",
                        "transition-colors"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(val);
                      }}
                      aria-label={`Remove ${item?.label || val}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Selection Trigger */}
        <Popover open={open} onOpenChange={setOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "w-full justify-between h-auto min-h-[2.5rem] px-3 py-2",
                "hover:bg-accent/50 transition-colors",
                error && "border-destructive",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                <span
                  className={cn(
                    "text-sm",
                    selectedValues.length === 0 && "text-muted-foreground"
                  )}
                >
                  {selectedValues.length > 0
                    ? `${selectedValues.length} selected`
                    : placeholder}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <div className="p-2 border-b">
              <Input
                placeholder="Search options..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-1">
              {filteredItems.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const isSelected = selectedValues.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => handleSelect(item.value)}
                        disabled={item.disabled}
                        className={cn(
                          "w-full flex items-center justify-between px-2 py-2",
                          "text-sm rounded-sm",
                          "hover:bg-accent hover:text-accent-foreground",
                          "transition-colors cursor-pointer",
                          isSelected && "bg-primary/10 text-primary font-medium",
                          item.disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span>{item.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="border-t px-2 py-2 text-xs text-muted-foreground text-center">
              {selectedValues.length > 0
                ? `${selectedValues.length} option${selectedValues.length > 1 ? "s" : ""} selected`
                : "Select options from the list"}
            </div>
          </PopoverContent>
        </Popover>

        {description && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError errors={[{ message: error }]} />}
      </FieldContent>
    </Field>
  );
}

TagChoiceInputInternal.displayName = "TagChoiceInputInternal";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * TagChoiceInput - Multi-select with tags display
 *
 * @example
 * ```tsx
 * <TagChoiceInput
 *   control={form.control}
 *   name="categories"
 *   label="Categories"
 *   items={[
 *     { value: "tech", label: "Technology" },
 *     { value: "design", label: "Design" },
 *   ]}
 * />
 * ```
 */
export function TagChoiceInput({
  control,
  name,
  label,
  description,
  helperText,
  placeholder = "Select...",
  required,
  disabled,
  className,
  items = [],
  value: propValue = [],
  onValueChange,
}: TagChoiceInputProps) {
  const descriptionText = description || helperText;

  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <TagChoiceInputInternal
            label={label}
            description={descriptionText}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={className}
            items={items}
            value={field.value || []}
            onValueChange={(val) => {
              field.onChange(val);
              onValueChange?.(val);
            }}
            error={fieldState?.error?.message}
          />
        )}
      />
    );
  }

  return (
    <TagChoiceInputInternal
      label={label}
      description={descriptionText}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={className}
      items={items}
      value={propValue}
      onValueChange={onValueChange}
    />
  );
}

TagChoiceInput.displayName = "TagChoiceInput";

export default TagChoiceInput;
export type { TagChoiceInputProps, TagChoiceItem };

