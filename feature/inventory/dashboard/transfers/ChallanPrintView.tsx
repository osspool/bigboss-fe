"use client";

import { useRef } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/constants";
import { printReceipt } from "@/lib/utils/print-utils";
import type { Transfer } from "@/types/inventory.types";

interface ChallanPrintViewProps {
  transfer: Transfer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatDate = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

type BranchRef = Transfer["senderBranch"];

function getBranchInfo(branch: BranchRef) {
  if (branch && typeof branch === "object") {
    return { name: branch.name || "-", code: branch.code || "" };
  }
  return { name: "-", code: "" };
}

function getCreatedByName(createdBy: Transfer["createdBy"]) {
  if (createdBy && typeof createdBy === "object") {
    return createdBy.name || "-";
  }
  return "-";
}

export function ChallanPrintView({
  transfer,
  open,
  onOpenChange,
}: ChallanPrintViewProps) {
  const printRef = useRef<HTMLDivElement | null>(null);

  if (!transfer) return null;

  const sender = getBranchInfo(transfer.senderBranch);
  const receiver = getBranchInfo(transfer.receiverBranch);
  const items = transfer.items || [];
  const totalQty = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

  const handlePrint = () => {
    if (!printRef.current) return;
    printReceipt(printRef.current);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Challan Preview</span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="border rounded-lg p-4 bg-muted/30 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3 text-sm">
            <div className="text-center border-b pb-3">
              <div className="font-bold text-lg">DELIVERY CHALLAN</div>
              <div className="text-muted-foreground text-xs">
                {transfer.documentType?.replace(/_/g, " ").toUpperCase() || "DELIVERY CHALLAN"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Challan No:</span>
                <div className="font-mono font-medium">{transfer.challanNumber}</div>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground">Date:</span>
                <div className="font-medium">{formatDate(transfer.createdAt)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border rounded p-2 bg-background">
              <div>
                <div className="text-xs text-muted-foreground mb-1">From:</div>
                <div className="font-medium">{sender.name}</div>
                {sender.code && <div className="text-xs text-muted-foreground">{sender.code}</div>}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">To:</div>
                <div className="font-medium">{receiver.name}</div>
                {receiver.code && <div className="text-xs text-muted-foreground">{receiver.code}</div>}
              </div>
            </div>

            <div className="border rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">Item</th>
                    <th className="text-right p-2 w-16">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const record = item as unknown as Record<string, unknown>;
                    const name = (record.productName as string) || (record.productId as string) || "Item";
                    const variant = (record.variantSku as string) || "";
                    return (
                      <tr key={idx} className="border-t">
                        <td className="p-2">
                          <div className="font-medium">{name}</div>
                          {variant && <div className="text-muted-foreground">{variant}</div>}
                        </td>
                        <td className="p-2 text-right font-mono">{item.quantity}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-muted font-medium">
                  <tr className="border-t">
                    <td className="p-2">Total ({items.length} items)</td>
                    <td className="p-2 text-right font-mono">{totalQty}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {transfer.totalValue && transfer.totalValue > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-medium">{formatPrice(transfer.totalValue)}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t text-xs">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="font-medium capitalize">{transfer.status?.replace(/_/g, " ")}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Created By:</span>
                <div className="font-medium">{getCreatedByName(transfer.createdBy)}</div>
              </div>
            </div>

            {transfer.remarks && (
              <div className="text-xs">
                <span className="text-muted-foreground">Remarks:</span>
                <div>{transfer.remarks}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-center">
              <div>
                <div className="border-t border-dashed pt-1">Sender Signature</div>
              </div>
              <div>
                <div className="border-t border-dashed pt-1">Receiver Signature</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        {/* Hidden printable content */}
        <div className="sr-only">
          <div
            ref={printRef}
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              padding: "16px",
              width: "280px",
              background: "#fff",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              <div style={{ fontWeight: 700, fontSize: "16px" }}>DELIVERY CHALLAN</div>
              <div style={{ fontSize: "10px", color: "#666" }}>
                {transfer.documentType?.replace(/_/g, " ").toUpperCase() || "DELIVERY CHALLAN"}
              </div>
            </div>

            <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#666" }}>Challan No:</div>
                <div style={{ fontWeight: 600, fontFamily: "monospace" }}>{transfer.challanNumber}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "10px", color: "#666" }}>Date:</div>
                <div style={{ fontWeight: 600 }}>{formatDate(transfer.createdAt)}</div>
              </div>
            </div>

            <div style={{ border: "1px solid #ddd", padding: "8px", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#666" }}>From:</div>
                  <div style={{ fontWeight: 600 }}>{sender.name}</div>
                  {sender.code && <div style={{ fontSize: "10px" }}>{sender.code}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: "#666" }}>To:</div>
                  <div style={{ fontWeight: 600 }}>{receiver.name}</div>
                  {receiver.code && <div style={{ fontSize: "10px" }}>{receiver.code}</div>}
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #000" }}>
                  <th style={{ textAlign: "left", padding: "4px 0" }}>Item</th>
                  <th style={{ textAlign: "right", padding: "4px 0", width: "40px" }}>Qty</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const record = item as unknown as Record<string, unknown>;
                  const name = (record.productName as string) || (record.productId as string) || "Item";
                  const variant = (record.variantSku as string) || "";
                  return (
                    <tr key={idx} style={{ borderBottom: "1px dotted #ccc" }}>
                      <td style={{ padding: "4px 0" }}>
                        <div style={{ fontWeight: 500 }}>{name}</div>
                        {variant && <div style={{ fontSize: "10px", color: "#666" }}>{variant}</div>}
                      </td>
                      <td style={{ textAlign: "right", padding: "4px 0", fontFamily: "monospace" }}>
                        {item.quantity}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "1px solid #000", fontWeight: 700 }}>
                  <td style={{ padding: "4px 0" }}>Total ({items.length} items)</td>
                  <td style={{ textAlign: "right", padding: "4px 0", fontFamily: "monospace" }}>{totalQty}</td>
                </tr>
              </tfoot>
            </table>

            {transfer.totalValue && transfer.totalValue > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                <span>Total Value:</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(transfer.totalValue)}</span>
              </div>
            )}

            <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
              <div>
                <span style={{ color: "#666" }}>Status: </span>
                <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
                  {transfer.status?.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span style={{ color: "#666" }}>By: </span>
                <span style={{ fontWeight: 600 }}>{getCreatedByName(transfer.createdBy)}</span>
              </div>
            </div>

            {transfer.remarks && (
              <div style={{ marginTop: "8px", fontSize: "10px" }}>
                <div style={{ color: "#666" }}>Remarks:</div>
                <div>{transfer.remarks}</div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", fontSize: "10px" }}>
              <div style={{ textAlign: "center", width: "45%" }}>
                <div style={{ borderTop: "1px dashed #000", paddingTop: "4px" }}>Sender Signature</div>
              </div>
              <div style={{ textAlign: "center", width: "45%" }}>
                <div style={{ borderTop: "1px dashed #000", paddingTop: "4px" }}>Receiver Signature</div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "16px", fontSize: "10px", color: "#666" }}>
              Generated: {formatDateTime(new Date().toISOString())}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
