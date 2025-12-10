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

/**
 * AddressFormDialog Component
 * Dialog for adding or editing delivery addresses
 */
export function AddressFormDialog({ open, onOpenChange, address = null, onSave }) {
  const isEdit = !!address;

  const [formData, setFormData] = useState({
    label: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Bangladesh",
    phone: "",
    recipientName: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (address) {
      setFormData({
        label: address.label || "",
        addressLine1: address.addressLine1 || "",
        addressLine2: address.addressLine2 || "",
        city: address.city || "",
        state: address.state || "",
        postalCode: address.postalCode || "",
        country: address.country || "Bangladesh",
        phone: address.phone || "",
        recipientName: address.recipientName || "",
        isDefault: address.isDefault || false,
      });
    } else {
      // Reset form for new address
      setFormData({
        label: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Bangladesh",
        phone: "",
        recipientName: "",
        isDefault: false,
      });
    }
    setErrors({});
  }, [address, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.label?.trim()) newErrors.label = "Label is required";
    if (!formData.addressLine1?.trim()) newErrors.addressLine1 = "Address is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.postalCode?.trim()) newErrors.postalCode = "Postal code is required";
    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^01[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number (01XXXXXXXXX)";
    }
    if (!formData.recipientName?.trim()) newErrors.recipientName = "Recipient name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to parent forms

    if (!validate()) return;

    onSave?.(formData);
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
              <Label htmlFor="recipientName">
                Recipient Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Full name"
              />
              {errors.recipientName && (
                <p className="text-xs text-destructive">{errors.recipientName}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
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
                placeholder="Street address"
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
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="text-xs text-destructive">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State / Division</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state (optional)"
              />
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode">
                Postal Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Enter postal code"
              />
              {errors.postalCode && (
                <p className="text-xs text-destructive">{errors.postalCode}</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Bangladesh"
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
