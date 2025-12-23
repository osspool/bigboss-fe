"use client";

import { Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { Transfer } from "@/types/inventory.types";

type BranchRef = Transfer["senderBranch"];

function getBranchInfo(branch: BranchRef, fallback: string) {
  if (branch && typeof branch === "object") {
    return { id: branch._id, name: branch.name || fallback, code: branch.code || "" };
  }
  return { id: typeof branch === "string" ? branch : undefined, name: fallback, code: "" };
}

function StatusBadge({ status }: { status?: Transfer["status"] | string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-muted text-foreground border-border" },
    approved: { label: "Approved", className: "bg-primary/10 text-primary border-primary/20" },
    dispatched: { label: "Dispatched", className: "bg-warning/10 text-warning border-warning/20" },
    in_transit: { label: "In Transit", className: "bg-warning/10 text-warning border-warning/20" },
    received: { label: "Received", className: "bg-success/10 text-success border-success/20" },
    partial_received: { label: "Partial", className: "bg-success/10 text-success border-success/20" },
    cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const cfg = (status && map[status]) || { label: status || "-", className: "" };
  return (
    <Badge variant="outline" className={cn("font-normal", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

export interface TransferColumnsActions {
  currentBranchId: string | undefined;
  onApprove: (t: Transfer) => void;
  onDispatch: (t: Transfer) => void;
  onMarkInTransit: (t: Transfer) => void;
  onReceive: (t: Transfer) => void;
  onCancel: (t: Transfer) => void;
  onPrint: (t: Transfer) => void;
}

export function transferColumns({
  currentBranchId,
  onApprove,
  onDispatch,
  onMarkInTransit,
  onReceive,
  onCancel,
  onPrint,
}: TransferColumnsActions): ColumnDef<Transfer, unknown>[] {
  return [
  {
    id: "challanNumber",
    header: "Transfer No.",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.challanNumber || "-"}</span>
    ),
  },
  {
    id: "route",
    header: "Route",
    cell: ({ row }) => {
      const t = row.original;
      const sender = getBranchInfo(t.senderBranch, "Sender");
      const receiver = getBranchInfo(t.receiverBranch, "Receiver");
      const senderLabel = sender.code || sender.name;
      const receiverLabel = receiver.code || receiver.name;
      return (
        <div className="text-sm">
          <div className="font-medium">
            {senderLabel} → {receiverLabel}
          </div>
          <div className="text-xs text-muted-foreground">{t.documentType?.replace(/_/g, " ")}</div>
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
      const t = row.original;
      // Use API-provided totals if available, otherwise compute
      const itemCount = t.totalItems ?? t.items?.length ?? 0;
      const qty = t.totalQuantity ?? t.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) ?? 0;
      return (
        <div className="text-sm">
          <div className="font-medium">{itemCount}</div>
          <div className="text-xs text-muted-foreground">Qty {qty}</div>
        </div>
      );
    },
  },
  {
    id: "totalValue",
    header: "Value",
    cell: ({ row }) => {
      const value = row.original.totalValue;
      if (value == null) return <span className="text-muted-foreground">-</span>;
      return (
        <span className="font-mono text-sm">
          ৳{value.toLocaleString()}
        </span>
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
      const t = row.original;
      const sender = getBranchInfo(t.senderBranch, "Sender");
      const receiver = getBranchInfo(t.receiverBranch, "Receiver");
      const isSender = currentBranchId && sender.id === currentBranchId;
      const isReceiver = currentBranchId && receiver.id === currentBranchId;

      // Use API virtual fields if available, otherwise fallback to local computation
      const canApprove = t.canApprove ?? (isSender && t.status === "draft");
      const canDispatch = t.canDispatch ?? (isSender && t.status === "approved");
      const canInTransit = isSender && t.status === "dispatched";
      const canReceive = t.canReceive ?? (isReceiver && (t.status === "in_transit" || t.status === "dispatched"));
      const canCancel = t.canCancel ?? (isSender && (t.status === "draft" || t.status === "approved"));

      return (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => onPrint(t)} title="Print Challan">
            <Printer className="h-4 w-4" />
          </Button>
          {canApprove && (
            <Button size="sm" variant="outline" onClick={() => onApprove(t)}>
              Approve
            </Button>
          )}
          {canDispatch && (
            <Button size="sm" variant="outline" onClick={() => onDispatch(t)}>
              Dispatch
            </Button>
          )}
          {canInTransit && (
            <Button size="sm" variant="outline" onClick={() => onMarkInTransit(t)}>
              In-Transit
            </Button>
          )}
          {canReceive && (
            <Button size="sm" variant="outline" onClick={() => onReceive(t)}>
              Receive
            </Button>
          )}
          {canCancel && (
            <Button size="sm" variant="destructive" onClick={() => onCancel(t)}>
              Cancel
            </Button>
          )}
        </div>
      );
    },
  },
];
}
