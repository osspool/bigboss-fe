"use client";

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { StockMovement } from "@/types/inventory.types";

type MovementRow = StockMovement & { productName?: string };

export const movementColumns: ColumnDef<MovementRow>[] = [
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
];
