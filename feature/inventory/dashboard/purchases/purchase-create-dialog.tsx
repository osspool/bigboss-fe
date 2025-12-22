"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Loader2, PackageSearch, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBranch } from "@/contexts/BranchContext";
import { usePurchaseActions } from "@/hooks/query/usePurchases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormGenerator } from "@/components/form/form-system";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { useScannedLineItems } from "@/feature/inventory/ui/useScannedLineItems";
import { InventoryScanSection } from "@/feature/inventory/forms/inventory-scan-section";
import { createPurchaseFormSchema } from "@/feature/inventory/forms/inventory-form-schemas";

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

type PurchaseFormValues = {
  supplierName: string;
  purchaseOrderNumber: string;
  notes: string;
};

export function PurchaseCreateDialog({ token, disabled }: PurchaseCreateDialogProps) {
  const { selectedBranch } = useBranch();
  const { record, isRecording } = usePurchaseActions(token);

  const [open, setOpen] = useState(false);
  const form = useForm<PurchaseFormValues>({
    defaultValues: {
      supplierName: "",
      purchaseOrderNumber: "",
      notes: "",
    },
  });

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
    form.reset({
      supplierName: "",
      purchaseOrderNumber: "",
      notes: "",
    });
    scan.reset();
  }, [form, scan]);

  const handleSubmit = useCallback(async (data: PurchaseFormValues) => {
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
      supplierName: data.supplierName.trim() || undefined,
      purchaseOrderNumber: data.purchaseOrderNumber.trim() || undefined,
      notes: data.notes.trim() || undefined,
      items: scan.items.map((i) => ({
        productId: i.productId,
        variantSku: i.variantSku,
        quantity: i.quantity,
        costPrice: i.costPrice ? Number(i.costPrice) : undefined,
      })),
    });

    setOpen(false);
    reset();
  }, [selectedBranch, scan.items, record, reset]);

  const footer = (
    <div className="flex gap-2 w-full">
      <Button variant="outline" type="button" className="flex-1" onClick={() => setOpen(false)} disabled={isRecording}>
        Cancel
      </Button>
      <Button
        type="button"
        className="flex-1"
        onClick={form.handleSubmit(handleSubmit)}
        disabled={isRecording || disabled}
      >
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
        <div className="space-y-5">
          <FormGenerator
            schema={createPurchaseFormSchema()}
            control={form.control}
            disabled={isRecording || disabled}
          />

          <InventoryScanSection
            title="Scan & add items"
            icon={<PackageSearch className="h-4 w-4 text-muted-foreground" />}
            description="Scan barcode or SKU to add purchase items."
            scan={{
              code: scan.code,
              setCode: scan.setCode,
              quantity: scan.quantity,
              setQuantity: scan.setQuantity,
              add: scan.add,
              isLookingUp: scan.isLookingUp,
            }}
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
        </div>
      </SheetWrapper>
    </>
  );
}
