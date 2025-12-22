"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, PackageSearch, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBranch } from "@/contexts/BranchContext";
import { useStockRequestActions } from "@/hooks/query/useStockRequests";
import { Button } from "@/components/ui/button";
import { FormGenerator } from "@/components/form/form-system";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { useScannedLineItems } from "@/feature/inventory/ui/useScannedLineItems";
import { InventoryScanSection } from "@/feature/inventory/forms/inventory-scan-section";
import { createRequestFormSchema, type RequestFormValues } from "@/feature/inventory/forms/inventory-form-schemas";

interface RequestCreateDialogProps {
  token: string;
  disabled?: boolean;
}

export function RequestCreateDialog({ token, disabled }: RequestCreateDialogProps) {
  const { selectedBranch } = useBranch();
  const { create, isCreating } = useStockRequestActions(token);

  const [open, setOpen] = useState(false);
  const requestingBranchLabel = selectedBranch ? `${selectedBranch.name} (${selectedBranch.code})` : "";
  const form = useForm<RequestFormValues>({
    defaultValues: {
      requestingBranchLabel,
      priority: "normal",
      reason: "",
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
        subtitle: `${variantSku ? `Variant: ${variantSku}` : "Simple"} • Current stock: ${lookup?.quantity ?? "-"}`,
      };
    },
  });

  const reset = useCallback(() => {
    form.reset({
      requestingBranchLabel,
      priority: "normal",
      reason: "",
    });
    scan.reset();
  }, [form, scan, requestingBranchLabel]);

  useEffect(() => {
    form.setValue("requestingBranchLabel", requestingBranchLabel);
  }, [form, requestingBranchLabel]);

  const handleSubmit = useCallback(async (data: RequestFormValues) => {
    if (!selectedBranch?._id) {
      toast.error("Select a branch");
      return;
    }
    if (selectedBranch.role === "head_office") {
      toast.error("Use transfers from head office (requests are for sub-branches)");
      return;
    }
    if (scan.items.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    await create({
      requestingBranchId: selectedBranch._id,
      priority: data.priority,
      reason: data.reason.trim() || undefined,
      items: scan.items.map((i) => ({
        productId: i.productId,
        variantSku: i.variantSku,
        quantity: i.quantity,
      })),
    });

    setOpen(false);
    reset();
  }, [selectedBranch, scan.items, create, reset]);

  const priorityOptions = useMemo(
    () => [
      { value: "low", label: "Low" },
      { value: "normal", label: "Normal" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
    []
  );

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
        Create Request
      </Button>
    </div>
  );

  return (
    <>
      <Button disabled={disabled} size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Request
      </Button>

      <SheetWrapper
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
        title="Create Stock Request"
        description="Sub-branch → head office replenishment request"
        size="lg"
        footer={footer}
      >
        <div className="space-y-5">
          <FormGenerator<RequestFormValues>
            schema={createRequestFormSchema({ priorityOptions })}
            control={form.control}
            disabled={isCreating || disabled}
          />

          <InventoryScanSection
            title="Scan & add items"
            icon={<PackageSearch className="h-4 w-4 text-muted-foreground" />}
            description="Scan barcode or SKU to request items."
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
