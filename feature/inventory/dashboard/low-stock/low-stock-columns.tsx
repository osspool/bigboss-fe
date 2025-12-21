"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/constants";
import type { ColumnDef } from "@tanstack/react-table";
import type { LowStockItem } from "@/types/inventory.types";

function StockLevelBadge({ quantity, reorderPoint }: { quantity: number; reorderPoint: number }) {
  const percentage = (quantity / reorderPoint) * 100;
  const isOut = quantity === 0;
  const isCritical = percentage < 25;
  const isLow = percentage < 50;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-normal",
        isOut && "bg-destructive/10 text-destructive border-destructive/20",
        !isOut && isCritical && "bg-orange-500/10 text-orange-500 border-orange-500/20",
        !isOut && !isCritical && isLow && "bg-warning/10 text-warning border-warning/20"
      )}
    >
      {isOut ? "Out of Stock" : isCritical ? "Critical" : "Low Stock"}
    </Badge>
  );
}

export const lowStockColumns: ColumnDef<LowStockItem, unknown>[] = [
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{item.product?.name || "Unknown"}</span>
          {item.product?.sku && (
            <span className="text-xs text-muted-foreground">SKU: {item.product.sku}</span>
          )}
          {item.variantSku && (
            <span className="text-xs text-muted-foreground">Variant: {item.variantSku}</span>
          )}
        </div>
      );
    },
  },
  {
    id: "branch",
    header: "Branch",
    cell: ({ row }) => {
      const branch = row.original.branch;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{branch?.name || "-"}</span>
          {branch?.code && (
            <span className="text-xs text-muted-foreground">{branch.code}</span>
          )}
        </div>
      );
    },
  },
  {
    id: "stock",
    header: "Current Stock",
    cell: ({ row }) => {
      const { quantity, reorderPoint } = row.original;
      return (
        <div className="flex flex-col">
          <span className={cn("font-bold", quantity === 0 && "text-destructive")}>
            {quantity}
          </span>
          <span className="text-xs text-muted-foreground">
            Reorder at: {reorderPoint}
          </span>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const { quantity, reorderPoint } = row.original;
      return <StockLevelBadge quantity={quantity} reorderPoint={reorderPoint} />;
    },
  },
  {
    id: "needed",
    header: "Stock Needed",
    cell: ({ row }) => {
      const { quantity, reorderPoint } = row.original;
      const needed = Math.max(0, reorderPoint - quantity);
      return (
        <div className="flex flex-col">
          <span className="font-bold text-primary">{needed}</span>
          <span className="text-xs text-muted-foreground">units</span>
        </div>
      );
    },
  },
];
