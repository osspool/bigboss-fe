"use client";

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface BaseLineItem {
  key?: string;
  productName: string;
  variantLabel?: string;
  subtitle?: string;
  quantity: number;
}

export interface LineItemsTableProps<TItem extends BaseLineItem> {
  title?: string;
  items: TItem[];
  onQuantityChange: (index: number, nextQuantity: string) => void;
  onRemove: (index: number) => void;
  renderRight?: (item: TItem, index: number) => ReactNode;
}

export function LineItemsTable<TItem extends BaseLineItem>({
  title = "Items",
  items,
  onQuantityChange,
  onRemove,
  renderRight,
}: LineItemsTableProps<TItem>) {
  if (!items || items.length === 0) return null;

  return (
    <div className="border rounded-md">
      <div className="px-3 py-2 text-sm font-medium border-b">{title}</div>
      <div className="divide-y">
        {items.map((i, idx) => (
          <div key={i.key || idx} className="p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{i.productName}</div>
              <div className="text-xs text-muted-foreground">
                {i.subtitle || (i.variantLabel ? `Variant: ${i.variantLabel}` : "Simple")}
              </div>
            </div>

            <Input
              className="w-20"
              inputMode="numeric"
              value={String(i.quantity)}
              onChange={(e) => onQuantityChange(idx, e.target.value)}
            />

            {renderRight ? renderRight(i, idx) : null}

            <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(idx)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
