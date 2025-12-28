"use client";

import { useFieldArray, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";

// Common size names for quick add
const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/**
 * SizesField - Clean tabular interface for managing size measurements
 */
export function SizesField({ control, disabled = false }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sizes",
  });

  // Watch measurementLabels to build table columns
  const measurementLabels = useWatch({
    control,
    name: "measurementLabels",
  }) || [];

  // Watch current sizes to determine which common sizes are already used
  const watchedSizes = useWatch({
    control,
    name: "sizes",
  }) || [];

  const usedSizeNames = watchedSizes.map((s) => s?.name?.toUpperCase());
  const availableCommonSizes = COMMON_SIZES.filter(
    (size) => !usedSizeNames.includes(size.toUpperCase())
  );

  const handleAddSize = (sizeName = "") => {
    const measurements = {};
    measurementLabels.forEach((label) => {
      const key = labelToKey(label);
      measurements[key] = "";
    });

    append({
      name: sizeName,
      measurements,
    });
  };

  // Convert label to measurement key (lowercase, underscored)
  const labelToKey = (label) => label.toLowerCase().replace(/\s+/g, "_");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <FieldLabel className="text-base font-medium">Size Definitions</FieldLabel>
          <FieldDescription className="text-sm text-muted-foreground">
            Define sizes and their measurements based on the labels above.
          </FieldDescription>
        </div>
      </div>

      {/* No measurement labels warning */}
      {measurementLabels.length === 0 && (
        <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center bg-muted/30">
          Add measurement labels first (e.g., Chest, Length, Shoulder)
        </div>
      )}

      {/* Table */}
      {measurementLabels.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-muted/50 border-b">
            <div className="grid gap-2 p-3" style={{ gridTemplateColumns: `100px repeat(${measurementLabels.length}, 1fr) 40px` }}>
              <div className="text-xs font-medium text-muted-foreground uppercase">Size</div>
              {measurementLabels.map((label) => (
                <div key={label} className="text-xs font-medium text-muted-foreground uppercase truncate">
                  {label}
                </div>
              ))}
              <div></div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y">
            {fields.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No sizes added. Click a size button below to add.
              </div>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-2 p-2 items-center hover:bg-muted/30"
                style={{ gridTemplateColumns: `100px repeat(${measurementLabels.length}, 1fr) 40px` }}
              >
                {/* Size Name */}
                <Input
                  {...control.register(`sizes.${index}.name`)}
                  placeholder="Size"
                  disabled={disabled}
                  className="h-9 text-sm font-medium"
                />

                {/* Measurement Inputs */}
                {measurementLabels.map((label) => {
                  const key = labelToKey(label);
                  return (
                    <Input
                      key={label}
                      {...control.register(`sizes.${index}.measurements.${key}`)}
                      placeholder="-"
                      disabled={disabled}
                      className="h-9 text-sm"
                    />
                  );
                })}

                {/* Remove Button */}
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Buttons */}
      {measurementLabels.length > 0 && !disabled && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Add size:</span>
          {availableCommonSizes.map((size) => (
            <Button
              key={size}
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => handleAddSize(size)}
            >
              {size}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => handleAddSize("")}
          >
            <Plus className="h-3 w-3 mr-1" />
            Custom
          </Button>
        </div>
      )}

      {/* Helper text */}
      {fields.length > 0 && (
        <FieldDescription className="text-xs text-muted-foreground">
          Enter values like &quot;34-36&quot; for ranges or &quot;26&quot; for single measurements.
        </FieldDescription>
      )}
    </div>
  );
}
