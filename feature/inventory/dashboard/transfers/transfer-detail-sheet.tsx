"use client";

import { type ReactNode } from "react";
import { Truck, Package, User, Clock, MapPin, FileText, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SheetWrapper } from "@classytic/clarity";
import { formatPrice } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Transfer, TransferItem, TransferStatusHistoryEntry } from "@/types";

type BranchRef = Transfer["senderBranch"];

function getBranchInfo(branch: BranchRef) {
  if (branch && typeof branch === "object") {
    return { name: branch.name || "-", code: branch.code || "", id: branch._id };
  }
  return { name: "-", code: "", id: typeof branch === "string" ? branch : "" };
}

function getUserName(user: Transfer["createdBy"]) {
  if (user && typeof user === "object") {
    return user.name || "-";
  }
  return "-";
}

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMaybeNumber = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return value.toString();
};

function DetailRow({
  label,
  value,
  monospace = false,
  className,
}: {
  label: string;
  value?: ReactNode;
  monospace?: boolean;
  className?: string;
}) {
  const hasValue = value !== null && value !== undefined && value !== "";
  const displayValue = hasValue ? value : "-";

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className={cn("text-sm font-semibold", monospace && "font-mono")}>{displayValue}</div>
    </div>
  );
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-foreground border-border" },
  approved: { label: "Approved", className: "bg-primary/10 text-primary border-primary/20" },
  dispatched: { label: "Dispatched", className: "bg-warning/10 text-warning border-warning/20" },
  in_transit: { label: "In Transit", className: "bg-warning/10 text-warning border-warning/20" },
  received: { label: "Received", className: "bg-success/10 text-success border-success/20" },
  partial_received: { label: "Partial", className: "bg-success/10 text-success border-success/20" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

function StatusBadge({ status }: { status?: string }) {
  const cfg = statusConfig[status || ""] || { label: status || "-", className: "" };
  return (
    <Badge variant="outline" className={cn("font-normal", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

function StatusTimeline({ history }: { history?: TransferStatusHistoryEntry[] }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="space-y-2">
      {history.map((entry, idx) => {
        const cfg = statusConfig[entry.status] || { label: entry.status, className: "" };
        const isLast = idx === history.length - 1;
        const actorName = entry.actor && typeof entry.actor === "object" ? entry.actor.name : null;

        return (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-3 h-3 rounded-full border-2",
                isLast ? "bg-primary border-primary" : "bg-muted border-border"
              )} />
              {!isLast && <div className="w-0.5 h-full bg-border flex-1 min-h-[20px]" />}
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn("text-xs", cfg.className)}>
                  {cfg.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(entry.timestamp)}
                </span>
              </div>
              {entry.notes && (
                <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
              )}
              {actorName && (
                <p className="text-xs text-muted-foreground mt-0.5">by {actorName}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ItemCard({ item, hasCartons }: { item: TransferItem; hasCartons: boolean }) {
  const name = item.productName || "Item";
  const variantLabel = item.variantAttributes
    ? Object.entries(item.variantAttributes).map(([k, v]) => `${k}: ${v}`).join(", ")
    : item.variantSku || "";

  const received = item.quantityReceived ?? 0;
  const pending = (item.quantity || 0) - received;

  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{name}</p>
          {variantLabel && (
            <p className="text-xs text-muted-foreground">{variantLabel}</p>
          )}
          {item.productSku && (
            <p className="text-xs text-muted-foreground font-mono">{item.productSku}</p>
          )}
        </div>
        {hasCartons && item.cartonNumber && (
          <Badge variant="outline" className="font-mono text-xs shrink-0">
            {item.cartonNumber}
          </Badge>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
        <div>
          <span className="text-muted-foreground">Qty:</span>{" "}
          <span className="font-mono font-semibold">{item.quantity}</span>
        </div>
        {received > 0 && (
          <div>
            <span className="text-muted-foreground">Received:</span>{" "}
            <span className="font-mono font-semibold text-success">{received}</span>
          </div>
        )}
        {pending > 0 && received > 0 && (
          <div>
            <span className="text-muted-foreground">Pending:</span>{" "}
            <span className="font-mono font-semibold text-warning">{pending}</span>
          </div>
        )}
        {item.costPrice && (
          <div>
            <span className="text-muted-foreground">Cost:</span>{" "}
            <span className="font-mono">{formatPrice(item.costPrice)}</span>
          </div>
        )}
      </div>

      {item.notes && (
        <p className="mt-2 text-xs text-muted-foreground">{item.notes}</p>
      )}
    </div>
  );
}

interface TransferDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transfer | null;
}

export function TransferDetailSheet({
  open,
  onOpenChange,
  transfer,
}: TransferDetailSheetProps) {
  if (!transfer) {
    return (
      <SheetWrapper
        open={open}
        onOpenChange={onOpenChange}
        title="Transfer Details"
        description="Challan information"
        size="lg"
      >
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Select a transfer to view details.
        </div>
      </SheetWrapper>
    );
  }

  const sender = getBranchInfo(transfer.senderBranch);
  const receiver = getBranchInfo(transfer.receiverBranch);
  const items = transfer.items || [];
  const hasCartons = items.some((item) => item.cartonNumber && item.cartonNumber.trim().length > 0);
  const totalQty = transfer.totalQuantity ?? items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalReceived = items.reduce((sum, i) => sum + (i.quantityReceived || 0), 0);

  // Count unique cartons
  const cartonSet = new Set<string>();
  items.forEach((item) => {
    if (item.cartonNumber?.trim()) {
      cartonSet.add(item.cartonNumber.trim());
    }
  });
  const cartonCount = cartonSet.size;

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Transfer Details"
      description={transfer.challanNumber || "Challan"}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Truck className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-mono text-lg font-semibold">{transfer.challanNumber}</p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={transfer.status} />
                <Badge variant="outline" className="capitalize text-xs">
                  {transfer.documentType?.replace(/_/g, " ") || "delivery challan"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Route Section */}
        <div className="rounded-lg border border-border/60 p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Route</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">From</p>
              <p className="font-semibold">{sender.name}</p>
              {sender.code && <p className="text-xs text-muted-foreground font-mono">{sender.code}</p>}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">To</p>
              <p className="font-semibold">{receiver.name}</p>
              {receiver.code && <p className="text-xs text-muted-foreground font-mono">{receiver.code}</p>}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DetailRow label="Total Items" value={transfer.totalItems ?? items.length} monospace />
          <DetailRow label="Total Quantity" value={totalQty} monospace />
          <DetailRow label="Received" value={totalReceived > 0 ? totalReceived : "-"} monospace />
          <DetailRow label="Total Value" value={transfer.totalValue ? formatPrice(transfer.totalValue) : "-"} />
        </div>

        {/* Carton Info */}
        {hasCartons && (
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">{cartonCount}</span> carton{cartonCount !== 1 ? "s" : ""} assigned
            </span>
            <div className="flex flex-wrap gap-1 ml-2">
              {Array.from(cartonSet).map((carton) => (
                <Badge key={carton} variant="outline" className="font-mono text-xs">
                  {carton}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Transport Details */}
        {transfer.transport && (transfer.transport.vehicleNumber || transfer.transport.driverName) && (
          <div className="rounded-lg border border-border/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Transport Details</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {transfer.transport.vehicleNumber && (
                <DetailRow label="Vehicle" value={transfer.transport.vehicleNumber} monospace />
              )}
              {transfer.transport.driverName && (
                <DetailRow label="Driver" value={transfer.transport.driverName} />
              )}
              {transfer.transport.driverPhone && (
                <DetailRow label="Phone" value={transfer.transport.driverPhone} monospace />
              )}
              {transfer.transport.estimatedArrival && (
                <DetailRow label="ETA" value={formatDateTime(transfer.transport.estimatedArrival)} />
              )}
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Items
            </h3>
            <Badge variant="outline">{items.length} item{items.length !== 1 ? "s" : ""}</Badge>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {items.map((item, idx) => (
              <ItemCard key={item._id || idx} item={item} hasCartons={hasCartons} />
            ))}
          </div>
        </div>

        {/* Remarks */}
        {transfer.remarks && (
          <div className="rounded-lg border border-border/60 p-3 bg-muted/20">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Remarks</p>
            <p className="text-sm">{transfer.remarks}</p>
          </div>
        )}

        {/* Audit Info */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailRow
            label="Created By"
            value={
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {getUserName(transfer.createdBy)}
              </span>
            }
          />
          <DetailRow label="Created" value={formatDateTime(transfer.createdAt)} />
          <DetailRow label="Updated" value={formatDateTime(transfer.updatedAt)} />
          {transfer.approvedBy && (
            <DetailRow label="Approved By" value={getUserName(transfer.approvedBy)} />
          )}
          {transfer.approvedAt && (
            <DetailRow label="Approved At" value={formatDateTime(transfer.approvedAt)} />
          )}
          {transfer.dispatchedBy && (
            <DetailRow label="Dispatched By" value={getUserName(transfer.dispatchedBy)} />
          )}
          {transfer.dispatchedAt && (
            <DetailRow label="Dispatched At" value={formatDateTime(transfer.dispatchedAt)} />
          )}
          {transfer.receivedBy && (
            <DetailRow label="Received By" value={getUserName(transfer.receivedBy)} />
          )}
          {transfer.receivedAt && (
            <DetailRow label="Received At" value={formatDateTime(transfer.receivedAt)} />
          )}
        </div>

        {/* Status Timeline */}
        {transfer.statusHistory && transfer.statusHistory.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Status History
            </h3>
            <div className="rounded-lg border border-border/60 p-4">
              <StatusTimeline history={transfer.statusHistory} />
            </div>
          </div>
        )}
      </div>
    </SheetWrapper>
  );
}
