"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Check, X, CreditCard, MoreHorizontal, Receipt, Package, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Purchase, PurchaseStatus, PurchasePaymentStatus } from "@/types";

// Status badge variants
const statusColors: Record<PurchaseStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  approved: "bg-blue-100 text-blue-700 border-blue-200",
  received: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const paymentColors: Record<PurchasePaymentStatus, string> = {
  unpaid: "bg-amber-100 text-amber-700 border-amber-200",
  partial: "bg-orange-100 text-orange-700 border-orange-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

interface PurchaseColumnsOptions {
  onView?: (purchase: Purchase) => void;
  onReceive?: (purchase: Purchase) => void;
  onPay?: (purchase: Purchase) => void;
  onCancel?: (purchase: Purchase) => void;
}

export function purchaseColumns({
  onView,
  onReceive,
  onPay,
  onCancel,
}: PurchaseColumnsOptions = {}): ColumnDef<Purchase>[] {
  return [
    {
      id: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.invoiceNumber || "-"}</div>
      ),
    },
    {
      id: "supplier",
      header: "Supplier",
      cell: ({ row }) => {
        const supplier = row.original.supplier;
        if (!supplier) return <span className="text-muted-foreground">-</span>;
        const name = typeof supplier === "object" ? supplier.name : supplier;
        const code = typeof supplier === "object" ? supplier.code : undefined;
        return (
          <div className="text-sm">
            <div className="font-medium">{name}</div>
            {code && <div className="text-xs text-muted-foreground">{code}</div>}
          </div>
        );
      },
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.items?.length || 0}</span>
      ),
    },
    {
      id: "grandTotal",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          ৳{(row.original.grandTotal || 0).toLocaleString()}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant="outline" className={`capitalize ${statusColors[status] || ""}`}>
            {status?.replace(/_/g, " ") || "-"}
          </Badge>
        );
      },
    },
    {
      id: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const status = row.original.paymentStatus;
        const due = row.original.dueAmount || 0;
        return (
          <div className="flex flex-col gap-0.5">
            <Badge variant="outline" className={`capitalize ${paymentColors[status] || ""}`}>
              {status?.replace(/_/g, " ") || "-"}
            </Badge>
            {due > 0 && (
              <span className="text-xs text-muted-foreground">
                Due: ৳{due.toLocaleString()}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const d = row.original.createdAt ? new Date(row.original.createdAt) : null;
        return (
          <span className="text-xs text-muted-foreground">
            {d ? d.toLocaleDateString("en-GB") : "-"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const purchase = row.original;
        const canReceive = purchase.status === "draft" || purchase.status === "approved";
        const canPay = purchase.status === "received" && purchase.paymentStatus !== "paid";
        const canCancel = purchase.status === "draft" || purchase.status === "approved";

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <>
                    <DropdownMenuItem onClick={() => onView(purchase)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {onReceive && canReceive && (
                  <DropdownMenuItem onClick={() => onReceive(purchase)}>
                    <Package className="mr-2 h-4 w-4" />
                    Receive Stock
                  </DropdownMenuItem>
                )}
                {onPay && canPay && (
                  <DropdownMenuItem onClick={() => onPay(purchase)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Record Payment
                  </DropdownMenuItem>
                )}
                {onCancel && canCancel && ((onReceive && canReceive) || (onPay && canPay)) && <DropdownMenuSeparator />}
                {onCancel && canCancel && (
                  <DropdownMenuItem
                    onClick={() => onCancel(purchase)}
                    className="text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
