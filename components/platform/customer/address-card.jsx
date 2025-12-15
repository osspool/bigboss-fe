"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Trash2, Edit, Truck } from "lucide-react";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getZoneName } from "@/lib/logistics-utils";

export function AddressCard({
  address,
  onEdit,
  onDelete,
  isUpdating = false,
  // For checkout page selection
  isSelectable = false,
  isSelected = false,
  onSelect,
  index,
  showAreaInfo = false,
  className
}) {
  const handleEdit = (e) => {
    e?.stopPropagation();
    onEdit?.(address);
  };

  const handleDelete = (e) => {
    e?.stopPropagation();
    onDelete?.(address._id);
  };

  const handleCardClick = () => {
    if (isSelectable && onSelect) {
      onSelect(index);
    }
  };

  // Get zone name from address zoneId
  const zoneName = address.zoneId ? getZoneName(address.zoneId) : null;

  // Support both old 'phone' and new 'recipientPhone' field
  const phoneNumber = address.recipientPhone || address.phone;

  // Address content component
  const AddressContent = () => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <h4 className="font-medium truncate">{address.label}</h4>
        {phoneNumber && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            • {phoneNumber}
          </span>
        )}
      </div>

      <div className="text-sm text-muted-foreground space-y-1 pl-6">
        {address.recipientName && (
          <p className="font-medium text-foreground">{address.recipientName}</p>
        )}
        <p className="leading-relaxed">
          {address.addressLine1}
          {address.addressLine2 && `, ${address.addressLine2}`}
        </p>
        <p>
          {[address.city, address.division, address.postalCode].filter(Boolean).join(', ')}
        </p>
        {phoneNumber && (
          <p className="sm:hidden">Phone: {phoneNumber}</p>
        )}

        {/* Area and delivery zone info */}
        {showAreaInfo && address.areaId && (
          <div className="flex items-center gap-2 pt-2 mt-2 border-t">
            <Truck className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{address.areaName}</span>
            {zoneName && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {zoneName}
              </Badge>
            )}
          </div>
        )}

        {/* Warning if no area selected */}
        {showAreaInfo && !address.areaId && (
          <p className="text-destructive text-xs pt-2 mt-2 border-t">
            No delivery area set - please edit to add one
          </p>
        )}
      </div>
    </div>
  );

  // Action buttons component
  const ActionButtons = () => (
    <div className={cn(
      "flex gap-1 flex-shrink-0",
      !isSelectable && "opacity-0 group-hover:opacity-100 transition-opacity"
    )}>
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          disabled={isUpdating}
          type="button"
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit address</span>
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isUpdating}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete address</span>
        </Button>
      )}
    </div>
  );

  // Base card styles
  const baseCardStyles = "border rounded-lg p-4 transition-colors";

  // Selectable card (for checkout)
  if (isSelectable) {
    return (
      <div
        className={cn(
          baseCardStyles,
          "cursor-pointer hover:bg-success/5 hover:border-success",
          isSelected && "border-success bg-success/5 ring-1 ring-success/20",
          className
        )}
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-3">
          <RadioGroupItem
            value={index?.toString()}
            id={`address-${index}`}
            className="mt-1 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <Label
              htmlFor={`address-${index}`}
              className="cursor-pointer block"
            >
              <div className="flex justify-between items-start gap-3">
                <AddressContent />
                <ActionButtons />
              </div>
            </Label>
          </div>
        </div>
      </div>
    );
  }

  // Regular card (for profile)
  return (
    <div className={cn(
      baseCardStyles,
      "hover:bg-accent/50 group",
      className
    )}>
      <div className="flex justify-between items-start gap-3">
        <AddressContent />
        <ActionButtons />
      </div>
    </div>
  );
}
