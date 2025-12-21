"use client";

import { memo, useMemo, useRef } from "react";
import { AlertTriangle, CheckCircle2, Printer, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/constants";
import { printReceipt } from "@/lib/utils/print-utils";
import type { PosReceiptData } from "@/types/pos.types";

interface ReceiptPanelProps {
  receipt: PosReceiptData | null;
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  onNewSale: () => void;
  cashReceived?: number | null;
}

const formatDateTime = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" });
};

const prettyMethod = (value?: string) => (value ? value.replace(/_/g, " ") : "");

const formatVariantAttributes = (attributes?: Record<string, unknown>) => {
  if (!attributes) return "";
  return Object.entries(attributes)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(", ");
};

const normalizeReceiptItems = (items: PosReceiptData["items"]) => {
  return items.map((item) => {
    const record = item as unknown as Record<string, unknown>;
    const name =
      typeof item.name === "string"
        ? item.name
        : typeof record.productName === "string"
        ? record.productName
        : "Item";
    const quantity =
      typeof item.quantity === "number"
        ? item.quantity
        : typeof record.quantity === "number"
        ? record.quantity
        : 1;
    const unitPrice =
      typeof item.unitPrice === "number"
        ? item.unitPrice
        : typeof record.unitPrice === "number"
        ? record.unitPrice
        : typeof record.price === "number"
        ? record.price
        : 0;
    const total =
      typeof item.total === "number"
        ? item.total
        : typeof record.total === "number"
        ? record.total
        : quantity * unitPrice;

    let variantLabel = "";
    if (typeof item.variant === "string") {
      variantLabel = item.variant.trim();
    } else if (record.variant && typeof record.variant === "object") {
      const v = record.variant as Record<string, unknown>;
      variantLabel = formatVariantAttributes((v.attributes as Record<string, unknown>) || v);
    } else if (record.variantAttributes && typeof record.variantAttributes === "object") {
      variantLabel = formatVariantAttributes(record.variantAttributes as Record<string, unknown>);
    } else if (typeof record.variantSku === "string") {
      variantLabel = record.variantSku;
    }

    if (
      variantLabel.length > 60 ||
      variantLabel.includes("ObjectId(") ||
      variantLabel.includes("productName") ||
      variantLabel.includes("product:")
    ) {
      variantLabel = "";
    }

    return { name, variantLabel, quantity, unitPrice, total };
  });
};

