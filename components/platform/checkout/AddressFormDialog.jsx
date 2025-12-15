"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AreaSelector } from "./AreaSelector";

/**
 * AddressFormDialog Component
 *
 * Dialog for adding or editing customer addresses.
 * Includes delivery area selection with full area data (areaId, zoneId, providerAreaIds).
 *
 * Fields saved match CustomerAddress type:
 * - recipientName: Name of the recipient
 * - recipientPhone: Contact phone for delivery (required)
 * - label: Address label (Home, Office, etc.)
 * - addressLine1: Street address (required)
 * - addressLine2: Additional details
 * - areaId: Area internalId from @classytic/bd-areas (required)
 * - areaName: Area display name
 * - zoneId: Delivery zone (1-6) for pricing
 * - providerAreaIds: Provider-specific area IDs (redx, pathao)
 * - city: District name (auto-filled from area)
 * - division: Division name (auto-filled from area)
 * - postalCode: Postal code (auto-filled from area)
 * - country: Country (default: Bangladesh)
 * - isDefault: Whether this is the default address
 */
export function AddressFormDialog({ open, onOpenChange, address = null, onSave }) {
  const isEdit = !!address;

  const [formData, setFormData] = useState({
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
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label || "",
        recipientName: address.recipientName || "",
        // Support both old `phone` and new `recipientPhone` field
        recipientPhone: address.recipientPhone || address.phone || "",
        addressLine1: address.addressLine1 || "",
        addressLine2: address.addressLine2 || "",
        division: address.division || "",
        city: address.city || "",
        postalCode: address.postalCode || "",
        country: address.country || "Bangladesh",
        isDefault: address.isDefault || false,
        areaId: address.areaId || null,
        areaName: address.areaName || "",
        zoneId: address.zoneId || null,
        providerAreaIds: address.providerAreaIds || null,
      });
    } else {
      // Reset form for new address
      setFormData({
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
        areaId: null,
        areaName: "",
        zoneId: null,
        providerAreaIds: null,
      });
    }
    setErrors({});
  }, [address, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAreaChange = (areaSelection) => {
    if (areaSelection) {
      setFormData(prev => ({
        ...prev,
        areaId: areaSelection.areaId,
        areaName: areaSelection.areaName,
        zoneId: areaSelection.zoneId,
        providerAreaIds: areaSelection.providerAreaIds,
        // Auto-fill location from area selection
        division: areaSelection.division,
        city: areaSelection.city,
        postalCode: areaSelection.postalCode || prev.postalCode,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        areaId: null,
        areaName: "",
        zoneId: null,
        providerAreaIds: null,
      }));
    }
    if (errors.areaId) {
      setErrors(prev => ({ ...prev, areaId: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.label?.trim()) newErrors.label = "Label is required";
    if (!formData.addressLine1?.trim()) newErrors.addressLine1 = "Address is required";
    if (!formData.recipientPhone?.trim()) {
      newErrors.recipientPhone = "Phone is required";
    } else if (!/^01[0-9]{9}$/.test(formData.recipientPhone)) {
      newErrors.recipientPhone = "Invalid phone number (01XXXXXXXXX)";
    }
    if (!formData.areaId) newErrors.areaId = "Delivery area is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validate()) return;

    // Build address data matching CustomerAddress type
    const addressData = {
      label: formData.label,
      recipientName: formData.recipientName || undefined,
      recipientPhone: formData.recipientPhone,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2 || undefined,
      city: formData.city,
      division: formData.division,
      postalCode: formData.postalCode || undefined,
      country: formData.country,
      isDefault: formData.isDefault,
      // Area data (required for delivery)
      areaId: formData.areaId,
      areaName: formData.areaName,
      zoneId: formData.zoneId,
      providerAreaIds: formData.providerAreaIds,
    };

    onSave?.(addressData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Address" : "Add New Address"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update your delivery address" : "Add a new delivery address"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">
                Label <span className="text-destructive">*</span>
              </Label>
              <Input
                id="label"
                name="label"
                value={formData.label}
                onChange={handleChange}
                placeholder="e.g., Home, Office"
              />
              {errors.label && (
                <p className="text-xs text-destructive">{errors.label}</p>
              )}
            </div>

            {/* Recipient Name */}
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Full name (optional)"
              />
            </div>

            {/* Recipient Phone */}
            <div className="space-y-2">
              <Label htmlFor="recipientPhone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="recipientPhone"
                name="recipientPhone"
                value={formData.recipientPhone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
              />
              {errors.recipientPhone && (
                <p className="text-xs text-destructive">{errors.recipientPhone}</p>
              )}
            </div>

            {/* Address Line 1 */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine1">
                Address Line 1 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="House/Road/Area details"
              />
              {errors.addressLine1 && (
                <p className="text-xs text-destructive">{errors.addressLine1}</p>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Apartment, floor, landmark (optional)"
              />
            </div>

            {/* Delivery Area - Required for shipping */}
            <div className="space-y-2 md:col-span-2">
              <Label>
                Delivery Area <span className="text-destructive">*</span>
              </Label>
              <AreaSelector
                value={formData.areaId}
                onChange={handleAreaChange}
                placeholder="Search and select your delivery area..."
                showZoneBadge={true}
              />
              {errors.areaId && (
                <p className="text-xs text-destructive">{errors.areaId}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This determines your delivery zone and charges
              </p>
            </div>

            {/* Division & City (auto-filled from area, shown for reference) */}
            {formData.areaId && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="division">Division</Label>
                  <Input
                    id="division"
                    value={formData.division}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City / District</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </>
            )}

            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Enter postal code (optional)"
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Set as Default */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, isDefault: checked }))
              }
            />
            <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
              Set as default address
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update Address" : "Add Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
