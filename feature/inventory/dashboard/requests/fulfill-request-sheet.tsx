"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { cn } from "@/lib/utils";
import type { StockRequest, StockRequestItem } from "@/types/inventory.types";
import { useStockRequestActions } from "@/hooks/query/useStockRequests";

interface FulfillRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: StockRequest | null;
  token: string;
}

// Extended item type to match actual API response
interface ApiRequestItem extends StockRequestItem {
  product?: string;
  productName?: string;
  productSku?: string;
  variantAttributes?: Record<string, string>;
  quantityRequested?: number;
  quantityApproved?: number;
}

interface FulfillItem {
  productId: string;
  variantSku?: string;
  productName: string;
  variantLabel: string;
  quantityApproved: number;
  quantity: number;
  cartonNumber: string;
}

function getProductInfo(item: ApiRequestItem): {
  id: string;
  name: string;
  variantSku: string;
  variantLabel: string;
  quantityApproved: number;
} {
  const productId = item.product || (typeof item.productId === "string" ? item.productId : (item.productId as any)?._id) || "";
  const productName = item.productName || (item.productId as any)?.name || "Unknown Product";
  const quantityApproved = item.quantityApproved ?? item.approvedQuantity ?? item.quantity ?? 0;

  const variantLabel = item.variantAttributes
    ? Object.entries(item.variantAttributes)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")
    : item.variantSku || "";

  return {
    id: productId,
    name: productName,
    variantSku: item.variantSku || "",
    variantLabel,
    quantityApproved,
  };
}

function getBranchName(branch: StockRequest["requestingBranch"] | StockRequest["fulfillingBranch"]): string {
  if (!branch) return "-";
  if (typeof branch === "string") return branch;
  return branch.name || branch.code || "-";
}