export const ReceiptPanel = memo(function ReceiptPanel({
  receipt,
  isLoading,
  hasError,
  onRetry,
  onNewSale,
  cashReceived,
}: ReceiptPanelProps) {
  const printRef = useRef<HTMLDivElement | null>(null);
  const normalizedItems = useMemo(
    () => (receipt ? normalizeReceiptItems(receipt.items) : []),
    [receipt]
  );

  const changeAmount = useMemo(() => {
    if (!receipt) return 0;
    if (receipt.payment.method !== "cash") return 0;
    if (typeof cashReceived !== "number") return 0;
    return Math.max(0, cashReceived - receipt.total);
  }, [cashReceived, receipt]);

  const amountDue = useMemo(() => {
    if (!receipt) return 0;
    if (receipt.payment.method !== "cash") return 0;
    if (typeof cashReceived !== "number") return 0;
    return Math.max(0, receipt.total - cashReceived);
  }, [cashReceived, receipt]);

  const handlePrint = () => {
    if (!printRef.current) return;
    printReceipt(printRef.current);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b bg-card">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Sale completed — preparing receipt
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="border-t p-4">
          <Button className="w-full" disabled>
            Print Receipt
          </Button>
        </div>
      </div>
    );
  }

  if (hasError || !receipt) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <div>
          <p className="text-sm font-medium">Receipt could not be loaded</p>
          <p className="text-xs text-muted-foreground">Retry to fetch the latest receipt.</p>
        </div>
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button className="flex-1" onClick={onNewSale}>
            <RotateCcw className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-card">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Sale completed
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Order {receipt.orderNumber} • {formatDateTime(receipt.date)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{formatPrice(receipt.total)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment</p>
              <p className="text-sm font-medium capitalize">
                {prettyMethod(receipt.payment.method)}
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {receipt.customer?.name || "Walk-in Customer"}
            {receipt.customer?.phone ? ` • ${receipt.customer.phone}` : ""}
          </div>
          {receipt.payment.reference && (
            <div className="text-xs text-muted-foreground">
              Ref: <span className="font-medium text-foreground">{receipt.payment.reference}</span>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Items</div>
          <div className="space-y-3">
            {normalizedItems.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  {item.variantLabel && (
                    <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-medium">{formatPrice(item.total)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(receipt.subtotal)}</span>
          </div>
          {receipt.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatPrice(receipt.discount)}</span>
            </div>
          )}
          {receipt.deliveryCharge > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>{formatPrice(receipt.deliveryCharge)}</span>
            </div>
          )}
          {receipt.vat?.applicable && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT ({receipt.vat.rate}%)</span>
              <span>{formatPrice(receipt.vat.amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(receipt.total)}</span>
          </div>
          {receipt.payment.method === "cash" && typeof cashReceived === "number" && (
            <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Cash Received</span>
                <span className="font-medium text-foreground">{formatPrice(cashReceived)}</span>
              </div>
              <div className="flex justify-between">
                <span>Change</span>
                <span className="font-medium text-foreground">{formatPrice(changeAmount)}</span>
              </div>
              {amountDue > 0 && (
                <div className="flex justify-between text-destructive font-medium">
                  <span>Due</span>
                  <span>{formatPrice(amountDue)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-11" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button className="h-11" onClick={onNewSale}>
            <RotateCcw className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {receipt.branch.name} • {receipt.branch.phone || "Support available in-store"}
        </p>
      </div>

      <div className="sr-only">
        <div
          ref={printRef}
          style={{
            fontFamily: "Courier New, monospace",
            fontSize: "12px",
            padding: "12px",
            width: "280px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <div style={{ fontWeight: 700, fontSize: "14px" }}>{receipt.branch.name}</div>
            {receipt.branch.phone && <div>{receipt.branch.phone}</div>}
          </div>
          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
          <div>Order: {receipt.orderNumber}</div>
          {receipt.invoiceNumber && <div>Invoice: {receipt.invoiceNumber}</div>}
          <div>Date: {formatDateTime(receipt.date)}</div>
          <div>Cashier: {receipt.cashier || "-"}</div>
          <div>Customer: {receipt.customer?.name || "Walk-in"}</div>
          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
          {normalizedItems.map((item, index) => (
            <div key={`${item.name}-print-${index}`} style={{ marginBottom: "4px" }}>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              {item.variantLabel && <div style={{ fontSize: "11px" }}>{item.variantLabel}</div>}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </span>
                <span>{formatPrice(item.total)}</span>
              </div>
            </div>
          ))}
          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span>
            <span>{formatPrice(receipt.subtotal)}</span>
          </div>
          {receipt.discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Discount</span>
              <span>-{formatPrice(receipt.discount)}</span>
            </div>
          )}
          {receipt.deliveryCharge > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Delivery</span>
              <span>{formatPrice(receipt.deliveryCharge)}</span>
            </div>
          )}
          {receipt.vat?.applicable && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>VAT</span>
              <span>{formatPrice(receipt.vat.amount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
            <span>Total</span>
            <span>{formatPrice(receipt.total)}</span>
          </div>
          {receipt.vat?.sellerBin && (
            <div style={{ marginTop: "4px" }}>BIN: {receipt.vat.sellerBin}</div>
          )}
          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
          <div>Paid via: {prettyMethod(receipt.payment.method)}</div>
          {receipt.payment.reference && <div>Ref: {receipt.payment.reference}</div>}
          {receipt.payment.method === "cash" && typeof cashReceived === "number" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Cash</span>
                <span>{formatPrice(cashReceived)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Change</span>
                <span>{formatPrice(changeAmount)}</span>
              </div>
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: "10px" }}>Thank you!</div>
        </div>
      </div>
    </div>
  );
});
