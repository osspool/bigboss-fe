"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Plus, MapPin } from "lucide-react";
import { useCurrentCustomer, useCustomerActions } from "@/hooks/query";
import { AddressCard } from "@/components/platform/customer/address-card";
import { AddressFormDialog } from "./AddressFormDialog";

/**
 * AddressSection Component
 *
 * Manages delivery address selection for checkout.
 * Addresses now include areaId/areaName for shipping calculation.
 */
export function AddressSection({
  token,
  selectedAddress,
  onAddressChange,
}) {
  const { data: customer, isLoading, refetch } = useCurrentCustomer(token);
  const { update: updateCustomer } = useCustomerActions();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // useCurrentCustomer returns the customer directly (already unwrapped from response.data)
  const addresses = customer?.addresses || [];

  // Auto-select default address or first address
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const defaultIndex = addresses.findIndex(addr => addr.isDefault);
      const indexToSelect = defaultIndex !== -1 ? defaultIndex : 0;
      setSelectedIndex(indexToSelect);
      handleAddressSelect(indexToSelect);
    }
  }, [addresses, selectedAddress]);

  const handleAddressSelect = useCallback((index) => {
    if (index < 0 || index >= addresses.length) return;

    const address = addresses[index];
    setSelectedIndex(index);
    onAddressChange?.(address);
  }, [addresses, onAddressChange]);

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    try {
      const updatedAddresses = addresses.filter(addr => addr._id !== addressId);
      await updateCustomer({
        token,
        id: customer._id,
        data: { addresses: updatedAddresses }
      });
      refetch();
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  const handleSaveAddress = async (addressData) => {
    try {
      let updatedAddresses;

      if (editingAddress) {
        updatedAddresses = addresses.map(addr =>
          addr._id === editingAddress._id ? { ...addr, ...addressData } : addr
        );
      } else {
        updatedAddresses = [...addresses, addressData];
      }

      if (addressData.isDefault) {
        const newAddressIndex = editingAddress
          ? updatedAddresses.findIndex(addr => addr._id === editingAddress._id)
          : updatedAddresses.length - 1;
        updatedAddresses = updatedAddresses.map((addr, idx) => ({
          ...addr,
          isDefault: idx === newAddressIndex
        }));
      }

      await updateCustomer({
        token,
        id: customer._id,
        data: { addresses: updatedAddresses }
      });

      setShowAddressForm(false);
      setEditingAddress(null);
      refetch();
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-muted rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Delivery Address
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddNewAddress}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            No saved addresses yet. Add one to continue.
          </p>
          <Button type="button" onClick={handleAddNewAddress}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <RadioGroup
          value={selectedIndex?.toString()}
          onValueChange={(value) => handleAddressSelect(parseInt(value))}
        >
          <div className="grid grid-cols-1 gap-4">
            {addresses.map((address, index) => (
              <AddressCard
                key={address._id || index}
                address={address}
                index={index}
                isSelectable={true}
                isSelected={selectedIndex === index}
                onSelect={() => handleAddressSelect(index)}
                onEdit={() => handleEditAddress(address)}
                onDelete={() => handleDeleteAddress(address._id)}
                showAreaInfo={true}
              />
            ))}
          </div>
        </RadioGroup>
      )}

      {showAddressForm && (
        <AddressFormDialog
          open={showAddressForm}
          onOpenChange={setShowAddressForm}
          address={editingAddress}
          onSave={handleSaveAddress}
        />
      )}
    </div>
  );
}
