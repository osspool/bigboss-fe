"use client";

import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StockRequest } from "@/types/inventory.types";

type BranchRef = StockRequest["requestingBranch"];

function getBranchInfo(branch: BranchRef, fallback: string) {
  if (branch && typeof branch === "object") {
    return { id: branch._id, name: branch.name || fallback, code: branch.code || "" };
  }
  return { id: typeof branch === "string" ? branch : undefined, name: fallback, code: "" };
}

function StatusBadge({ status }: { status?: StockRequest["status"] | string }) {
  const map = {
    pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20" },
    approved: { label: "Approved", className: "bg-primary/10 text-primary border-primary/20" },
    rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
    fulfilled: { label: "Fulfilled", className: "bg-success/10 text-success border-success/20" },
    partial_fulfilled: { label: "Partial", className: "bg-success/10 text-success border-success/20" },
    cancelled: { label: "Cancelled", className: "bg-muted text-foreground border-border" },
  };
  const cfg = map[(status as keyof typeof map) ?? ""] || { label: status || "-", className: "" };
  return (
    <Badge variant="outline" className={cn("font-normal", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

export function requestColumns({
  currentBranchId,
  isHeadOffice,
  onApprove,
  onReject,
  onFulfill,
  onCancel,
}: {
  currentBranchId?: string;
  isHeadOffice: boolean;
  onApprove: (r: StockRequest) => void | Promise<void>;
  onReject: (r: StockRequest) => void | Promise<void>;
  onFulfill: (r: StockRequest) => void | Promise<void>;
  onCancel: (r: StockRequest) => void | Promise<void>;
}): ColumnDef<StockRequest>[] {
  return [
  {
    id: "requestNumber",
    header: "Request No.",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.requestNumber || "-"}</span>
    ),
  },
  {
    id: "branch",
    header: "Requesting Branch",
    cell: ({ row }) => {
      const r = row.original;
      const branch = getBranchInfo(r.requestingBranch, "Branch");
      return (
        <div className="text-sm">
          <div className="font-medium">
            {branch.code || branch.name}
          </div>
          <div className="text-xs text-muted-foreground capitalize">{r.priority}</div>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items || [];
      const qty = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
      return (
        <div className="text-sm">
          <div className="font-medium">{items.length}</div>
          <div className="text-xs text-muted-foreground">Qty {qty}</div>
        </div>
      );
    },
  },
  {
    id: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const d = row.original.createdAt ? new Date(row.original.createdAt) : null;
      return <span className="text-sm text-muted-foreground">{d ? d.toLocaleString("en-GB") : "-"}</span>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const r = row.original;
      const branch = getBranchInfo(r.requestingBranch, "Branch");
      const isRequestingBranch = currentBranchId && branch.id === currentBranchId;
      const canApprove = isHeadOffice && r.status === "pending";
      const canReject = isHeadOffice && r.status === "pending";
      const canFulfill = isHeadOffice && r.status === "approved";
      const canCancel = !isHeadOffice && isRequestingBranch && r.status === "pending";

      return (
        <div className="flex justify-end gap-2">
          {canApprove && (
            <Button size="sm" variant="outline" onClick={() => onApprove(r)}>
              Approve
            </Button>
          )}
          {canReject && (
            <Button size="sm" variant="destructive" onClick={() => onReject(r)}>
              Reject
            </Button>
          )}
          {canFulfill && (
            <Button size="sm" variant="outline" onClick={() => onFulfill(r)}>
              Fulfill → Transfer
            </Button>
          )}
          {canCancel && (
            <Button size="sm" variant="destructive" onClick={() => onCancel(r)}>
              Cancel
            </Button>
          )}
        </div>
      );
    },
  },
];
}
