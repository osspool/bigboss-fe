"use client";

import { useMemo, useState, useCallback } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBranch } from "@/contexts/BranchContext";
import { useStockRequestActions } from "@/hooks/query/useStockRequests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { ScanAddControls } from "@/feature/inventory/ui/ScanAddControls";
import { LineItemsTable } from "@/feature/inventory/ui/LineItemsTable";
import { useScannedLineItems } from "@/feature/inventory/ui/useScannedLineItems";
import type { StockRequestPriority } from "@/types/inventory.types";

interface RequestCreateDialogProps {
  token: string;
  disabled?: boolean;
}

export function RequestCreateDialog({ token, disabled }: RequestCreateDialogProps) {
  const { selectedBranch } = useBranch();
  const { create, isCreating } = useStockRequestActions(token);

  const [open, setOpen] = useState(false);
  const [priority, setPriority] = useState<StockRequestPriority>("normal");
  const [reason, setReason] = useState("");
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
    setPriority("normal");
    setReason("");
    scan.reset();
  }, [scan]);

  const handleSubmit = useCallback(async () => {
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
      branchId: selectedBranch._id,
      priority,
      notes: reason.trim() || undefined,
      items: scan.items.map((i) => ({
        productId: i.productId,
        variantSku: i.variantSku,
        quantity: i.quantity,
      })),
    });

    setOpen(false);
    reset();
  }, [selectedBranch, scan.items, priority, reason, create, reset]);

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
      <Button type="button" className="flex-1" onClick={handleSubmit} disabled={isCreating || disabled}>
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Requesting Branch</Label>
              <Input value={selectedBranch ? `${selectedBranch.name} (${selectedBranch.code})` : ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as StockRequestPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          />

          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
          </div>
        </div>
      </SheetWrapper>
    </>
  );
}