export function FulfillRequestSheet({
  open,
  onOpenChange,
  request,
  token,
}: FulfillRequestSheetProps) {
  const actions = useStockRequestActions(token);
  const [fulfillItems, setFulfillItems] = useState<FulfillItem[]>([]);
  const [remarks, setRemarks] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");

  // Initialize fulfill items when request changes
  useEffect(() => {
    if (!request?.items) {
      setFulfillItems([]);
      return;
    }

    const items: FulfillItem[] = request.items.map((item) => {
      const info = getProductInfo(item as ApiRequestItem);
      return {
        productId: info.id,
        variantSku: info.variantSku || undefined,
        productName: info.name,
        variantLabel: info.variantLabel,
        quantityApproved: info.quantityApproved,
        quantity: info.quantityApproved, // Default to full approved quantity
        cartonNumber: "",
      };
    });

    setFulfillItems(items);
    setRemarks(`Fulfilling request ${request.requestNumber}`);
    setVehicleNumber("");
    setDriverName("");
    setDriverPhone("");
  }, [request]);

  const handleQuantityChange = useCallback((index: number, value: number) => {
    setFulfillItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: Math.max(0, Math.min(value, updated[index].quantityApproved)),
      };
      return updated;
    });
  }, []);

  const handleCartonChange = useCallback((index: number, value: string) => {
    setFulfillItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], cartonNumber: value };
      return updated;
    });
  }, []);

  // Apply same carton number to all items
  const applyCartonToAll = useCallback((cartonNumber: string) => {
    setFulfillItems((prev) => prev.map((item) => ({ ...item, cartonNumber })));
  }, []);

  // Get unique carton numbers for quick apply
  const uniqueCartons = useMemo(() => {
    const cartons = new Set<string>();
    fulfillItems.forEach((item) => {
      if (item.cartonNumber.trim()) {
        cartons.add(item.cartonNumber.trim());
      }
    });
    return Array.from(cartons);
  }, [fulfillItems]);

  const totalQuantity = useMemo(
    () => fulfillItems.reduce((sum, item) => sum + item.quantity, 0),
    [fulfillItems]
  );

  const hasCartons = useMemo(
    () => fulfillItems.some((item) => item.cartonNumber.trim().length > 0),
    [fulfillItems]
  );

  const cartonCount = useMemo(() => {
    const cartons = new Set<string>();
    fulfillItems.forEach((item) => {
      if (item.cartonNumber.trim()) {
        cartons.add(item.cartonNumber.trim());
      }
    });
    return cartons.size;
  }, [fulfillItems]);

  const handleFulfill = useCallback(async () => {
    if (!request) return;

    const items = fulfillItems
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        productId: item.productId,
        variantSku: item.variantSku,
        quantity: item.quantity,
        cartonNumber: item.cartonNumber.trim() || undefined,
      }));

    const transport =
      vehicleNumber.trim() || driverName.trim() || driverPhone.trim()
        ? {
            vehicleNumber: vehicleNumber.trim() || undefined,
            driverName: driverName.trim() || undefined,
            driverPhone: driverPhone.trim() || undefined,
          }
        : undefined;

    await actions.fulfill({
      id: request._id,
      remarks: remarks.trim() || undefined,
      items,
      transport,
    });

    onOpenChange(false);
  }, [request, fulfillItems, remarks, vehicleNumber, driverName, driverPhone, actions, onOpenChange]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setFulfillItems([]);
        setRemarks("");
        setVehicleNumber("");
        setDriverName("");
        setDriverPhone("");
      }
      onOpenChange(isOpen);
    },
    [onOpenChange]
  );

  if (!request) return null;

  const canFulfill = request.status === "approved";

  return (
    <SheetWrapper
      open={open}
      onOpenChange={handleOpenChange}
      title="Fulfill Request"
      description={`${request.requestNumber} → Creates Transfer (Challan)`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-lg font-semibold">{request.requestNumber}</span>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Approved
          </Badge>
          <span className="text-sm text-muted-foreground">
            → {getBranchName(request.requestingBranch)}
          </span>
        </div>

        {/* Items with Carton Assignment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items to Fulfill
            </h3>
            <div className="flex items-center gap-2">
              {hasCartons && (
                <Badge variant="secondary">{cartonCount} carton{cartonCount !== 1 ? "s" : ""}</Badge>
              )}
              <Badge variant="outline">{fulfillItems.length} items</Badge>
            </div>
          </div>

          {/* Quick Carton Apply */}
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Quick Apply:</Label>
            <Input
              placeholder="Enter carton # (e.g., C-01)"
              className="h-8 text-sm flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = (e.target as HTMLInputElement).value.trim();
                  if (value) {
                    applyCartonToAll(value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }
              }}
            />
            <span className="text-xs text-muted-foreground">Press Enter to apply to all</span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {fulfillItems.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    {item.variantLabel && (
                      <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Approved: <span className="font-mono font-semibold">{item.quantityApproved}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Qty:</Label>
                    <Input
                      type="number"
                      min={0}
                      max={item.quantityApproved}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 0)}
                      className="w-20 h-8 text-sm font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Carton:</Label>
                    <Input
                      placeholder="C-01"
                      value={item.cartonNumber}
                      onChange={(e) => handleCartonChange(idx, e.target.value)}
                      className="h-8 text-sm font-mono flex-1 min-w-[80px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carton Summary */}
          {uniqueCartons.length > 0 && (
            <div className="p-2 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Cartons in use:</div>
              <div className="flex flex-wrap gap-1">
                {uniqueCartons.map((carton) => (
                  <Badge key={carton} variant="outline" className="font-mono text-xs">
                    {carton}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Transport Details */}
        <div className="space-y-3 pt-3 border-t">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Transport Details (Optional)
          </h3>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Vehicle Number</Label>
              <Input
                placeholder="DHA-1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Driver Name</Label>
              <Input
                placeholder="Driver name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Driver Phone</Label>
              <Input
                placeholder="017XXXXXXXX"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="space-y-2">
          <Label className="text-sm">Remarks</Label>
          <Textarea
            placeholder="Add any notes for this fulfillment..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
          />
        </div>

        {/* Summary & Actions */}
        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Quantity to Fulfill:</span>
            <span className="font-semibold font-mono">{totalQuantity}</span>
          </div>

          {hasCartons && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cartons:</span>
              <span className="font-semibold">{cartonCount} carton{cartonCount !== 1 ? "s" : ""}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleFulfill}
              disabled={!canFulfill || actions.isFulfilling || totalQuantity === 0}
            >
              {actions.isFulfilling ? "Creating Transfer..." : "Fulfill & Create Challan"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This will create a transfer (challan) and carton labels can be printed from the Transfers page.
          </p>
        </div>
      </div>
    </SheetWrapper>
  );
}
