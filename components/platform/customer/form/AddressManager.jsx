"use client";
import { useState } from "react";
import { useFieldArray, Controller, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AddressManager Component
 * Manages an array of addresses for a customer
 */
export function AddressManager({ control, disabled = false }) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "addresses",
  });

  // Watch current addresses values to get real-time data
  const watchedAddresses = useWatch({
    control,
    name: "addresses",
  });

  const [editingIndex, setEditingIndex] = useState(null);

  const defaultAddress = {
    label: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Bangladesh",
    phone: "",
    isDefault: false,
  };

  const handleAddAddress = () => {
    append(defaultAddress);
    setEditingIndex(fields.length);
  };

  const handleRemoveAddress = (index) => {
    remove(index);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleSetDefault = (index) => {
    // Get current form values (not initial values)
    const currentAddresses = watchedAddresses || [];

    // Update all addresses to remove default flag
    currentAddresses.forEach((addr, i) => {
      if (i !== index && addr?.isDefault) {
        update(i, { ...addr, isDefault: false });
      }
    });

    // Set the selected address as default using current values
    if (currentAddresses[index]) {
      update(index, { ...currentAddresses[index], isDefault: true });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Addresses
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddAddress}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
          No addresses added yet. Click "Add Address" to create one.
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id} className={cn(editingIndex === index && "border-primary")}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  {field.label || `Address ${index + 1}`}
                  {field.isDefault && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </CardTitle>
                <div className="flex gap-1">
                  {editingIndex === index ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingIndex(null)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingIndex(index)}
                      disabled={disabled}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAddress(index)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {editingIndex === index ? (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`addresses.${index}.label`}>Label *</Label>
                    <Controller
                      name={`addresses.${index}.label`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id={`addresses.${index}.label`}
                          placeholder="e.g., Home, Office"
                          disabled={disabled}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`addresses.${index}.phone`}>Phone *</Label>
                    <Controller
                      name={`addresses.${index}.phone`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id={`addresses.${index}.phone`}
                          placeholder="01XXXXXXXXX"
                          disabled={disabled}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`addresses.${index}.addressLine1`}>Address Line 1 *</Label>
                    <Controller
                      name={`addresses.${index}.addressLine1`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id={`addresses.${index}.addressLine1`}
                          placeholder="Enter address"
                          disabled={disabled}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`addresses.${index}.addressLine2`}>Address Line 2</Label>
                    <Controller
                      name={`addresses.${index}.addressLine2`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id={`addresses.${index}.addressLine2`}
                          placeholder="Apartment, suite, etc. (optional)"
                          disabled={disabled}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`addresses.${index}.city`}>City *</Label>
                    <Controller
                      name={`addresses.${index}.city`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id={`addresses.${index}.city`}
                          placeholder="Enter city"
                          disabled={disabled}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`addresses.${index}.state`}>State/Region</Label>
                    <Controller
                      name={`addresses.${index}.state`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id={`addresses.${index}.state`}
                          placeholder="Enter state (optional)"
                          disabled={disabled}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`addresses.${index}.postalCode`}>Postal Code *</Label>
                    <Controller
                      name={`addresses.${index}.postalCode`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id={`addresses.${index}.postalCode`}
                          placeholder="Enter postal code"
                          disabled={disabled}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`addresses.${index}.country`}>Country</Label>
                    <Controller
                      name={`addresses.${index}.country`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id={`addresses.${index}.country`}
                          placeholder="Bangladesh"
                          disabled={disabled}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name={`addresses.${index}.isDefault`}
                    control={control}
                    render={({ field: checkboxField }) => (
                      <Checkbox
                        id={`addresses.${index}.isDefault`}
                        checked={checkboxField.value}
                        onCheckedChange={(checked) => {
                          checkboxField.onChange(checked);
                          if (checked) handleSetDefault(index);
                        }}
                        disabled={disabled}
                      />
                    )}
                  />
                  <Label
                    htmlFor={`addresses.${index}.isDefault`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    Set as default address
                  </Label>
                </div>
              </CardContent>
            ) : (
              <CardContent className="text-sm text-muted-foreground">
                {field.addressLine1 && (
                  <div>
                    {field.addressLine1}
                    {field.addressLine2 && `, ${field.addressLine2}`}
                  </div>
                )}
                {(field.city || field.state || field.postalCode) && (
                  <div>
                    {[field.city, field.state, field.postalCode].filter(Boolean).join(", ")}
                  </div>
                )}
                {field.country && <div>{field.country}</div>}
                {field.phone && <div className="mt-1">📞 {field.phone}</div>}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
