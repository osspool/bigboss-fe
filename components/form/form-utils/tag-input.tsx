"use client";

import { useState, useRef, useCallback, useMemo, type ClipboardEvent, type KeyboardEvent, type ChangeEvent } from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldValues } from "react-hook-form";
import { X, Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";

// ============================================================================
// TYPES
// ============================================================================

interface TagInputProps {
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

  // Tag behavior
  maxTags?: number;
  allowDuplicates?: boolean;
  delimiter?: string;

  // Suggestions
  suggestions?: string[];
  suggestionLimit?: number;

  // Value handling
  value?: string[];
  onChange?: (tags: string[]) => void;
  onValueChange?: (tags: string[]) => void;

  // Tag validation/transformation
  validateTag?: (tag: string) => boolean;
  transformTag?: (tag: string) => string;

  // Styling
  className?: string;
  labelClassName?: string;
  inputClassName?: string;

  // Additional props
  [key: string]: unknown;
}

interface RenderTagInputProps {
  field: { value: string[]; onChange: (tags: string[]) => void } | null;
  disabled?: boolean;
  error?: string | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TagInput - Tag/chip input with react-hook-form integration
 *
 * @example
 * ```tsx
 * <TagInput
 *   control={form.control}
 *   name="tags"
 *   label="Tags"
 *   placeholder="Add tags..."
 *   maxTags={10}
 *   suggestions={["react", "typescript", "nextjs"]}
 * />
 * ```
 */
export default function TagInput({
  control,
  name,
  label,
  description,
  helperText,
  placeholder = "Add tag...",
  required,
  disabled,
  className,
  labelClassName,
  inputClassName,
  maxTags,
  allowDuplicates = false,
  suggestions = [],
  suggestionLimit = 8,
  value: propValue = [],
  onChange: propOnChange,
  onValueChange,
  delimiter = ",",
  validateTag,
  transformTag,
  ...props
}: TagInputProps) {
  const descriptionText = description || helperText;
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse and validate multiple tags from a string
  const parseMultipleTags = useCallback(
    (input: string): string[] => {
      if (!input.trim()) return [];

      return input
        .split(delimiter)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .map((tag) => (transformTag ? transformTag(tag) : tag))
        .filter((tag) => !validateTag || validateTag(tag));
    },
    [delimiter, validateTag, transformTag]
  );

  // Add multiple tags at once
  const handleAddMultipleTags = useCallback(
    (
      tags: string[],
      newTags: string[],
      field: { onChange: (tags: string[]) => void } | null
    ): string[] => {
      if (!newTags || newTags.length === 0) return tags;

      const updatedTags = [...tags];
      let addedCount = 0;

      for (const newTag of newTags) {
        if (!newTag.trim()) continue;

        const trimmedTag = newTag.trim();

        if (!allowDuplicates && updatedTags.includes(trimmedTag)) {
          continue;
        }

        if (maxTags && updatedTags.length >= maxTags) {
          break;
        }

        updatedTags.push(trimmedTag);
        addedCount++;
      }

      if (addedCount > 0) {
        if (field) {
          field.onChange(updatedTags);
        } else if (propOnChange) {
          propOnChange(updatedTags);
        }
        onValueChange?.(updatedTags);
      }

      return updatedTags;
    },
    [allowDuplicates, maxTags, propOnChange, onValueChange]
  );

  // Handle single tag addition
  const handleAddTag = useCallback(
    (
      tags: string[],
      newTag: string,
      field: { onChange: (tags: string[]) => void } | null
    ): string[] => {
      const tagsToAdd = parseMultipleTags(newTag);
      const updatedTags = handleAddMultipleTags(tags, tagsToAdd, field);
      setInputValue("");
      return updatedTags;
    },
    [parseMultipleTags, handleAddMultipleTags]
  );

  const handleRemoveTag = useCallback(
    (
      tags: string[],
      indexToRemove: number,
      field: { onChange: (tags: string[]) => void } | null
    ): string[] => {
      const updatedTags = tags.filter((_, index) => index !== indexToRemove);

      if (field) {
        field.onChange(updatedTags);
      } else if (propOnChange) {
        propOnChange(updatedTags);
      }

      onValueChange?.(updatedTags);
      return updatedTags;
    },
    [propOnChange, onValueChange]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement>,
      tags: string[],
      field: { onChange: (tags: string[]) => void } | null
    ) => {
      const value = e.target.value;

      if (value.includes(delimiter)) {
        const parts = value.split(delimiter);
        const completeTags = parts.slice(0, -1);
        const remainingInput = parts[parts.length - 1] || "";

        if (completeTags.length > 0) {
          handleAddMultipleTags(
            tags,
            completeTags.map((t) => t.trim()).filter((t) => t),
            field
          );
        }

        setInputValue(remainingInput);
      } else {
        setInputValue(value);
      }
    },
    [delimiter, handleAddMultipleTags]
  );

  // Handle paste events
  const handlePaste = useCallback(
    (
      e: ClipboardEvent<HTMLInputElement>,
      tags: string[],
      field: { onChange: (tags: string[]) => void } | null
    ) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const pastedTags = parseMultipleTags(pastedText);

      if (pastedTags.length > 0) {
        handleAddMultipleTags(tags, pastedTags, field);
        setInputValue("");
      }
    },
    [parseMultipleTags, handleAddMultipleTags]
  );

  const handleKeyDown = useCallback(
    (
      e: KeyboardEvent<HTMLInputElement>,
      tags: string[],
      field: { onChange: (tags: string[]) => void } | null
    ) => {
      if (e.key === "Enter" || e.key === delimiter) {
        e.preventDefault();
        handleAddTag(tags, inputValue, field);
      } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
        e.preventDefault();
        handleRemoveTag(tags, tags.length - 1, field);
      }
    },
    [delimiter, inputValue, handleAddTag, handleRemoveTag]
  );

  const getPlaceholder = useCallback(
    (tagsCount: number): string => {
      if (tagsCount === 0) {
        return placeholder.includes("comma")
          ? placeholder
          : `${placeholder} (separate with ${delimiter} for multiple)`;
      }
      return "Add another...";
    },
    [placeholder, delimiter]
  );

  const canAddMoreTags = useCallback(
    (tagsLength: number): boolean => {
      return !maxTags || tagsLength < maxTags;
    },
    [maxTags]
  );

  const renderTagInput = ({ field, disabled: isDisabled, error }: RenderTagInputProps) => {
    const tags: string[] = field ? field.value || [] : propValue || [];
    const showInput = !isDisabled && canAddMoreTags(tags.length);
    const normalizedInput = (inputValue || "").toLowerCase().trim();

    const filteredSuggestions = useMemo(() => {
      if (!normalizedInput) return [];
      const existingSet = new Set(tags.map((t) => t.toLowerCase()));
      return suggestions
        .filter(Boolean)
        .map((s) => (transformTag ? transformTag(s) : s))
        .filter((s) => s.toLowerCase().includes(normalizedInput))
        .filter((s) => allowDuplicates || !existingSet.has(s.toLowerCase()))
        .slice(0, suggestionLimit);
    }, [normalizedInput, tags]);

    return (
      <>
        {/* Tags Display Area */}
        {tags.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-1.5 mb-3",
              "p-2.5 rounded-md bg-muted/30 border border-border/50"
            )}
          >
            {tags.map((tag, index) => (
              <Badge
                key={`${tag}-${index}`}
                variant="secondary"
                className={cn(
                  "group flex items-center gap-1.5 px-2.5 py-1",
                  "bg-background border border-border shadow-sm",
                  "hover:border-primary/50 transition-all duration-200",
                  "animate-in fade-in-0 zoom-in-95",
                  isDisabled && "opacity-60"
                )}
              >
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span
                  className="max-w-[200px] truncate text-sm font-medium"
                  title={tag}
                >
                  {tag}
                </span>
                {!isDisabled && (
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
                      handleRemoveTag(tags, index, field);
                    }}
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Input Field */}
        {showInput && (
          <div className="space-y-3">
            <InputGroup className={cn(error && "border-destructive")}>
              <InputGroupAddon align="inline-start">
                <Tag className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e, tags, field)}
                onKeyDown={(e) => handleKeyDown(e, tags, field)}
                onPaste={(e) => handlePaste(e, tags, field)}
                placeholder={getPlaceholder(tags.length)}
                disabled={isDisabled}
                aria-label="Add new tag"
                aria-invalid={!!error}
                className={inputClassName}
                {...props}
              />
              {inputValue.trim() && (
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => handleAddTag(tags, inputValue, field)}
                    aria-label="Add tag"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </InputGroupAddon>
              )}
            </InputGroup>

            {/* Suggestions list */}
            {filteredSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-md bg-muted/30 border border-dashed">
                <span className="text-xs text-muted-foreground font-medium w-full mb-1">
                  Suggestions:
                </span>
                {filteredSuggestions.map((sug) => (
                  <Button
                    key={sug}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-7 px-2.5 text-xs",
                      "hover:border-primary/50 hover:bg-primary/5",
                      "transition-all duration-200"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddMultipleTags(tags, [sug], field);
                      setInputValue("");
                    }}
                    aria-label={`Add ${sug}`}
                  >
                    {sug}
                    <Plus className="h-3 w-3 ml-1.5 opacity-70" />
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Status indicators */}
        {maxTags && (
          <div
            className={cn(
              "text-xs font-medium mt-2 flex items-center gap-1.5",
              tags.length >= maxTags
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                tags.length >= maxTags
                  ? "bg-destructive"
                  : "bg-muted-foreground/50"
              )}
            />
            {tags.length}/{maxTags} tags
          </div>
        )}
      </>
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
        <FieldContent>
          {renderTagInput({ field: null, disabled, error: null })}
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
        >
          {label && (
            <FieldLabel htmlFor={name} className={labelClassName}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>
          )}
          <FieldContent>
            {renderTagInput({
              field: field as { value: string[]; onChange: (tags: string[]) => void },
              disabled,
              error: fieldState?.error?.message,
            })}
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

// Named export
export { TagInput };
export type { TagInputProps };

