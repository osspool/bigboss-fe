"use client";

import { Controller } from "react-hook-form";
import { LiteEditor } from "./index";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * LiteEditorField - Form field wrapper for LiteEditor
 * Integrates with react-hook-form via Controller
 * 
 * @param {Object} props
 * @param {string} props.name - Field name for form
 * @param {Object} props.control - react-hook-form control
 * @param {string} props.label - Field label
 * @param {string} props.description - Field description
 * @param {boolean} props.required - Whether field is required
 * @param {boolean} props.disabled - Disable editing
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.minHeight - Minimum height
 * @param {string} props.className - Additional CSS classes
 */
export function LiteEditorField({
  name,
  control,
  label,
  description,
  required = false,
  disabled = false,
  placeholder,
  minHeight = 200,
  className,
  ...props
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={cn("space-y-2", className)}>
          {label && (
            <Label htmlFor={name} className="text-sm font-medium">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          
          <LiteEditor
            value={field.value || ""}
            onChange={field.onChange}
            placeholder={placeholder}
            minHeight={minHeight}
            disabled={disabled}
            className={cn(error && "border-destructive")}
            {...props}
          />
          
          {error && (
            <p className="text-xs text-destructive">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}

export default LiteEditorField;
