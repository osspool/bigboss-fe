"use client";
import { useState } from "react";
import { useFieldArray, Controller, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MapPin, X, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaSelector } from "@/components/platform/checkout/AreaSelector";
import { getZoneName } from "@/lib/logistics-utils";

/**
 * AddressManager Component
 *
 * Manages an array of customer addresses with area selection.
 * Uses @classytic/bd-areas for area data.
 *
 * Address fields:
 * - label, recipientName, recipientPhone (required)
 * - addressLine1 (required), addressLine2
 * - areaId, areaName, zoneId, providerAreaIds (from AreaSelector)
 * - city, division, postalCode (auto-filled from area)
 * - country, isDefault
 */
export function AddressManager({ control, disabled = false }) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "addresses",
  });

  const watchedAddresses = useWatch({
    control,
    name: "addresses",
    defaultValue: [],
  });

  const [editingIndex, setEditingIndex] = useState(null);

  const defaultAddress = {
    label: "",
    recipientName: "",
    recipientPhone: "",
    addressLine1: "",
    addressLine2: "",
    division: "",
    city: "",
    postalCode: "",
    country: "Bangladesh",
    isDefault: false,
    // Area fields
    areaId: null,
    areaName: "",
    zoneId: null,
    providerAreaIds: null,
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
    const currentAddresses = watchedAddresses || [];
    currentAddresses.forEach((addr, i) => {
      if (i !== index && addr?.isDefault) {
        update(i, { ...addr, isDefault: false });
      }
    });
    if (currentAddresses[index]) {
      update(index, { ...currentAddresses[index], isDefault: true });
    }
  };

  const handleAreaChange = (index, areaSelection) => {
    const addr = watchedAddresses?.[index] || {};
    if (areaSelection) {
      update(index, {
        ...addr,
        areaId: areaSelection.areaId,
        areaName: areaSelection.areaName,
        zoneId: areaSelection.zoneId,
        providerAreaIds: areaSelection.providerAreaIds,
        division: areaSelection.division,
        city: areaSelection.city,
        postalCode: areaSelection.postalCode || addr.postalCode,
      });
    } else {
      update(index, {
        ...addr,
        areaId: null,
        areaName: "",
        zoneId: null,
        providerAreaIds: null,
      });
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
        {fields.map((field, index) => {
          const currentAddr = watchedAddresses?.[index] || {};
          const zoneName = currentAddr.zoneId ? getZoneName(currentAddr.zoneId) : null;
          const phoneNumber = currentAddr.recipientPhone || currentAddr.phone;

          return (
            <Card key={field.id} className={cn(editingIndex === index && "border-primary")}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {currentAddr.label || field.label || `Address ${index + 1}`}
                    {(currentAddr.isDefault || field.isDefault) && (
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
                    {/* Label */}
                    <div className="space-y-2">
                      <Label>Label *</Label>
                      <Controller
                        name={`addresses.${index}.label`}
                        control={control}
                        defaultValue=""
                        render={({ field: f }) => (
                          <Input
                            value={f.value ?? ""}
                            onChange={f.onChange}
                            placeholder="e.g., Home, Office"
                            disabled={disabled}
                          />
                        )}
                      />
                    </div>

                    {/* Recipient Name */}
                    <div className="space-y-2">
                      <Label>Recipient Name</Label>
                      <Controller
                        name={`addresses.${index}.recipientName`}
                        control={control}
                        defaultValue=""
                        render={({ field: f }) => (
                          <Input
                            value={f.value ?? ""}
                            onChange={f.onChange}
                            placeholder="Full name (optional)"
                            disabled={disabled}
                          />
                        )}
                      />
                    </div>

                    {/* Recipient Phone */}
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Controller
                        name={`addresses.${index}.recipientPhone`}
                        control={control}
                        defaultValue=""
                        render={({ field: f }) => (
                          <Input
                            value={f.value ?? ""}
                            onChange={f.onChange}
                            placeholder="01XXXXXXXXX"
                            disabled={disabled}
                          />
                        )}
                      />
                    </div>

                    {/* Address Line 1 */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address Line 1 *</Label>
                      <Controller
                        name={`addresses.${index}.addressLine1`}
                        control={control}
                        defaultValue=""
                        render={({ field: f }) => (
                          <Input
                            value={f.value ?? ""}
                            onChange={f.onChange}
                            placeholder="House/Road/Area details"
                            disabled={disabled}
                          />
                        )}
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address Line 2</Label>
                      <Controller
                        name={`addresses.${index}.addressLine2`}
                        control={control}
                        defaultValue=""
                        render={({ field: f }) => (
                          <Input
                            value={f.value ?? ""}
                            onChange={f.onChange}
                            placeholder="Apartment, floor, landmark (optional)"
                            disabled={disabled}
                          />
                        )}
                      />
                    </div>

                    {/* Delivery Area - Required */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Delivery Area *</Label>
                      <AreaSelector
                        value={currentAddr.areaId}
                        onChange={(selection) => handleAreaChange(index, selection)}
                        placeholder="Search and select delivery area..."
                        disabled={disabled}
                        showZoneBadge={true}
                      />
                      <p className="text-xs text-muted-foreground">
                        This determines delivery zone and charges
                      </p>
                    </div>

                    {/* Division & City (auto-filled from area) */}
                    {currentAddr.areaId && (
                      <>
                        <div className="space-y-2">
                          <Label>Division</Label>
                          <Input
                            value={currentAddr.division || ""}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>City / District</Label>
                          <Input
                            value={currentAddr.city || ""}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </>
                    )}

                    {/* Postal Code */}
                    <div className="space-y-2">
                      <Label>Postal Code</Label>
                      <Controller
                        name={`addresses.${index}.postalCode`}
                        control={control}
                        defaultValue=""
                        render={({ field: f }) => (
                          <Input
                            value={f.value ?? ""}
                            onChange={f.onChange}
                            placeholder="Enter postal code (optional)"
                            disabled={disabled}
                          />
                        )}
                      />
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Controller
                        name={`addresses.${index}.country`}
                        control={control}
                        defaultValue="Bangladesh"
                        render={({ field: f }) => (
                          <Input
                            value={f.value ?? "Bangladesh"}
                            onChange={f.onChange}
                            disabled
                            className="bg-muted"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Default checkbox */}
                  <div className="flex items-center space-x-2">
                    <Controller
                      name={`addresses.${index}.isDefault`}
                      control={control}
                      defaultValue={false}
                      render={({ field: f }) => (
                        <Checkbox
                          id={`addr-default-${index}`}
                          checked={f.value ?? false}
                          onCheckedChange={(checked) => {
                            f.onChange(checked);
                            if (checked) handleSetDefault(index);
                          }}
                          disabled={disabled}
                        />
                      )}
                    />
                    <Label htmlFor={`addr-default-${index}`} className="text-sm font-normal cursor-pointer">
                      Set as default address
                    </Label>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="text-sm text-muted-foreground">
                  {currentAddr.recipientName && (
                    <div className="font-medium text-foreground">{currentAddr.recipientName}</div>
                  )}
                  {currentAddr.addressLine1 && (
                    <div>
                      {currentAddr.addressLine1}
                      {currentAddr.addressLine2 && `, ${currentAddr.addressLine2}`}
                    </div>
                  )}
                  {(currentAddr.city || currentAddr.division || currentAddr.postalCode) && (
                    <div>
                      {[currentAddr.city, currentAddr.division, currentAddr.postalCode].filter(Boolean).join(", ")}
                    </div>
                  )}
                  {phoneNumber && (
                    <div className="mt-1">Phone: {phoneNumber}</div>
                  )}
                  {/* Area and zone info */}
                  {currentAddr.areaId && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                      <Truck className="h-3.5 w-3.5" />
                      <span className="font-medium text-foreground">{currentAddr.areaName}</span>
                      {zoneName && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {zoneName}
                        </Badge>
                      )}
                    </div>
                  )}
                  {!currentAddr.areaId && (
                    <div className="text-destructive text-xs mt-2 pt-2 border-t">
                      No delivery area set - please edit to add one
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
