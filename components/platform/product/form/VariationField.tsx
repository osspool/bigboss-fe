"use client";

import { useFieldArray, Controller, useWatch, type Control, type FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_VARIATIONS, SIZES, COLORS } from "@/data/constants";
import type { Product } from "@/types/product.types";

type VariationAttributeFormValue = {
  name: string;
  values: string[];
};

type ProductVariantFormValue = {
  sku?: string;
  attributes?: Record<string, string>;
  priceModifier?: number;
  barcode?: string;
  isActive?: boolean;
};

type ProductFormValues = {
  variationAttributes: VariationAttributeFormValue[];
  variants: ProductVariantFormValue[];
};

const getOptionsForVariationType = (variationType: string) => {
  if (variationType === "Size") {
    return SIZES.map((size) => ({ value: size, label: size }));
  }
  if (variationType === "Color") {
    return COLORS.map((color) => ({ value: color.name, label: color.name }));
  }
  return [];
};

export function VariationField({
  control,
  disabled = false,
  isEdit = false,
  product = null,
}: {
  control: Control<ProductFormValues>;
  disabled?: boolean;
  isEdit?: boolean;
  product?: Product | null;
}) {
  if (!control) {
    console.error("VariationField: control prop is required");
    return null;
  }

  // Avoid conditional hook calls by delegating to an inner component.
  return (
    <VariationFieldInner
      control={control}
      disabled={disabled}
      isEdit={isEdit}
      product={product}
    />
  );
}

