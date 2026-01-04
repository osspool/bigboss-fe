"use client";

import { useState, useMemo } from "react";
import {
  Package,
  Store,
  MapPin,
  Loader2,
  AlertCircle,
  Truck,
  Scale,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  usePickupStores,
  useLogisticsActions,
} from "@/hooks/query";
import { formatPrice } from "@/lib/constants";
import { calculateDefaultCodAmount, getCodStatusInfo } from "@/lib/commerce-utils";
import type { Order } from "@/types";
import type { PickupStore, LogisticsProvider } from "@/types";

// ==================== Props ====================

interface CreateShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  order: Order;
  onSuccess?: () => void;
}

// ==================== Provider Options ====================

const PROVIDER_OPTIONS: { value: LogisticsProvider; label: string }[] = [
  { value: "redx", label: "RedX" },
  { value: "pathao", label: "Pathao" },
  { value: "steadfast", label: "Steadfast" },
  { value: "paperfly", label: "Paperfly" },
  { value: "sundarban", label: "Sundarban Courier" },
  { value: "manual", label: "Manual Entry" },
];

// ==================== Main Component ====================

export function CreateShipmentDialog({
  open,
  onOpenChange,
  token,
  order,
  onSuccess,
}: CreateShipmentDialogProps) {
  // Form state
  const [provider, setProvider] = useState<LogisticsProvider>("redx");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [weight, setWeight] = useState<string>("500");
  const [instructions, setInstructions] = useState<string>("");

  // COD amount (calculated based on payment type)
  const defaultCodAmount = useMemo(() => calculateDefaultCodAmount(order), [order]);
  const codStatusInfo = useMemo(() => getCodStatusInfo(order), [order]);
  const [codAmount, setCodAmount] = useState<string>(defaultCodAmount.toString());

  // Manual entry fields
  const [manualTracking, setManualTracking] = useState<string>("");
  const [manualTrackingUrl, setManualTrackingUrl] = useState<string>("");

  const isManualMode = provider === "manual";

  // Fetch pickup stores for selected provider
  const {
    data: pickupStores = [],
    isLoading: isLoadingStores,
    error: storesError,
  } = usePickupStores(token, isManualMode ? undefined : provider, {
    enabled: open && !isManualMode,
  });

  // Logistics actions
  const { createShipment, isCreatingShipment } = useLogisticsActions(token);

  // Delivery address info
  const deliveryAddress = order.deliveryAddress;
  const hasAreaInfo = !!deliveryAddress?.areaId;

  // Get provider-specific area ID if available
  const providerAreaId = useMemo(() => {
    if (!deliveryAddress?.providerAreaIds) return undefined;
    const providerKey = provider as keyof typeof deliveryAddress.providerAreaIds;
    return deliveryAddress.providerAreaIds[providerKey];
  }, [deliveryAddress, provider]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (isManualMode) {
        // Manual mode: Just record tracking info without provider API
        await createShipment({
          orderId: order._id,
          data: {
            provider: "manual",
            trackingNumber: manualTracking,
            trackingUrl: manualTrackingUrl || undefined,
          },
        });
        onSuccess?.();
        onOpenChange(false);
        return;
      }

      // Provider API mode: Create shipment via logistics provider (e.g., RedX)
      await createShipment({
        orderId: order._id,
        data: {
          provider,
          useProviderApi: true,
          pickupStoreId: selectedStoreId ? parseInt(selectedStoreId) : undefined,
          weight: weight ? parseInt(weight) : 500,
          instructions: instructions || undefined,
        },
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create shipment:", error);
    }
  };

  const isValid = isManualMode
    ? !!manualTracking
    : !!selectedStoreId || pickupStores.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Shipment</DialogTitle>
          <DialogDescription>
            Request courier pickup for this order
          </DialogDescription>
        </DialogHeader>
      <div className="space-y-6 py-4">
        {/* Delivery Address Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Delivery Address
          </h4>

          {deliveryAddress ? (
            <div className="space-y-3">
              {/* Recipient Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Recipient Name</span>
                  <p className="font-medium">
                    {deliveryAddress.recipientName || order.customerName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Phone</span>
                  <p className="font-medium">
                    {deliveryAddress.recipientPhone || "—"}
                  </p>
                </div>
              </div>

              {/* Address Lines */}
              <div className="text-sm">
                <span className="text-xs text-muted-foreground">Address</span>
                <p className="font-medium">
                  {deliveryAddress.addressLine1 || "—"}
                </p>
                {deliveryAddress.addressLine2 && (
                  <p className="font-medium">{deliveryAddress.addressLine2}</p>
                )}
              </div>

              {/* Area & Location Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {deliveryAddress.areaName && (
                  <div>
                    <span className="text-xs text-muted-foreground">Area</span>
                    <p className="font-medium">{deliveryAddress.areaName}</p>
                    {deliveryAddress.areaId && (
                      <span className="text-xs text-muted-foreground">
                        ID: {deliveryAddress.areaId}
                      </span>
                    )}
                  </div>
                )}
                {deliveryAddress.zoneId && (
                  <div>
                    <span className="text-xs text-muted-foreground">Zone</span>
                    <Badge variant="outline" className="mt-1">
                      Zone {deliveryAddress.zoneId}
                    </Badge>
                  </div>
                )}
              </div>

              {/* City, Division, Postal */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                {deliveryAddress.city && (
                  <div>
                    <span className="text-xs text-muted-foreground">City</span>
                    <p className="font-medium">{deliveryAddress.city}</p>
                  </div>
                )}
                {deliveryAddress.division && (
                  <div>
                    <span className="text-xs text-muted-foreground">Division</span>
                    <p className="font-medium">{deliveryAddress.division}</p>
                  </div>
                )}
                {deliveryAddress.postalCode && (
                  <div>
                    <span className="text-xs text-muted-foreground">Postal Code</span>
                    <p className="font-medium">{deliveryAddress.postalCode}</p>
                  </div>
                )}
              </div>

              {/* COD Amount - Editable */}
              <div className="pt-3 border-t border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cod-amount" className="text-sm font-medium">
                      {codStatusInfo.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {codStatusInfo.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">৳</span>
                    <Input
                      id="cod-amount"
                      type="number"
                      value={codAmount}
                      onChange={(e) => setCodAmount(e.target.value)}
                      className="w-28 text-right font-bold"
                      min={0}
                      max={order.totalAmount}
                    />
                  </div>
                </div>
                {order.currentPayment?.method && order.currentPayment.method !== "cash" && (
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="capitalize">
                      {order.currentPayment.method}
                    </Badge>
                    <Badge
                      variant={order.currentPayment.status === "verified" ? "default" : "secondary"}
                      className={`capitalize ${order.currentPayment.status === "verified" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}`}
                    >
                      {order.currentPayment.status}
                    </Badge>
                    {parseInt(codAmount) === 0 && order.currentPayment.status !== "verified" && (
                      <span className="text-warning">⚠️ Payment not verified</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-2">
              No delivery address found for this order.
            </div>
          )}
        </div>

        {/* Area Warning */}
        {!hasAreaInfo && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-warning">Missing Area Information</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                This order doesn&apos;t have area data. Delivery charges may not be
                accurate. Consider updating the delivery address with proper
                area selection.
              </p>
            </div>
          </div>
        )}

        {/* Provider Selection */}
        <div className="space-y-2">
          <Label>Logistics Provider</Label>
          <Select
            value={provider}
            onValueChange={(v: string) => {
              setProvider(v as LogisticsProvider);
              setSelectedStoreId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {PROVIDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* API Mode - Pickup Store Selection */}
        {!isManualMode && (
          <>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Pickup Store
              </Label>
              {isLoadingStores ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ) : storesError ? (
                <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg">
                  Failed to load pickup stores. Please try again.
                </div>
              ) : pickupStores.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                  No pickup stores configured for {provider}. Using default
                  store.
                </div>
              ) : (
                <Select
                  value={selectedStoreId}
                  onValueChange={setSelectedStoreId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup location" />
                  </SelectTrigger>
                  <SelectContent>
                    {pickupStores.map((store: PickupStore) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{store.name}</span>
                          {store.areaName && (
                            <span className="text-xs text-muted-foreground">
                              {store.areaName}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Selected Store Info */}
            {selectedStoreId && pickupStores.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-3 text-sm">
                {(() => {
                  const store = pickupStores.find(
                    (s: PickupStore) => s.id.toString() === selectedStoreId
                  );
                  if (!store) return null;
                  return (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{store.name}</p>
                        {store.address && (
                          <p className="text-muted-foreground text-xs">
                            {store.address}
                          </p>
                        )}
                        {store.phone && (
                          <p className="text-muted-foreground text-xs">
                            {store.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Parcel Weight */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Parcel Weight (grams)
              </Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="500"
                min={1}
              />
            </div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <Label>Special Instructions (Optional)</Label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., Handle with care, fragile items..."
                rows={2}
              />
            </div>
          </>
        )}

        {/* Manual Mode - Tracking Entry */}
        {isManualMode && (
          <>
            <div className="space-y-2">
              <Label>Tracking Number *</Label>
              <Input
                value={manualTracking}
                onChange={(e) => setManualTracking(e.target.value)}
                placeholder="e.g., REDX123456789"
              />
            </div>

            <div className="space-y-2">
              <Label>Tracking URL (Optional)</Label>
              <Input
                value={manualTrackingUrl}
                onChange={(e) => setManualTrackingUrl(e.target.value)}
                placeholder="https://track.example.com/..."
              />
            </div>
          </>
        )}
      </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreatingShipment}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isCreatingShipment}
          >
            {isCreatingShipment ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Create Shipment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
