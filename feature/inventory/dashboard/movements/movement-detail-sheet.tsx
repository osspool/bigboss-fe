"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/constants";
import type { StockMovement } from "@/types/inventory.types";

type MovementDetail = StockMovement & { productName?: string };

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("en-GB");
};

const formatMaybeNumber = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return value.toString();
};

const formatPriceMaybe = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return formatPrice(value);
};

const getEntityLabel = (
  entity: string | { _id?: string; name?: string; code?: string } | undefined,
  fallback: string
) => {
  if (entity && typeof entity === "object") {
    return {
      id: entity._id,
      name: entity.name || fallback,
      code: entity.code,
    };
  }

  return {
    id: typeof entity === "string" ? entity : undefined,
    name: fallback,
    code: undefined,
  };
};

const getActorInfo = (
  actor: string | { _id?: string; name?: string; email?: string } | undefined
) => {
  if (actor && typeof actor === "object") {
    return {
      id: actor._id,
      name: actor.name || "Actor",
      email: actor.email,
    };
  }

  return {
    id: typeof actor === "string" ? actor : undefined,
    name: "Actor",
    email: undefined,
  };
};

const buildReference = (reference?: StockMovement["reference"]) => {
  if (!reference) return { model: undefined, id: undefined, value: undefined };
  if (typeof reference === "string") {
    return { model: undefined, id: undefined, value: reference };
  }
  return { model: reference.model, id: reference.id, value: undefined };
};

function DetailRow({
  label,
  value,
  monospace = false,
}: {
  label: string;
  value?: ReactNode;
  monospace?: boolean;
}) {
  const hasValue = value !== null && value !== undefined && value !== "";
  const displayValue = hasValue ? value : "-";

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className={cn("text-sm font-semibold", monospace && "font-mono")}>{displayValue}</div>
    </div>
  );
}

export function MovementDetailSheet({
  open,
  onOpenChange,
  movement,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: MovementDetail | null;
}) {
  const product = movement?.product;
  const branch = movement?.branch;
  const actor = movement?.actor as
    | string
    | { _id?: string; name?: string; email?: string }
    | undefined;

  const productLabel = movement?.productName
    || (typeof product === "object" && product?.name)
    || (typeof product === "string" ? product : "-");
  const branchInfo = getEntityLabel(branch as { _id?: string; name?: string; code?: string } | string | undefined, "Branch");
  const actorInfo = getActorInfo(actor);
  const reference = buildReference(movement?.reference);
  const hasQuantity = typeof movement?.quantity === "number";
  const quantityClass = hasQuantity && movement.quantity < 0
    ? "text-destructive"
    : hasQuantity && movement.quantity > 0
      ? "text-success"
      : "";
  const hasBalance = typeof movement?.balanceAfter === "number";
  const previousQty = hasBalance && hasQuantity
    ? movement.balanceAfter - movement.quantity
    : null;
  const newQty = hasBalance ? movement.balanceAfter : null;

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Movement Details"
      description="Read-only stock movement record"
      size="lg"
    >
      {!movement ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Select a movement to view details.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="capitalize">
              {String(movement.type || "-").replace(/_/g, " ")}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{movement._id}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow label="Product" value={productLabel} />
            <DetailRow label="Variant SKU" value={movement.variantSku || "-"} monospace />
            <DetailRow label="Branch" value={branchInfo.code || branchInfo.name} />
            <DetailRow label="Branch ID" value={branchInfo.id || "-"} monospace />
            <DetailRow
              label="Quantity"
              value={<span className={cn("font-mono", quantityClass)}>{formatMaybeNumber(movement.quantity)}</span>}
            />
            <DetailRow label="Balance After" value={formatMaybeNumber(movement.balanceAfter)} monospace />
            <DetailRow label="Previous Qty" value={formatMaybeNumber(previousQty)} monospace />
            <DetailRow label="New Qty" value={formatMaybeNumber(newQty)} monospace />
            <DetailRow label="Cost Per Unit" value={formatPriceMaybe(movement.costPerUnit)} />
            <DetailRow label="Reference Type" value={movement.referenceType || "-"} />
            <DetailRow label="Reference Model" value={reference.model || "-"} />
            <DetailRow label="Reference ID" value={reference.id || reference.value || "-"} monospace />
            <DetailRow label="Stock Entry" value={movement.stockEntry || "-"} monospace />
            <DetailRow label="Actor" value={actorInfo.name || "-"} />
            <DetailRow label="Actor ID" value={actorInfo.id || "-"} monospace />
            {actorInfo.email && <DetailRow label="Actor Email" value={actorInfo.email} />}
            <DetailRow label="Reason" value={movement.reason || "-"} />
            <DetailRow label="Created" value={formatDate(movement.createdAt)} />
          </div>

          {movement.notes && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</p>
              <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">{movement.notes}</p>
            </div>
          )}
        </div>
      )}
    </SheetWrapper>
  );
}