function VariationFieldInner({
  control,
  disabled = false,
  isEdit = false,
  product = null,
}: {
  control: Control<ProductFormValues>;
  disabled?: boolean;
  isEdit?: boolean;
  product?: Product | null;
}) {
  const untypedControl = control as unknown as Control<FieldValues>;

  const {
    fields: variationAttributes,
    append,
    remove,
  } = useFieldArray<ProductFormValues, "variationAttributes">({
    control,
    name: "variationAttributes",
  });

  const watchedAttributes = useWatch({
    control: untypedControl,
    name: "variationAttributes",
  }) as VariationAttributeFormValue[] | undefined;

  const selectedTypes = variationAttributes.map((v) => v.name);

  const availableToAdd = AVAILABLE_VARIATIONS.filter(
    (av) => !selectedTypes.includes(av.value)
  );

  const handleAddVariation = (variationType: string) => {
    if (variationAttributes.length >= 2) {
      toast.error("Maximum 2 variation attributes allowed");
      return;
    }

    append({
      name: variationType,
      values: [],
    });

    toast.success(`${variationType} attribute added`);
  };

  const totalCombinations =
    watchedAttributes?.length && watchedAttributes.length > 0
      ? watchedAttributes.reduce((total, attr) => {
          const valueCount = attr?.values?.length || 0;
          return total === 0 ? valueCount : total * valueCount;
        }, 0)
      : 0;

  return (
    <div className="space-y-4">
      

      <div className="flex items-center justify-between">
        <div>
          <FieldLabel className="text-base font-medium">
            Variation Attributes
          </FieldLabel>
          <FieldDescription>
            Define variation dimensions. Backend auto-generates all combinations.
          </FieldDescription>
        </div>

        {availableToAdd.length > 0 && !disabled && (
          <div className="flex gap-2">
            {availableToAdd.map((variation) => (
              <Button
                key={variation.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddVariation(variation.value)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {variation.value}
              </Button>
            ))}
          </div>
        )}
      </div>

      {variationAttributes.length === 0 && (
        <div className="text-sm text-muted-foreground p-6 border border-dashed rounded-lg text-center">
          <p className="mb-2">No variation attributes added.</p>
          <p className="text-xs">
            Click &quot;Add Size&quot; or &quot;Add Color&quot; above to create
            variant products.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {variationAttributes.map((field, attrIndex) => (
          <Card key={field.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold uppercase tracking-wide">
                    {field.name}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({field.values?.length || 0} values)
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(attrIndex)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>

              <VariationAttributeValues
                control={untypedControl}
                attrIndex={attrIndex}
                attrName={field.name}
                disabled={disabled}
              />
            </div>
          </Card>
        ))}
      </div>

      {totalCombinations > 0 && (
        <div className="p-3 bg-muted/50 border rounded-lg">
          <div className="text-sm">
            <span className="font-medium">Total variants: </span>
            <span className="text-muted-foreground">
              {totalCombinations} combinations will be generated
            </span>
          </div>
        </div>
      )}

      {isEdit && product?.variants && product.variants.length > 0 && (
        <ExistingVariants control={control} product={product} disabled={disabled} />
      )}

      {variationAttributes.length > 0 &&
        variationAttributes.length < 2 &&
        !disabled && (
          <p className="text-xs text-muted-foreground">
            You can add {2 - variationAttributes.length} more variation
            attribute(s).
          </p>
        )}
    </div>
  );
}

function VariationAttributeValues({
  control,
  attrIndex,
  attrName,
  disabled,
}: {
  control: Control<FieldValues>;
  attrIndex: number;
  attrName: string;
  disabled?: boolean;
}) {
  const { append, remove } = useFieldArray({
    control,
    name: `variationAttributes.${attrIndex}.values`,
  });

  const watchedValues = useWatch({
    control,
    name: `variationAttributes.${attrIndex}.values`,
  });

  const availableOptions = getOptionsForVariationType(attrName);

  const selectedValues = Array.isArray(watchedValues)
    ? watchedValues
        .map((v) => {
          if (typeof v === "string") return v;
          if (!v || typeof v !== "object") return "";
          const record = v as Record<string, unknown>;
          if (typeof record.value === "string") return record.value;
          if (typeof record["0"] === "string") return record["0"];
          return "";
        })
        .filter(Boolean)
    : [];

  const remainingOptions = availableOptions.filter(
    (opt) => !selectedValues.includes(opt.value)
  );

  const handleAddValue = (value: string) => {
    if (!value) return;
    append(value);
    toast.success(`${value} added to ${attrName}`);
  };

  const handleRemoveValue = (index: number) => {
    remove(index);
  };

  return (
    <div className="space-y-3">
      {!disabled && remainingOptions.length > 0 && (
        <div className="flex items-center gap-2">
          <Select onValueChange={handleAddValue}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder={`Add ${attrName} value`} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {remainingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {remainingOptions.length} available
          </span>
        </div>
      )}

      {selectedValues.length === 0 && (
        <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
          No {attrName.toLowerCase()} values added yet. Use the dropdown above to
          add values.
        </div>
      )}

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((value, index) => (
            <div
              key={`${value}-${index}`}
              className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm"
            >
              <span className="font-medium">{value}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveValue(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <FieldDescription className="text-xs">
        Backend will auto-generate SKUs for all combinations of selected values.
      </FieldDescription>
    </div>
  );
}

function ExistingVariants({
  control,
  product,
  disabled,
}: {
  control: Control<ProductFormValues>;
  product: Product;
  disabled?: boolean;
}) {
  const { fields } = useFieldArray<ProductFormValues, "variants">({
    control,
    name: "variants",
  });

  if (!product?.variants || product.variants.length === 0) {
    return null;
  }

  // Build stock lookup from stockProjection
  const stockLookup = new Map<string, number>();
  if (product.stockProjection?.variants) {
    for (const v of product.stockProjection.variants) {
      stockLookup.set(v.sku, v.quantity);
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <FieldLabel className="text-base font-medium">
            Generated Variants
          </FieldLabel>
          <FieldDescription>
            Edit price modifiers for specific variants. SKUs are auto-generated
            and read-only.
          </FieldDescription>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <div className="col-span-3">Variant (SKU)</div>
            <div className="col-span-3">Attributes</div>
            <div className="col-span-2">Price Mod (৳)</div>
            <div className="col-span-2 text-center">Stock</div>
            <div className="col-span-2 text-center">Status</div>
          </div>

          {fields.map((field, index) => {
            const variant = product.variants?.[index];
            if (!variant) return null;

            const attributesStr = Object.entries(variant.attributes || {})
              .map(([key, val]) => `${key}: ${val}`)
              .join(", ");

            // Get stock quantity from projection
            const stockQty = stockLookup.get(variant.sku);
            const hasStock = stockQty !== undefined;
            const isOutOfStock = hasStock && stockQty === 0;
            const isLowStock = hasStock && stockQty > 0 && stockQty <= 10;

            return (
              <div key={field.id} className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-3">
                  <div className="flex h-10 items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-xs font-mono truncate">
                    {variant.sku || "(auto-generated)"}
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="flex h-10 items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-xs truncate">
                    {attributesStr || "(none)"}
                  </div>
                </div>

                <Controller
                  control={control}
                  name={`variants.${index}.priceModifier`}
                  render={({ field: rhfField, fieldState }) => (
                    <Field className="col-span-2" data-invalid={fieldState.invalid}>
                      <InputGroup>
                        <InputGroupInput
                          {...rhfField}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          disabled={disabled}
                          onChange={(e) =>
                            rhfField.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </InputGroup>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <div className="col-span-2 flex items-center justify-center h-10">
                  {hasStock ? (
                    <span
                      className={`text-sm font-medium ${
                        isOutOfStock
                          ? "text-red-600"
                          : isLowStock
                          ? "text-yellow-600"
                          : ""
                      }`}
                    >
                      {stockQty}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>

                <div className="col-span-2 flex items-center justify-center h-10">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      variant.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {variant.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <FieldDescription className="text-xs">
          Price modifier adjusts from base price (e.g., +50 for Large size).
          Inactive variants are hidden but preserved for order history. Manage barcodes in the Barcode tab.
          Stock quantities are synced from inventory.
        </FieldDescription>
      </div>
    </Card>
  );
}
