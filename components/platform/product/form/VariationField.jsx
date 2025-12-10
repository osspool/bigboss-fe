"use client";
import { useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const getOptionsForVariationType = (variationType) => {
  if (variationType === "Size") {
    return SIZES.map(size => ({ value: size, label: size }));
  }
  if (variationType === "Color") {
    return COLORS.map(color => ({ value: color.name, label: color.name }));
  }
  return [];
};

/**
 * VariationField Component
 *
 * Manages product variations with predefined types (Size, Color).
 * Users can dynamically add specific options they need.
 */
export function VariationField({
  control,
  disabled = false,
}) {
  if (!control) {
    console.error("VariationField: control prop is required");
    return null;
  }

  const {
    fields: variations,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "variations",
  });

  // Get already selected variation types
  const selectedTypes = variations.map((v) => v.name);

  // Filter available variations to exclude already selected ones
  const availableToAdd = AVAILABLE_VARIATIONS.filter(
    (av) => !selectedTypes.includes(av.value)
  );

  const handleAddVariation = (variationType) => {
    if (variations.length >= 2) {
      toast.error("Maximum 2 variations allowed");
      return;
    }

    append({
      name: variationType,
      options: [],
    });

    toast.success(`${variationType} variation added`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <FieldLabel className="text-base font-medium">Product Variations</FieldLabel>
          <FieldDescription>
            Add Size and Color variations with different pricing and stock levels.
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
                Add {variation.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {variations.length === 0 && (
        <div className="text-sm text-muted-foreground p-6 border border-dashed rounded-lg text-center">
          <p className="mb-2">No variations added.</p>
          <p className="text-xs">Click &quot;Add Size&quot; or &quot;Add Color&quot; above to add variants.</p>
        </div>
      )}

      <div className="space-y-4">
        {variations.map((field, variationIndex) => (
          <Card key={field.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold uppercase tracking-wide">
                    {field.name}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({field.options?.length || 0} options)
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(variationIndex)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>

              <VariationOptions
                control={control}
                variationIndex={variationIndex}
                variationName={field.name}
                disabled={disabled}
              />
            </div>
          </Card>
        ))}
      </div>

      {variations.length > 0 && variations.length < 2 && !disabled && (
        <p className="text-xs text-muted-foreground">
          You can add {2 - variations.length} more variation(s).
        </p>
      )}
    </div>
  );
}

/**
 * VariationOptions Component
 *
 * Manages the options within a single variation.
 * Users can add specific options they need using a select dropdown.
 */
function VariationOptions({ control, variationIndex, variationName, disabled }) {
  const {
    fields: options,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `variations.${variationIndex}.options`,
  });

  // Get available options for this variation type
  const availableOptions = getOptionsForVariationType(variationName);

  // Get already selected option values
  const selectedValues = options.map(opt => opt.value).filter(Boolean);

  // Filter out already selected options
  const remainingOptions = availableOptions.filter(
    opt => !selectedValues.includes(opt.value)
  );

  const handleAddOption = (optionValue) => {
    if (!optionValue) return;

    append({
      value: optionValue,
      priceModifier: 0,
      quantity: 0,
      images: []
    });
  };

  return (
    <div className="space-y-3">
      {/* Add Option Select */}
      {!disabled && remainingOptions.length > 0 && (
        <div className="flex items-center gap-2">
          <Select onValueChange={handleAddOption}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder={`Add ${variationName} option`} />
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

      {/* No options message */}
      {options.length === 0 && (
        <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
          No {variationName.toLowerCase()} options added yet. Use the dropdown above to add options.
        </div>
      )}

      {/* Options List */}
      {options.length > 0 && (
        <>
          {/* Header */}
          <div className="grid grid-cols-12 gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <div className="col-span-4">{variationName} Option</div>
            <div className="col-span-3">Price Modifier (৳)</div>
            <div className="col-span-4">Stock Quantity</div>
            <div className="col-span-1"></div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {options.map((option, optionIndex) => (
              <div key={option.id} className="grid grid-cols-12 gap-3 items-start">
                {/* Option Value (Read-only display) */}
                <div className="col-span-4">
                  <div className="flex h-10 items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-medium">
                    {option.value || "(empty)"}
                  </div>
                </div>

                {/* Price Modifier Input */}
                <Controller
                  control={control}
                  name={`variations.${variationIndex}.options.${optionIndex}.priceModifier`}
                  render={({ field: rhfField, fieldState }) => (
                    <Field className="col-span-3" data-invalid={fieldState.invalid}>
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

                {/* Quantity Input */}
                <Controller
                  control={control}
                  name={`variations.${variationIndex}.options.${optionIndex}.quantity`}
                  render={({ field: rhfField, fieldState }) => (
                    <Field className="col-span-4" data-invalid={fieldState.invalid}>
                      <InputGroup>
                        <InputGroupInput
                          {...rhfField}
                          type="number"
                          placeholder="0"
                          disabled={disabled}
                          onChange={(e) =>
                            rhfField.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </InputGroup>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                {/* Remove Button */}
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="col-span-1 h-10"
                    onClick={() => remove(optionIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <FieldDescription className="text-xs">
            Price modifier adjusts from base price (e.g., +50 for Large, +100 for Premium color).
          </FieldDescription>
        </>
      )}
    </div>
  );
}
