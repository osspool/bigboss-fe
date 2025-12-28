"use client";

import { useRef, useMemo } from "react";
import { Printer, X, Package, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { printReceipt } from "@/lib/utils/print-utils";
import type { Transfer, TransferItem } from "@/types/inventory.types";

interface CartonLabelPrintViewProps {
  transfer: Transfer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Group items by carton number
interface CartonGroup {
  cartonNumber: string;
  items: TransferItem[];
  totalQuantity: number;
}

type BranchRef = Transfer["senderBranch"];

function getBranchInfo(branch: BranchRef) {
  if (branch && typeof branch === "object") {
    return { name: branch.name || "-", code: branch.code || "" };
  }
  return { name: "-", code: "" };
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

function groupItemsByCarton(items: TransferItem[]): CartonGroup[] {
  const cartonMap = new Map<string, TransferItem[]>();

  items.forEach((item) => {
    const carton = item.cartonNumber || "unassigned";
    if (!cartonMap.has(carton)) {
      cartonMap.set(carton, []);
    }
    cartonMap.get(carton)!.push(item);
  });

  return Array.from(cartonMap.entries()).map(([cartonNumber, items]) => ({
    cartonNumber,
    items,
    totalQuantity: items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0),
  }));
}

// Generate a simple text-based "QR code" representation for tracking
function generateTrackingId(challanNumber: string, cartonNumber: string): string {
  return `${challanNumber}-${cartonNumber}`.replace(/\s+/g, "");
}

interface SingleCartonLabelProps {
  transfer: Transfer;
  carton: CartonGroup;
  cartonIndex: number;
  totalCartons: number;
  receiver: { name: string; code: string };
  sender: { name: string; code: string };
}

function SingleCartonLabel({
  transfer,
  carton,
  cartonIndex,
  totalCartons,
  receiver,
  sender,
}: SingleCartonLabelProps) {
  const trackingId = generateTrackingId(transfer.challanNumber, carton.cartonNumber);
  const vehicleNumber = transfer.transport?.vehicleNumber;
  const driverName = transfer.transport?.driverName;

  return (
    <div className="border-2 border-dashed rounded-lg p-4 bg-background break-inside-avoid">
      {/* Header */}
      <div className="text-center border-b pb-2 mb-3">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Package className="h-5 w-5" />
          <span className="font-bold text-lg">CARTON LABEL</span>
        </div>
        <div className="font-mono text-sm text-muted-foreground">
          {transfer.challanNumber}
        </div>
      </div>

      {/* Carton Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1 font-mono">
            {carton.cartonNumber === "unassigned" ? "N/A" : carton.cartonNumber}
          </Badge>
          <span className="text-sm text-muted-foreground">
            of {totalCartons}
          </span>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {formatDate(transfer.dispatchedAt || transfer.createdAt)}
        </div>
      </div>

      {/* Route Info */}
      <div className="grid grid-cols-2 gap-3 mb-3 p-2 bg-muted/50 rounded">
        <div>
          <div className="text-xs text-muted-foreground font-medium">FROM</div>
          <div className="font-semibold">{sender.name}</div>
          {sender.code && <div className="text-xs font-mono">{sender.code}</div>}
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground font-medium">TO</div>
          <div className="font-semibold">{receiver.name}</div>
          {receiver.code && <div className="text-xs font-mono">{receiver.code}</div>}
        </div>
      </div>

      {/* Items in this carton */}
      <div className="mb-3">
        <div className="text-xs font-medium text-muted-foreground mb-1">
          CONTENTS ({carton.items.length} items, {carton.totalQuantity} units)
        </div>
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {carton.items.map((item, idx) => {
            const name = item.productName || "Item";
            const variant = item.variantSku || "";
            return (
              <div key={idx} className="flex justify-between text-xs border-b border-dashed pb-1">
                <div className="truncate flex-1">
                  <span className="font-medium">{name}</span>
                  {variant && (
                    <span className="text-muted-foreground ml-1">({variant})</span>
                  )}
                </div>
                <div className="font-mono ml-2">x{item.quantity}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transport Info */}
      {(vehicleNumber || driverName) && (
        <div className="mb-3 p-2 bg-muted/30 rounded text-xs">
          <div className="font-medium text-muted-foreground mb-1">TRANSPORT</div>
          <div className="flex gap-4">
            {vehicleNumber && (
              <div>
                <span className="text-muted-foreground">Vehicle:</span>{" "}
                <span className="font-mono">{vehicleNumber}</span>
              </div>
            )}
            {driverName && (
              <div>
                <span className="text-muted-foreground">Driver:</span>{" "}
                <span>{driverName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Placeholder / Tracking ID */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <QrCode className="h-8 w-8 text-muted-foreground" />
          <div className="text-xs">
            <div className="text-muted-foreground">Tracking ID</div>
            <div className="font-mono font-medium">{trackingId}</div>
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="text-muted-foreground">Status</div>
          <div className="font-medium capitalize">{transfer.status?.replace(/_/g, " ")}</div>
        </div>
      </div>
    </div>
  );
}

export function CartonLabelPrintView({
  transfer,
  open,
  onOpenChange,
}: CartonLabelPrintViewProps) {
  const printRef = useRef<HTMLDivElement | null>(null);

  const { cartons, sender, receiver, totalCartons } = useMemo(() => {
    if (!transfer) {
      return { cartons: [], sender: { name: "-", code: "" }, receiver: { name: "-", code: "" }, totalCartons: 0 };
    }
    const items = transfer.items || [];
    const cartons = groupItemsByCarton(items);
    const sender = getBranchInfo(transfer.senderBranch);
    const receiver = getBranchInfo(transfer.receiverBranch);
    // Don't count 'unassigned' as a real carton for display purposes
    const assignedCartons = cartons.filter((c) => c.cartonNumber !== "unassigned");
    const totalCartons = assignedCartons.length > 0 ? assignedCartons.length : cartons.length;
    return { cartons, sender, receiver, totalCartons };
  }, [transfer]);

  if (!transfer) return null;

  const hasCartons = cartons.some((c) => c.cartonNumber !== "unassigned");

  const handlePrint = () => {
    if (!printRef.current) return;
    printReceipt(printRef.current);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Carton Labels - {transfer.challanNumber}
            </span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {!hasCartons ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-2">No carton numbers assigned to this transfer.</p>
            <p className="text-sm text-muted-foreground">
              Carton numbers are assigned when fulfilling stock requests or creating transfers.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary">
                {totalCartons} carton{totalCartons !== 1 ? "s" : ""}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Preview labels below, then click Print to print all.
              </p>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-muted/30">
              <div className="grid gap-4 md:grid-cols-2">
                {cartons
                  .filter((c) => c.cartonNumber !== "unassigned")
                  .map((carton, idx) => (
                    <SingleCartonLabel
                      key={carton.cartonNumber}
                      transfer={transfer}
                      carton={carton}
                      cartonIndex={idx + 1}
                      totalCartons={totalCartons}
                      receiver={receiver}
                      sender={sender}
                    />
                  ))}
              </div>

              {/* Show unassigned items if any */}
              {cartons.some((c) => c.cartonNumber === "unassigned") && (
                <div className="mt-4 p-3 border border-dashed border-warning/50 rounded-lg bg-warning/5">
                  <div className="text-sm font-medium text-warning mb-2">
                    Items without carton assignment:
                  </div>
                  <div className="space-y-1">
                    {cartons
                      .find((c) => c.cartonNumber === "unassigned")
                      ?.items.map((item, idx) => (
                        <div key={idx} className="text-xs flex justify-between">
                          <span>{item.productName || "Item"}</span>
                          <span className="font-mono">x{item.quantity}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex gap-2 pt-3 border-t">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {hasCartons && (
            <Button className="flex-1" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print All Labels
            </Button>
          )}
        </div>

        {/* Hidden printable content */}
        {hasCartons && (
          <div className="sr-only">
            <div
              ref={printRef}
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                padding: "8px",
                background: "#fff",
              }}
            >
              {cartons
                .filter((c) => c.cartonNumber !== "unassigned")
                .map((carton, idx) => {
                  const trackingId = generateTrackingId(transfer.challanNumber, carton.cartonNumber);
                  const vehicleNumber = transfer.transport?.vehicleNumber;
                  const driverName = transfer.transport?.driverName;

                  return (
                    <div
                      key={carton.cartonNumber}
                      style={{
                        border: "2px dashed #333",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: idx < cartons.length - 1 ? "16px" : 0,
                        pageBreakAfter: idx < totalCartons - 1 ? "always" : "auto",
                        background: "#fff",
                      }}
                    >
                      {/* Header */}
                      <div style={{ textAlign: "center", borderBottom: "1px solid #ccc", paddingBottom: "8px", marginBottom: "12px" }}>
                        <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>
                          CARTON LABEL
                        </div>
                        <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#666" }}>
                          {transfer.challanNumber}
                        </div>
                      </div>

                      {/* Carton Number */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{
                            border: "2px solid #333",
                            borderRadius: "4px",
                            padding: "4px 12px",
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: "18px",
                          }}>
                            {carton.cartonNumber}
                          </span>
                          <span style={{ fontSize: "12px", color: "#666" }}>
                            of {totalCartons}
                          </span>
                        </div>
                        <div style={{ fontSize: "10px", color: "#666" }}>
                          {formatDate(transfer.dispatchedAt || transfer.createdAt)}
                        </div>
                      </div>

                      {/* Route */}
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px",
                        background: "#f5f5f5",
                        borderRadius: "4px",
                        marginBottom: "12px",
                      }}>
                        <div>
                          <div style={{ fontSize: "10px", color: "#666", fontWeight: 600 }}>FROM</div>
                          <div style={{ fontWeight: 600 }}>{sender.name}</div>
                          {sender.code && <div style={{ fontSize: "10px", fontFamily: "monospace" }}>{sender.code}</div>}
                        </div>
                        <div style={{ textAlign: "center", alignSelf: "center", fontSize: "18px" }}>→</div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "10px", color: "#666", fontWeight: 600 }}>TO</div>
                          <div style={{ fontWeight: 600 }}>{receiver.name}</div>
                          {receiver.code && <div style={{ fontSize: "10px", fontFamily: "monospace" }}>{receiver.code}</div>}
                        </div>
                      </div>

                      {/* Contents */}
                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontSize: "10px", fontWeight: 600, color: "#666", marginBottom: "4px" }}>
                          CONTENTS ({carton.items.length} items, {carton.totalQuantity} units)
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                          <tbody>
                            {carton.items.map((item, itemIdx) => (
                              <tr key={itemIdx} style={{ borderBottom: "1px dotted #ccc" }}>
                                <td style={{ padding: "3px 0" }}>
                                  <span style={{ fontWeight: 500 }}>{item.productName || "Item"}</span>
                                  {item.variantSku && (
                                    <span style={{ color: "#666", marginLeft: "4px" }}>({item.variantSku})</span>
                                  )}
                                </td>
                                <td style={{ textAlign: "right", fontFamily: "monospace", padding: "3px 0" }}>
                                  x{item.quantity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Transport */}
                      {(vehicleNumber || driverName) && (
                        <div style={{
                          padding: "6px",
                          background: "#fafafa",
                          borderRadius: "4px",
                          marginBottom: "12px",
                          fontSize: "10px",
                        }}>
                          <div style={{ fontWeight: 600, color: "#666", marginBottom: "4px" }}>TRANSPORT</div>
                          <div style={{ display: "flex", gap: "16px" }}>
                            {vehicleNumber && (
                              <div>
                                <span style={{ color: "#666" }}>Vehicle: </span>
                                <span style={{ fontFamily: "monospace" }}>{vehicleNumber}</span>
                              </div>
                            )}
                            {driverName && (
                              <div>
                                <span style={{ color: "#666" }}>Driver: </span>
                                <span>{driverName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tracking / QR Placeholder */}
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #ccc",
                        paddingTop: "8px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{
                            width: "48px",
                            height: "48px",
                            border: "1px solid #999",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "8px",
                            color: "#666",
                            borderRadius: "4px",
                          }}>
                            QR
                          </div>
                          <div>
                            <div style={{ fontSize: "9px", color: "#666" }}>Tracking ID</div>
                            <div style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "11px" }}>{trackingId}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "9px", color: "#666" }}>Status</div>
                          <div style={{ fontWeight: 600, textTransform: "capitalize", fontSize: "11px" }}>
                            {transfer.status?.replace(/_/g, " ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
