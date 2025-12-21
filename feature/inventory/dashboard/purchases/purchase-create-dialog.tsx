"use client";

import { useState, useCallback } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBranch } from "@/contexts/BranchContext";
import { usePurchaseActions } from "@/hooks/query/usePurchases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { ScanAddControls } from "@/feature/inventory/ui/ScanAddControls";
import { LineItemsTable } from "@/feature/inventory/ui/LineItemsTable";
import { useScannedLineItems } from "@/feature/inventory/ui/useScannedLineItems";

interface PurchaseCreateDialogProps {
  token: string;
  disabled?: boolean;
}

type PurchaseLineItem = {
  key: string;
  productId: string;
  productName: string;
  variantSku?: string;
  variantLabel?: string;
  quantity: number;
  costPrice?: string;
  subtitle?: string;
};

export function PurchaseCreateDialog({ token, disabled }: PurchaseCreateDialogProps) {
  const { selectedBranch } = useBranch();
  const { record, isRecording } = usePurchaseActions(token);

  const [open, setOpen] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [notes, setNotes] = useState("");

  const scan = useScannedLineItems<PurchaseLineItem>({
    token,
    branchId: selectedBranch?._id,
    buildItem: (lookup, qty) => {
      const productId = lookup?.product?._id;
      const variantSku = lookup?.variantSku || undefined;
      return {
        key: `${productId}:${variantSku || ""}`,
        productId,
        productName: lookup?.product?.name || "Unknown Product",
        variantSku,
        variantLabel: lookup?.matchedVariant?.attributes ? undefined : variantSku,
        quantity: qty,
        costPrice: "",
        subtitle: variantSku ? `Variant: ${variantSku}` : "Simple",
      };
    },
  });

  const reset = useCallback(() => {
    setSupplierName("");
    setPurchaseOrderNumber("");
    setNotes("");
    scan.reset();
  }, [scan]);

  const handleSubmit = useCallback(async () => {
    if (!selectedBranch?._id) {
      toast.error("Select a branch");
      return;
    }
    if (selectedBranch.role !== "head_office") {
      toast.error("Purchases can be recorded at head office only");
      return;
    }
    if (scan.items.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    await record({
      branchId: selectedBranch._id,
      supplierName: supplierName.trim() || undefined,
      purchaseOrderNumber: purchaseOrderNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      items: scan.items.map((i) => ({
        productId: i.productId,
        variantSku: i.variantSku,
        quantity: i.quantity,
        costPrice: i.costPrice ? Number(i.costPrice) : undefined,
      })),
    });

    setOpen(false);
    reset();
  }, [selectedBranch, scan.items, supplierName, purchaseOrderNumber, notes, record, reset]);

  const footer = (
    <div className="flex gap-2 w-full">
      <Button variant="outline" type="button" className="flex-1" onClick={() => setOpen(false)} disabled={isRecording}>
        Cancel
      </Button>
      <Button type="button" className="flex-1" onClick={handleSubmit} disabled={isRecording || disabled}>
        {isRecording ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save Purchase
      </Button>
    </div>
  );

  return (
    <>
      <Button disabled={disabled} size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Record Purchase
      </Button>

      <SheetWrapper
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
        title="Record Purchase (Head Office)"
        description="Supplier purchase stock entry (adds head-office stock)"
        size="lg"
        footer={footer}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Supplier (optional)</Label>
              <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>PO Number (optional)</Label>
              <Input value={purchaseOrderNumber} onChange={(e) => setPurchaseOrderNumber(e.target.value)} />
            </div>
          </div>

          <ScanAddControls
            code={scan.code}
            onCodeChange={scan.setCode}
            quantity={scan.quantity}
            onQuantityChange={scan.setQuantity}
            onAdd={scan.add}
            isAdding={scan.isLookingUp}
          />

          <LineItemsTable
            items={scan.items}
            onQuantityChange={scan.updateQuantityAt}
            onRemove={scan.removeAt}
            renderRight={(item, idx) => (
              <Input
                className="w-28"
                inputMode="decimal"
                placeholder="Cost"
                value={item.costPrice ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  scan.setItems((prev) => {
                    const next = [...prev];
                    const current = next[idx];
                    if (!current) return prev;
                    next[idx] = { ...current, costPrice: v };
                    return next;
                  });
                }}
              />
            )}
          />

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>
      </SheetWrapper>
    </>
  );
}
