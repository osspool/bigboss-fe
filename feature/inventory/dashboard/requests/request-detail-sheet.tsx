"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SheetWrapper } from "@/components/custom/ui/sheet-wrapper";
import FormInput from "@/components/form/form-utils/form-input";
import { cn } from "@/lib/utils";
import type { StockRequest, StockRequestItem } from "@/types/inventory.types";
import { useStockRequestActions } from "@/hooks/query/useStockRequests";
import { CrossBranchStockLookup } from "./cross-branch-stock-lookup";

interface RequestDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: StockRequest | null;
  token: string;
  isHeadOffice: boolean;
}

type ApprovalItem = {
  productId: string;
  variantSku?: string;
  quantityApproved: number;
  productName?: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20" },
  approved: { label: "Approved", className: "bg-primary/10 text-primary border-primary/20" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive border-destructive/20" },
  fulfilled: { label: "Fulfilled", className: "bg-success/10 text-success border-success/20" },
  partial_fulfilled: { label: "Partial", className: "bg-success/10 text-success border-success/20" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground border-border" },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  normal: { label: "Normal", className: "bg-secondary text-secondary-foreground" },
  high: { label: "High", className: "bg-warning/20 text-warning" },
  urgent: { label: "Urgent", className: "bg-destructive/20 text-destructive" },
};

function getBranchName(branch: StockRequest["requestingBranch"] | StockRequest["fulfillingBranch"]): string {
  if (!branch) return "-";
  if (typeof branch === "string") return branch;
  return branch.name || branch.code || "-";
}

// Extended item type to match actual API response
interface ApiRequestItem extends StockRequestItem {
  product?: string;
  productName?: string;
  productSku?: string;
  variantAttributes?: Record<string, string>;
  quantityRequested?: number;
  currentStock?: number;
}

function getProductInfo(item: ApiRequestItem): {
  id: string;
  name: string;
  sku: string;
  variantSku: string;
  variantAttributes?: Record<string, string>;
  quantityRequested: number;
  currentStock?: number;
} {
  // API sends "product" (id) and "productName", types have "productId"
  const productId = item.product || (typeof item.productId === "string" ? item.productId : (item.productId as any)?._id) || "";
  const productName = item.productName || (item.productId as any)?.name || "Unknown Product";
  const quantityRequested = item.quantityRequested ?? item.quantity ?? 0;

  return {
    id: productId,
    name: productName,
    sku: item.productSku || "",
    variantSku: item.variantSku || "",
    variantAttributes: item.variantAttributes,
    quantityRequested,
    currentStock: item.currentStock,
  };
}

function DetailRow({ label, value, mono = false }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className={cn("text-sm", mono && "font-mono")}>{value ?? "-"}</div>
    </div>
  );
}

export function RequestDetailSheet({
  open,
  onOpenChange,
  request,
  token,
  isHeadOffice,
}: RequestDetailSheetProps) {
  const actions = useStockRequestActions(token);
  const [reviewNotes, setReviewNotes] = useState("");
  const [approvalQuantities, setApprovalQuantities] = useState<Record<string, number>>({});
  const [stockLookupItem, setStockLookupItem] = useState<{ code: string; variantSku?: string } | null>(null);

  const canApprove = isHeadOffice && request?.status === "pending";
  const canReject = isHeadOffice && request?.status === "pending";

  // Build initial quantities from request items
  const initialQuantities = useMemo(() => {
    if (!request?.items) return {};
    const quantities: Record<string, number> = {};
    request.items.forEach((item) => {
      const apiItem = item as ApiRequestItem;
      const productId = apiItem.product || (typeof item.productId === "string" ? item.productId : (item.productId as any)?._id) || "";
      const key = item.variantSku ? `${productId}:${item.variantSku}` : productId;
      quantities[key] = apiItem.quantityRequested ?? item.quantity ?? 0;
    });
    return quantities;
  }, [request]);

  // Merge initial with user edits
  const effectiveQuantities = useMemo(() => {
    return { ...initialQuantities, ...approvalQuantities };
  }, [initialQuantities, approvalQuantities]);

  const handleQuantityChange = useCallback((productId: string, variantSku: string | undefined, value: number) => {
    const key = variantSku ? `${productId}:${variantSku}` : productId;
    setApprovalQuantities((prev) => ({ ...prev, [key]: Math.max(0, value) }));
  }, []);

  const handleApprove = useCallback(async () => {
    if (!request) return;

    const items: ApprovalItem[] = request.items.map((item) => {
      const apiItem = item as ApiRequestItem;
      const productId = apiItem.product || (typeof item.productId === "string" ? item.productId : (item.productId as any)?._id) || "";
      const key = item.variantSku ? `${productId}:${item.variantSku}` : productId;
      const requestedQty = apiItem.quantityRequested ?? item.quantity ?? 0;

      return {
        productId,
        variantSku: item.variantSku,
        quantityApproved: effectiveQuantities[key] ?? requestedQty,
      };
    });

    await actions.approve({
      id: request._id,
      items,
      reviewNotes: reviewNotes.trim() || undefined,
    });

    onOpenChange(false);
    setReviewNotes("");
    setApprovalQuantities({});
  }, [request, effectiveQuantities, reviewNotes, actions, onOpenChange]);

  const handleReject = useCallback(async () => {
    if (!request || !reviewNotes.trim()) return;
    await actions.reject({ id: request._id, reason: reviewNotes.trim() });
    onOpenChange(false);
    setReviewNotes("");
    setApprovalQuantities({});
  }, [request, reviewNotes, actions, onOpenChange]);

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-GB");
  };

  // Reset state when sheet closes
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setReviewNotes("");
        setApprovalQuantities({});
        setStockLookupItem(null);
      }
      onOpenChange(isOpen);
    },
    [onOpenChange]
  );

  const statusCfg = statusConfig[request?.status || ""] || { label: request?.status || "-", className: "" };
  const priorityCfg = priorityConfig[request?.priority || "normal"] || priorityConfig.normal;

  return (
    <>
      <SheetWrapper
        open={open}
        onOpenChange={handleOpenChange}
        title="Request Details"
        description={request?.requestNumber || "Stock Request"}
        size="lg"
      >
        {!request ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select a request to view details.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-lg font-semibold">{request.requestNumber}</span>
              <Badge variant="outline" className={cn("font-normal", statusCfg.className)}>
                {statusCfg.label}
              </Badge>
              <Badge variant="secondary" className={priorityCfg.className}>
                {priorityCfg.label}
              </Badge>
            </div>

            {/* Branch & Dates */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="Requesting Branch" value={getBranchName(request.requestingBranch)} />
              <DetailRow label="Fulfilling Branch" value={getBranchName(request.fulfillingBranch)} />
              <DetailRow label="Expected Date" value={request.expectedDate ? formatDate(request.expectedDate) : "-"} />
              <DetailRow label="Created" value={formatDate(request.createdAt)} />
              <DetailRow label="Updated" value={formatDate(request.updatedAt)} />
              {request.reason && <DetailRow label="Reason" value={request.reason} />}
            </div>

            {/* Notes */}
            {request.notes && (
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{request.notes}</p>
              </div>
            )}

            {/* Review Notes (if rejected/approved) */}
            {request.reviewNotes && (
              <div className="rounded-lg border border-border/60 bg-primary/5 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Review Notes</p>
                <p className="text-sm">{request.reviewNotes}</p>
              </div>
            )}

            {request.rejectionReason && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-destructive mb-1">Rejection Reason</p>
                <p className="text-sm">{request.rejectionReason}</p>
              </div>
            )}

            {/* Quantity Summary */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Requested:</span>{" "}
                <span className="font-semibold">{request.totalQuantityRequested ?? "-"}</span>
              </div>
              {(request.totalQuantityApproved ?? 0) > 0 && (
                <div>
                  <span className="text-muted-foreground">Approved:</span>{" "}
                  <span className="font-semibold text-primary">{request.totalQuantityApproved}</span>
                </div>
              )}
              {(request.totalQuantityFulfilled ?? 0) > 0 && (
                <div>
                  <span className="text-muted-foreground">Fulfilled:</span>{" "}
                  <span className="font-semibold text-success">{request.totalQuantityFulfilled}</span>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Items</h3>
                <Badge variant="outline">{request.items?.length || 0} items</Badge>
              </div>

              <div className="space-y-2">
                {request.items?.map((item, idx) => {
                  const product = getProductInfo(item as ApiRequestItem);
                  const key = product.variantSku ? `${product.id}:${product.variantSku}` : product.id;
                  const editableQty = effectiveQuantities[key] ?? product.quantityRequested;

                  // Format variant attributes nicely
                  const variantLabel = product.variantAttributes
                    ? Object.entries(product.variantAttributes)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")
                    : product.variantSku;

                  return (
                    <div key={idx} className="rounded-lg border border-border/60 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          {variantLabel && (
                            <p className="text-xs text-muted-foreground">{variantLabel}</p>
                          )}
                          {product.sku && (
                            <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => setStockLookupItem({ code: product.variantSku || product.sku, variantSku: product.variantSku })}
                        >
                          Check Stock
                        </Button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Requested:</span>
                          <span className="font-mono font-semibold">{product.quantityRequested}</span>
                        </div>

                        {product.currentStock !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Current Stock:</span>
                            <span className={cn(
                              "font-mono font-semibold",
                              product.currentStock === 0 ? "text-destructive" :
                              product.currentStock < product.quantityRequested ? "text-warning" : "text-success"
                            )}>
                              {product.currentStock}
                            </span>
                          </div>
                        )}

                        {canApprove ? (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Approve:</span>
                            <FormInput
                              name={`qty-${key}`}
                              type="number"
                              min={0}
                              max={product.quantityRequested}
                              value={editableQty}
                              onChange={(val) =>
                                handleQuantityChange(product.id, product.variantSku, parseInt(String(val)) || 0)
                              }
                              inputClassName="w-20 h-8 text-sm font-mono"
                            />
                          </div>
                        ) : (
                          <>
                            {(item.quantityApproved ?? item.approvedQuantity) !== undefined &&
                              (item.quantityApproved ?? item.approvedQuantity ?? 0) > 0 && (
                              <div>
                                <span className="text-muted-foreground">Approved:</span>{" "}
                                <span className="font-mono text-primary">
                                  {item.quantityApproved ?? item.approvedQuantity}
                                </span>
                              </div>
                            )}
                            {item.quantityFulfilled !== undefined && item.quantityFulfilled > 0 && (
                              <div>
                                <span className="text-muted-foreground">Fulfilled:</span>{" "}
                                <span className="font-mono text-success">{item.quantityFulfilled}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {item.notes && <p className="mt-2 text-xs text-muted-foreground">{item.notes}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Approval Actions */}
            {(canApprove || canReject) && (
              <div className="space-y-3 pt-4 border-t">
                <Textarea
                  placeholder={canApprove ? "Review notes (optional for approve, required for reject)" : "Rejection reason (required)"}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  {canApprove && (
                    <Button
                      onClick={handleApprove}
                      disabled={actions.isApproving}
                      className="flex-1"
                    >
                      {actions.isApproving ? "Approving..." : "Approve Request"}
                    </Button>
                  )}
                  {canReject && (
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={actions.isRejecting || !reviewNotes.trim()}
                      className="flex-1"
                    >
                      {actions.isRejecting ? "Rejecting..." : "Reject Request"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetWrapper>

      {/* Cross-Branch Stock Lookup */}
      <CrossBranchStockLookup
        open={!!stockLookupItem}
        onOpenChange={(isOpen) => !isOpen && setStockLookupItem(null)}
        code={stockLookupItem?.code}
        variantSku={stockLookupItem?.variantSku}
        token={token}
      />
    </>
  );
}
