"use client";

import { useRef, type ReactNode } from "react";
import {
  ShoppingBag,
  User,
  Clock,
  CreditCard,
  Package,
  X,
  Building2,
  Phone,
  MapPin,
  Printer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SheetWrapper } from "@classytic/clarity";
import { formatPrice } from "@/lib/constants";
import { printDocument } from "@/lib/utils/print-utils";
import {
  getSupplierInfo as getSupplierInfoUtil,
  getBranchInfo as getBranchInfoUtil,
  getUserInfo,
} from "@/lib/commerce-utils";
import { cn } from "@/lib/utils";
import type {
  Purchase,
  PurchaseItemDoc,
  PurchaseStatus,
  PurchasePaymentStatus,
  PurchaseStatusHistoryEntry,
} from "@/types";
import type { Supplier } from "@/types";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const statusConfig: Record<PurchaseStatus, { label: string; className: string; printClass: string }> = {
  draft: { label: "Draft", className: "bg-muted text-foreground", printClass: "badge-default" },
  approved: { label: "Approved", className: "bg-primary/10 text-primary", printClass: "badge-primary" },
  received: { label: "Received", className: "bg-success/10 text-success", printClass: "badge-success" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive", printClass: "badge-danger" },
};

const paymentStatusConfig: Record<PurchasePaymentStatus, { label: string; className: string; printClass: string }> = {
  unpaid: { label: "Unpaid", className: "bg-warning/10 text-warning", printClass: "badge-warning" },
  partial: { label: "Partial", className: "bg-orange-100 text-orange-700", printClass: "badge-warning" },
  paid: { label: "Paid", className: "bg-success/10 text-success", printClass: "badge-success" },
};

function StatusBadge({ status }: { status?: PurchaseStatus }) {
  const cfg = statusConfig[status || "draft"] || { label: status || "-", className: "" };
  return (
    <Badge variant="outline" className={cn("font-normal text-xs", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

function PaymentBadge({ status }: { status?: PurchasePaymentStatus }) {
  const cfg = paymentStatusConfig[status || "unpaid"] || { label: status || "-", className: "" };
  return (
    <Badge variant="outline" className={cn("font-normal text-xs", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

interface PurchaseDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: Purchase | null;
  suppliers?: Supplier[];
  isHeadOffice?: boolean;
  onReceive?: (purchase: Purchase) => void;
  onPay?: (purchase: Purchase) => void;
  onCancel?: (purchase: Purchase) => void;
  isReceiving?: boolean;
  isPaying?: boolean;
  isCancelling?: boolean;
}

export function PurchaseDetailSheet({
  open,
  onOpenChange,
  purchase,
  suppliers = [],
  isHeadOffice = false,
  onReceive,
  onPay,
  onCancel,
  isReceiving = false,
  isPaying = false,
  isCancelling = false,
}: PurchaseDetailSheetProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!purchase) {
    return (
      <SheetWrapper
        open={open}
        onOpenChange={onOpenChange}
        title="Purchase Details"
        description="Purchase invoice information"
        size="lg"
      >
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Select a purchase to view details.
        </div>
      </SheetWrapper>
    );
  }

  const supplier = getSupplierInfoUtil(purchase.supplier, suppliers);
  const branch = getBranchInfoUtil(purchase.branch);
  const fullSupplier = suppliers.find(
    (s) => s._id === (typeof purchase.supplier === "string" ? purchase.supplier : purchase.supplier?._id)
  );
  const items = purchase.items || [];
  const totalQty = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

  const canReceive = isHeadOffice && (purchase.status === "draft" || purchase.status === "approved");
  const canPay = isHeadOffice && purchase.status === "received" && purchase.paymentStatus !== "paid";
  const canCancel = isHeadOffice && (purchase.status === "draft" || purchase.status === "approved");
  const isActioning = isReceiving || isPaying || isCancelling;

  const handlePrint = () => {
    if (printRef.current) {
      printDocument(printRef.current, `Purchase ${purchase.invoiceNumber}`);
    }
  };

  return (
    <SheetWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Purchase Details"
      description={purchase.invoiceNumber || "Purchase Invoice"}
      size="lg"
    >
      <div className="space-y-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-mono text-base font-semibold">{purchase.invoiceNumber}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StatusBadge status={purchase.status} />
                <PaymentBadge status={purchase.paymentStatus} />
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print
          </Button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Supplier</p>
            <p className="font-medium truncate">{supplier.name}</p>
            {supplier.code && <p className="text-xs text-muted-foreground font-mono">{supplier.code}</p>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Branch</p>
            <p className="font-medium truncate">{branch.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">PO Number</p>
            <p className="font-mono">{purchase.purchaseOrderNumber || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Invoice Date</p>
            <p>{formatDate(purchase.invoiceDate || purchase.createdAt)}</p>
          </div>
        </div>

        {/* Supplier Contact (if available) */}
        {fullSupplier && (fullSupplier.contactPerson || fullSupplier.phone) && (
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-3">
            {fullSupplier.contactPerson && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> {fullSupplier.contactPerson}
              </span>
            )}
            {fullSupplier.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {fullSupplier.phone}
              </span>
            )}
            {fullSupplier.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> <span className="truncate max-w-[200px]">{fullSupplier.address}</span>
              </span>
            )}
          </div>
        )}

        {/* Items Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-xs uppercase text-muted-foreground">Item</th>
                <th className="text-center px-3 py-2 font-medium text-xs uppercase text-muted-foreground w-16">Qty</th>
                <th className="text-right px-3 py-2 font-medium text-xs uppercase text-muted-foreground w-24">Cost</th>
                <th className="text-right px-3 py-2 font-medium text-xs uppercase text-muted-foreground w-24">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <div className="font-medium">{item.productName || "Item"}</div>
                    {item.variantSku && (
                      <div className="text-xs text-muted-foreground font-mono">{item.variantSku}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center font-mono">{item.quantity}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatPrice(item.costPrice)}</td>
                  <td className="px-3 py-2 text-right font-mono font-medium">
                    {formatPrice(item.lineTotal || item.costPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatPrice(purchase.subTotal || purchase.grandTotal)}</span>
            </div>
            {(purchase.discountTotal ?? 0) > 0 && (
              <div className="flex justify-between text-primary">
                <span>Discount</span>
                <span className="font-mono">-{formatPrice(purchase.discountTotal || 0)}</span>
              </div>
            )}
            {(purchase.taxTotal ?? 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono">{formatPrice(purchase.taxTotal || 0)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Grand Total</span>
              <span className="font-mono">{formatPrice(purchase.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-success">
              <span>Paid</span>
              <span className="font-mono">{formatPrice(purchase.paidAmount || 0)}</span>
            </div>
            {purchase.dueAmount > 0 && (
              <div className="flex justify-between text-warning font-medium">
                <span>Due</span>
                <span className="font-mono">{formatPrice(purchase.dueAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="flex flex-wrap gap-4 text-xs border-t pt-3">
          <div>
            <span className="text-muted-foreground">Payment Terms: </span>
            <span className="capitalize">{purchase.paymentTerms}</span>
            {purchase.paymentTerms === "credit" && purchase.creditDays ? ` (${purchase.creditDays} days)` : ""}
          </div>
          {purchase.dueDate && (
            <div>
              <span className="text-muted-foreground">Due Date: </span>
              <span>{formatDate(purchase.dueDate)}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Items: </span>
            <span>{items.length} ({totalQty} units)</span>
          </div>
        </div>

        {/* Notes */}
        {purchase.notes && (
          <div className="text-sm border-t pt-3">
            <span className="text-muted-foreground">Notes: </span>
            <span>{purchase.notes}</span>
          </div>
        )}

        {/* Audit Info */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground border-t pt-3">
          <span>Created: {formatDateTime(purchase.createdAt)} by {getUserInfo(purchase.createdBy).name}</span>
          {purchase.receivedAt && (
            <span>Received: {formatDateTime(purchase.receivedAt)} by {getUserInfo(purchase.receivedBy).name}</span>
          )}
        </div>

        {/* Actions */}
        {(canReceive || canPay || canCancel) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {canReceive && onReceive && (
              <Button onClick={() => onReceive(purchase)} disabled={isActioning} size="sm">
                <Package className="h-4 w-4 mr-1.5" />
                {isReceiving ? "Receiving..." : "Receive Stock"}
              </Button>
            )}
            {canPay && onPay && (
              <Button variant="outline" onClick={() => onPay(purchase)} disabled={isActioning} size="sm">
                <CreditCard className="h-4 w-4 mr-1.5" />
                {isPaying ? "Processing..." : "Record Payment"}
              </Button>
            )}
            {canCancel && onCancel && (
              <Button variant="destructive" onClick={() => onCancel(purchase)} disabled={isActioning} size="sm">
                <X className="h-4 w-4 mr-1.5" />
                {isCancelling ? "Cancelling..." : "Cancel"}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Hidden Print Content */}
      <div className="sr-only">
        <div ref={printRef}>
          <div className="print-header">
            <h1>Purchase Invoice</h1>
            <div className="subtitle">{purchase.invoiceNumber}</div>
          </div>

          <div className="print-meta">
            <div>
              <strong>Supplier:</strong> {supplier.name} {supplier.code ? `(${supplier.code})` : ""}
              {fullSupplier?.phone && <><br />Phone: {fullSupplier.phone}</>}
            </div>
            <div style={{ textAlign: "right" }}>
              <strong>Date:</strong> {formatDate(purchase.invoiceDate || purchase.createdAt)}<br />
              <strong>PO:</strong> {purchase.purchaseOrderNumber || "-"}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>SKU</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Cost</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.productName || "Item"}</td>
                  <td className="font-mono">{item.variantSku || "-"}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-right font-mono">{formatPrice(item.costPrice)}</td>
                  <td className="text-right font-mono font-bold">
                    {formatPrice(item.lineTotal || item.costPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-right font-bold">Grand Total:</td>
                <td className="text-right font-mono font-bold">{formatPrice(purchase.grandTotal)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="text-right">Paid:</td>
                <td className="text-right font-mono text-success">{formatPrice(purchase.paidAmount || 0)}</td>
              </tr>
              {purchase.dueAmount > 0 && (
                <tr>
                  <td colSpan={4} className="text-right font-bold">Due:</td>
                  <td className="text-right font-mono text-warning font-bold">{formatPrice(purchase.dueAmount)}</td>
                </tr>
              )}
            </tfoot>
          </table>

          <div style={{ marginTop: "20px", fontSize: "11px" }}>
            <div>
              <span className={`badge ${statusConfig[purchase.status]?.printClass || "badge-default"}`}>
                {statusConfig[purchase.status]?.label || purchase.status}
              </span>
              {" "}
              <span className={`badge ${paymentStatusConfig[purchase.paymentStatus]?.printClass || "badge-default"}`}>
                {paymentStatusConfig[purchase.paymentStatus]?.label || purchase.paymentStatus}
              </span>
            </div>
            <div style={{ marginTop: "10px", color: "#666" }}>
              Payment Terms: {purchase.paymentTerms}
              {purchase.paymentTerms === "credit" && purchase.creditDays ? ` (${purchase.creditDays} days)` : ""}
              {purchase.dueDate && <> | Due: {formatDate(purchase.dueDate)}</>}
            </div>
            {purchase.notes && <div style={{ marginTop: "5px" }}>Notes: {purchase.notes}</div>}
          </div>
        </div>
      </div>
    </SheetWrapper>
  );
}
