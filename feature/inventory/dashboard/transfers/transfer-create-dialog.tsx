"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, PackageSearch, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBranch } from "@/contexts/BranchContext";
import { useTransferActions } from "@/hooks/query/useTransfers";
import { Button } from "@/components/ui/button";
import { FormGenerator, type InferSchemaValues } from "@/components/form/form-system";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { useScannedLineItems } from "@/feature/inventory/ui/useScannedLineItems";
import { InventoryScanSection } from "@/feature/inventory/forms/inventory-scan-section";
import { createTransferFormSchema } from "@/feature/inventory/forms/inventory-form-schemas";
import type { Branch } from "@/types/branch.types";

interface TransferCreateDialogProps {
  token: string;
  disabled?: boolean;
}

export function TransferCreateDialog({ token, disabled }: TransferCreateDialogProps) {
  const { selectedBranch, branches } = useBranch();
  const { create, isCreating } = useTransferActions(token);

  const receiverOptions = useMemo(() => {
    if (!selectedBranch) return [];
    return (branches || []).filter((b: Branch) => b._id !== selectedBranch._id);
  }, [branches, selectedBranch]);

  const [open, setOpen] = useState(false);
  const senderLabel = selectedBranch ? `${selectedBranch.name} (${selectedBranch.code})` : "";
  const schema = useMemo(
    () =>
      createTransferFormSchema({
        receiverOptions: receiverOptions.map((b) => ({
          value: b._id,
          label: `${b.name} (${b.code})`,
        })),
      }),
    [receiverOptions]
  );
  type TransferFormValues = InferSchemaValues<typeof schema>;

  const form = useForm<TransferFormValues>({
    defaultValues: {
      senderLabel,
      receiverBranchId: "",
      remarks: "",
    },
  });

  const scan = useScannedLineItems({
    token,
    branchId: selectedBranch?._id,
    buildItem: (lookup, qty) => {
      const productId = lookup?.product?._id;
      const variantSku = lookup?.variantSku || undefined;
      return {
        key: `${productId}:${variantSku || ""}`,
        productId,
        productName: lookup?.product?.name,
        variantSku,
        variantLabel: lookup?.matchedVariant?.attributes ? undefined : variantSku,
        quantity: qty,
        subtitle: `${variantSku ? `Variant: ${variantSku}` : "Simple"} • Available: ${lookup?.quantity ?? "-"}`,
      };
    },
  });

  const reset = useCallback(() => {
    form.reset({
      senderLabel,
      receiverBranchId: "",
      remarks: "",
    });
    scan.reset();
  }, [form, scan, senderLabel]);

  useEffect(() => {
    form.setValue("senderLabel", senderLabel);
  }, [form, senderLabel]);

  const handleSubmit = useCallback(async (data: TransferFormValues) => {
    if (!selectedBranch?._id) {
      toast.error("Select a branch");
      return;
    }
    if (selectedBranch.role !== "head_office") {
      toast.error("Transfers can be created from head office");
      return;
    }
    if (!data.receiverBranchId) {
      toast.error("Select receiver branch");
      return;
    }
    if (scan.items.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    await create({
      receiverBranchId: data.receiverBranchId,
      senderBranchId: selectedBranch._id,
      documentType: "delivery_challan",
      items: scan.items.map((i) => ({
        productId: i.productId,
        variantSku: i.variantSku,
        quantity: i.quantity,
      })),
      remarks: data.remarks?.trim() || undefined,
    });

    setOpen(false);
    reset();
  }, [selectedBranch, scan.items, create, reset]);

  const footer = (
    <div className="flex gap-2 w-full">
      <Button variant="outline" type="button" className="flex-1" onClick={() => setOpen(false)} disabled={isCreating}>
        Cancel
      </Button>
      <Button
        type="button"
        className="flex-1"
        onClick={form.handleSubmit(handleSubmit)}
        disabled={isCreating || disabled}
      >
        {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Create Transfer
      </Button>
    </div>
  );

  return (
    <>
      <Button disabled={disabled} size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Transfer
      </Button>

      <SheetWrapper
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
        title="Create Transfer (Challan)"
        description="Head office → branch stock distribution"
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
            description="Scan barcode or SKU to add items quickly."
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
          />
        </div>
      </SheetWrapper>
    </>
  );
}
