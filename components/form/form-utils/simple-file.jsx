"use client";
import { Controller } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { Upload } from "lucide-react";

/**
 * SimpleFile - File input component with new Shadcn Field pattern
 * 
 * Features:
 * - Controller-based form integration
 * - Optional InputGroup with upload icon
 * - Support for file validation
 * - Clean error handling
 * 
 * @example
 * <SimpleFile
 *   control={control}
 *   name="avatar"
 *   label="Profile Picture"
 *   description="Upload a profile image"
 *   accept="image/*"
 * />
 */
const SimpleFile = ({
  control,
  name,
  label,
  fileRef,
  description,
  disabled,
  required,
  accept,
  multiple,
  showIcon = true,
  className,
  labelClassName,
  inputClassName,
  ...props
}) => {
  if (!control || !name) {
    // Direct usage without form (for backward compatibility)
    return (
      <Field className={className} data-disabled={disabled}>
        {label && (
          <FieldLabel className={labelClassName}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FieldLabel>
        )}
        {showIcon ? (
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Upload className="h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
              type="file"
              disabled={disabled}
              accept={accept}
              multiple={multiple}
              className={inputClassName}
              {...fileRef}
              {...props}
            />
          </InputGroup>
        ) : (
          <Input
            type="file"
            disabled={disabled}
            accept={accept}
            multiple={multiple}
            className={inputClassName}
            {...fileRef}
            {...props}
          />
        )}
        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    );
  }

  // With react-hook-form - NEW PATTERN with Controller
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...fieldProps }, fieldState }) => (
        <Field 
          className={className}
          data-disabled={disabled}
          data-invalid={fieldState.invalid}
        >
          {label && (
            <FieldLabel className={labelClassName}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FieldLabel>
          )}
          {showIcon ? (
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Upload className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                type="file"
                disabled={disabled}
                accept={accept}
                multiple={multiple}
                className={inputClassName}
                onChange={(e) => {
                  // For file inputs, we pass the FileList or single File
                  const files = e.target.files;
                  onChange(multiple ? files : files?.[0] || null);
                }}
                {...fieldProps}
                {...fileRef}
                {...props}
              />
            </InputGroup>
          ) : (
            <Input
              type="file"
              disabled={disabled}
              accept={accept}
              multiple={multiple}
              className={inputClassName}
              onChange={(e) => {
                const files = e.target.files;
                onChange(multiple ? files : files?.[0] || null);
              }}
              {...fieldProps}
              {...fileRef}
              {...props}
            />
          )}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && (
            <FieldError errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
};

export default SimpleFile;
