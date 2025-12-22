"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StockMovement } from "@/types/inventory.types";

export type MovementRow = StockMovement & { productName?: string };

export function movementColumns({
  onView,
}: {
  onView: (movement: MovementRow) => void;
}): ColumnDef<MovementRow>[] {
  return [
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {String(row.original.type || "-").replace(/_/g, " ")}
        </Badge>
      ),
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
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.quantity ?? "-"}</span>
      ),
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
