"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Loader2, PackageSearch, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBranch } from "@/contexts/BranchContext";
import { usePurchaseActions } from "@/hooks/query/usePurchases";
import { useSuppliers } from "@/hooks/query/useSuppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormGenerator } from "@/components/form/form-system";
import type { Supplier } from "@/types/supplier.types";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { useScannedLineItems } from "@/feature/inventory/ui/useScannedLineItems";
import { InventoryScanSection } from "@/feature/inventory/forms/inventory-scan-section";
import { createPurchaseFormSchema, type PurchaseFormValues } from "@/feature/inventory/forms/inventory-form-schemas";

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
  const { create, isCreating } = usePurchaseActions(token);

  const [open, setOpen] = useState(false);

  // Fetch suppliers for dropdown
  const { items: suppliers = [] } = useSuppliers(token, { isActive: true, limit: 100 });

  // Convert suppliers to options for combobox
  const supplierOptions = useMemo(
    () =>
      suppliers.map((s: Supplier) => ({
        value: s._id,
        label: s.name,
        description: s.code ? `${s.code} • ${s.type || "supplier"}` : s.type || "supplier",
      })),
    [suppliers]
  );

  // Create form schema with supplier options
  const schema = useMemo(
    () => createPurchaseFormSchema({ supplierOptions }),
    [supplierOptions]
  );

  const form = useForm<PurchaseFormValues>({
    defaultValues: {
      supplierId: "",
      purchaseOrderNumber: "",
      paymentTerms: "cash",
      creditDays: 0,
      autoApprove: false,
      autoReceive: true, // Default to auto-receive for quick entry
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
      supplierId: "",
      purchaseOrderNumber: "",
      paymentTerms: "cash",
      creditDays: 0,
      autoApprove: false,
      autoReceive: true,
      notes: "",
    });
    scan.reset();
  }, [form, scan]);

  const handleSubmit = useCallback(
    async (data: PurchaseFormValues) => {
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
      const invalidCost = scan.items.find((i) => !i.costPrice || Number(i.costPrice) <= 0);
      if (invalidCost) {
        toast.error(`Enter a valid cost price for "${invalidCost.productName}"`);
        return;
      }

      await create.mutateAsync({
        supplierId: data.supplierId || undefined,
        purchaseOrderNumber: data.purchaseOrderNumber?.trim() || undefined,
        paymentTerms: data.paymentTerms,
        creditDays: data.paymentTerms === "credit" ? data.creditDays : undefined,
        autoApprove: data.autoApprove,
        autoReceive: data.autoReceive,
        notes: data.notes?.trim() || undefined,
        items: scan.items.map((i) => ({
          productId: i.productId,
          variantSku: i.variantSku,
          quantity: i.quantity,
          costPrice: Number(i.costPrice),
        })),
      });

      setOpen(false);
      reset();
    },
    [selectedBranch, scan.items, create, reset]
  );

  const footer = (
    <div className="flex gap-2 w-full">
      <Button
        variant="outline"
        type="button"
        className="flex-1"
        onClick={() => setOpen(false)}
        disabled={isCreating}
      >
        Cancel
      </Button>
      <Button
        type="button"
        className="flex-1"
        onClick={form.handleSubmit(handleSubmit)}
        disabled={isCreating || disabled}
      >
        {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Create Purchase
      </Button>
    </div>
  );

  return (
    <>
      <Button disabled={disabled} size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Purchase
      </Button>

      <SheetWrapper
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
        title="Create Purchase (Head Office)"
        description="Create a new purchase invoice from supplier"
        size="lg"
        footer={footer}
      >
        <div className="space-y-5">
          <FormGenerator
            schema={schema}
            control={form.control}
            disabled={isCreating || disabled}
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
