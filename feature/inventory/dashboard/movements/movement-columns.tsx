"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StockMovement, StockMovementType } from "@/types/inventory.types";

export type MovementRow = StockMovement & { productName?: string };

// Movement type colors following API docs quantity sign convention
// Positive: purchase, return, transfer_in, initial
// Negative: sale, transfer_out, adjustment (can be either)
const typeColors: Record<StockMovementType, string> = {
  purchase: "bg-green-100 text-green-700 border-green-200",
  return: "bg-green-100 text-green-700 border-green-200",
  transfer_in: "bg-green-100 text-green-700 border-green-200",
  initial: "bg-blue-100 text-blue-700 border-blue-200",
  recount: "bg-blue-100 text-blue-700 border-blue-200",
  sale: "bg-red-100 text-red-700 border-red-200",
  transfer_out: "bg-amber-100 text-amber-700 border-amber-200",
  adjustment: "bg-gray-100 text-gray-700 border-gray-200",
};

export function movementColumns({
  onView,
}: {
  onView: (movement: MovementRow) => void;
}): ColumnDef<MovementRow>[] {
  return [
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant="outline" className={cn("capitalize", type && typeColors[type])}>
            {String(type || "-").replace(/_/g, " ")}
          </Badge>
        );
      },
    },
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original.product;
        const productName = row.original.productName
          || (typeof product === "object" && product?.name)
          || (typeof product === "string" ? product : "-");
        return (
          <div className="text-sm">
            <div className="font-medium">{productName}</div>
            {row.original.variantSku && (
              <div className="text-xs text-muted-foreground">SKU: {row.original.variantSku}</div>
            )}
          </div>
        );
      },
    },
    {
      id: "quantity",
      header: "Qty",
      cell: ({ row }) => {
        const qty = row.original.quantity;
        if (qty == null) return <span className="font-mono text-sm">-</span>;
        const isPositive = qty > 0;
        const isNegative = qty < 0;
        return (
          <span className={cn(
            "font-mono text-sm",
            isPositive && "text-green-600",
            isNegative && "text-red-600"
          )}>
            {isPositive ? "+" : ""}{qty}
          </span>
        );
      },
    },
    {
      id: "balanceAfter",
      header: "Balance",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.balanceAfter ?? "-"}</span>
      ),
    },
    {
      id: "reference",
      header: "Ref",
      cell: ({ row }) => {
        const ref = row.original.reference;
        if (!ref) return <span className="text-xs text-muted-foreground">-</span>;
        if (typeof ref === "string") {
          return <span className="text-xs text-muted-foreground">{ref}</span>;
        }
        return (
          <div className="text-xs">
            <div className="font-medium">{ref.model || "-"}</div>
            {ref.id && <div className="text-muted-foreground">{ref.id}</div>}
          </div>
        );
      },
    },
    {
      id: "createdAt",
      header: "Time",
      cell: ({ row }) => {
        const d = row.original.createdAt ? new Date(row.original.createdAt) : null;
        return <span className="text-xs text-muted-foreground">{d ? d.toLocaleString("en-GB") : "-"}</span>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => onView(row.original)}
            title="View movement"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
