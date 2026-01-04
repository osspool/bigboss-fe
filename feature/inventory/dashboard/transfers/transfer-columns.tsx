"use client";

import {
  MoreHorizontal,
  Eye,
  Printer,
  Package,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { Transfer } from "@/types";

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
  onView: (t: Transfer) => void;
  onApprove: (t: Transfer) => void;
  onDispatch: (t: Transfer) => void;
  onMarkInTransit: (t: Transfer) => void;
  onReceive: (t: Transfer) => void;
  onCancel: (t: Transfer) => void;
  onPrint: (t: Transfer) => void;
  onPrintCartonLabels: (t: Transfer) => void;
}

export function transferColumns({
  currentBranchId,
  onView,
  onApprove,
  onDispatch,
  onMarkInTransit,
  onReceive,
  onCancel,
  onPrint,
  onPrintCartonLabels,
}: TransferColumnsActions): ColumnDef<Transfer, unknown>[] {
  return [
    {
      id: "challanNumber",
      header: "Challan No.",
      cell: ({ row }) => {
        const t = row.original;
        return (
          <button
            onClick={() => onView(t)}
            className="font-mono text-xs hover:underline text-left"
          >
            {t.challanNumber || "-"}
          </button>
        );
      },
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
            <div className="text-xs text-muted-foreground capitalize">
              {t.documentType?.replace(/_/g, " ")}
            </div>
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
        const itemCount = t.totalItems ?? t.items?.length ?? 0;
        const qty = t.totalQuantity ?? t.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0) ?? 0;
        const hasCartons = t.items?.some((item) => item.cartonNumber?.trim());
        return (
          <div className="text-sm">
            <div className="font-medium flex items-center gap-1">
              {itemCount}
              {hasCartons && <Package className="h-3 w-3 text-muted-foreground" />}
            </div>
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
        if (!d) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="text-sm text-muted-foreground">
            <div>{d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
            <div className="text-xs">{d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        );
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
        const hasCartons = t.items?.some((item) => item.cartonNumber?.trim());

        const hasActions = canApprove || canDispatch || canInTransit || canReceive || canCancel;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* View Action */}
                <DropdownMenuItem onClick={() => onView(t)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>

                {/* Print Actions */}
                <DropdownMenuItem onClick={() => onPrint(t)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Challan
                </DropdownMenuItem>
                {hasCartons && (
                  <DropdownMenuItem onClick={() => onPrintCartonLabels(t)}>
                    <Package className="mr-2 h-4 w-4" />
                    Print Carton Labels
                  </DropdownMenuItem>
                )}

                {/* State Transition Actions */}
                {hasActions && <DropdownMenuSeparator />}

                {canApprove && (
                  <DropdownMenuItem onClick={() => onApprove(t)}>
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    Approve
                  </DropdownMenuItem>
                )}
                {canDispatch && (
                  <DropdownMenuItem onClick={() => onDispatch(t)}>
                    <Truck className="mr-2 h-4 w-4 text-warning" />
                    Dispatch
                  </DropdownMenuItem>
                )}
                {canInTransit && (
                  <DropdownMenuItem onClick={() => onMarkInTransit(t)}>
                    <Truck className="mr-2 h-4 w-4 text-warning" />
                    Mark In-Transit
                  </DropdownMenuItem>
                )}
                {canReceive && (
                  <DropdownMenuItem onClick={() => onReceive(t)}>
                    <PackageCheck className="mr-2 h-4 w-4 text-success" />
                    Receive
                  </DropdownMenuItem>
                )}

                {/* Cancel Action */}
                {canCancel && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onCancel(t)}
                      className="text-destructive focus:text-destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Transfer
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
