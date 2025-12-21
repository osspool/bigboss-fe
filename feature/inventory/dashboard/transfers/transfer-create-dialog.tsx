"use client";

import { useMemo, useState, useCallback } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useBranch } from "@/contexts/BranchContext";
import { useTransferActions } from "@/hooks/query/useTransfers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { ScanAddControls } from "@/feature/inventory/ui/ScanAddControls";
import { LineItemsTable } from "@/feature/inventory/ui/LineItemsTable";
import { useScannedLineItems } from "@/feature/inventory/ui/useScannedLineItems";
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
  const [receiverBranchId, setReceiverBranchId] = useState("");
  const [remarks, setRemarks] = useState("");

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
    setReceiverBranchId("");
    setRemarks("");
    scan.reset();
  }, [scan]);

  const handleSubmit = useCallback(async () => {
    if (!selectedBranch?._id) {
      toast.error("Select a branch");
      return;
    }
    if (selectedBranch.role !== "head_office") {
      toast.error("Transfers can be created from head office");
      return;
    }
    if (!receiverBranchId) {
      toast.error("Select receiver branch");
      return;
    }
    if (scan.items.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    await create({
      receiverBranchId: receiverBranchId,
      senderBranchId: selectedBranch._id,
      documentType: "delivery_challan",
      items: scan.items.map((i) => ({
        productId: i.productId,
        variantSku: i.variantSku,
        quantity: i.quantity,
      })),
      remarks: remarks.trim() || undefined,
    });

    setOpen(false);
    reset();
  }, [selectedBranch, receiverBranchId, scan.items, remarks, create, reset]);

  const footer = (
    <div className="flex gap-2 w-full">
      <Button variant="outline" type="button" className="flex-1" onClick={() => setOpen(false)} disabled={isCreating}>
        Cancel
      </Button>
      <Button type="button" className="flex-1" onClick={handleSubmit} disabled={isCreating || disabled}>
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>From (Sender)</Label>
              <Input value={selectedBranch ? `${selectedBranch.name} (${selectedBranch.code})` : ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>To (Receiver)</Label>
              <Select value={receiverBranchId} onValueChange={setReceiverBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {receiverOptions.map((b) => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.name} ({b.code})
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
            <Label>Remarks (optional)</Label>
            <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} />
          </div>
        </div>
      </SheetWrapper>
    </>
  );
}
