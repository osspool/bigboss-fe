"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ScanAddControlsProps {
  code: string;
  onCodeChange: (next: string) => void;
  quantity: string;
  onQuantityChange: (next: string) => void;
  onAdd: () => void | Promise<void>;
  isAdding?: boolean;
  codeLabel?: string;
  quantityLabel?: string;
  addLabel?: string;
}

export function ScanAddControls({
  code,
  onCodeChange,
  quantity,
  onQuantityChange,
  onAdd,
  isAdding,
  codeLabel = "Scan barcode / SKU",
  quantityLabel = "Qty",
  addLabel = "Add Item",
}: ScanAddControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
      <div className="md:col-span-2 space-y-2">
        <Label>{codeLabel}</Label>
        <Input
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="e.g. BARCODE123 or SKU"
        />
      </div>
      <div className="space-y-2">
        <Label>{quantityLabel}</Label>
        <Input
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          inputMode="numeric"
        />
      </div>
      <div className="md:col-span-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onAdd}
          disabled={!!isAdding || !code.trim()}
        >
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
