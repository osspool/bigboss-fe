"use client";

import { useMemo, useCallback, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, ShoppingBag, Filter, Printer } from "lucide-react";
import { toast } from "sonner";
import { HeaderSection } from "@classytic/clarity/dashboard";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { DataTable } from "@classytic/clarity";
import { useBranch } from "@/contexts/BranchContext";
import { PurchaseCreateDialog } from "./purchase-create-dialog";
import { PurchaseDetailSheet } from "./purchase-detail-sheet";
import { usePurchases, usePurchaseStateActions } from "@/hooks/query";
import { useSuppliers } from "@/hooks/query";
import { purchaseColumns } from "./purchase-columns";
import { printDocument } from "@/lib/utils/print-utils";
import { formatPrice } from "@/lib/constants";
import { getSupplierInfo } from "@/lib/commerce-utils";
import type { Purchase } from "@/types";
import type { Supplier } from "@/types";
import { SelectInput } from "@classytic/clarity";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PurchasesClientProps {
  token: string;
}

// Use __all__ as placeholder since Radix Select reserves "" for clearing
const ALL_VALUE = "__all__";

const STATUS_OPTIONS = [
  { value: ALL_VALUE, label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: ALL_VALUE, label: "All Payment" },
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

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

const statusLabels: Record<string, string> = {
  draft: "Draft",
  approved: "Approved",
  received: "Received",
  cancelled: "Cancelled",
};

const paymentLabels: Record<string, string> = {
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
};

export function PurchasesClient({ token }: PurchasesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedBranch } = useBranch();
  const isHeadOffice = selectedBranch?.role === "head_office";
  const printRef = useRef<HTMLDivElement>(null);

  // Filter states from URL
  const status = searchParams.get("status") || "";
  const paymentStatus = searchParams.get("paymentStatus") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  // Build API params
  const apiParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: currentPage,
      limit: 15,
    };
    if (status) params.status = status;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    return params;
  }, [status, paymentStatus, currentPage]);

  const { items: purchases = [], pagination, isLoading, isFetching, refetch } = usePurchases(
    token,
    apiParams
  );

  // Fetch suppliers for detail sheet (reuses same query as PurchaseCreateDialog)
  const { items: suppliers = [] } = useSuppliers(token, { isActive: true, limit: 100 });

  const { receive, pay, cancel, isReceiving, isPaying, isCancelling } = usePurchaseStateActions(token);

  // Detail sheet state
  const [detailSheet, setDetailSheet] = useState<{ open: boolean; purchase: Purchase | null }>({
    open: false,
    purchase: null,
  });

  // Payment dialog state
  const [payDialog, setPayDialog] = useState<{ open: boolean; purchase: Purchase | null }>({
    open: false,
    purchase: null,
  });
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [payReference, setPayReference] = useState("");

  // Update URL with filters (convert __all__ to empty/delete)
  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      const actualValue = value === ALL_VALUE ? "" : value;
      if (actualValue) {
        params.set(key, actualValue);
      } else {
        params.delete(key);
      }
      params.delete("page"); // Reset page on filter change
      router.push(`/dashboard/inventory/purchases?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      router.push(`/dashboard/inventory/purchases?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // View handler
  const handleView = useCallback((purchase: Purchase) => {
    setDetailSheet({ open: true, purchase });
  }, []);

  // Action handlers
  const handleReceive = useCallback(
    async (purchase: Purchase) => {
      if (!confirm(`Receive purchase "${purchase.invoiceNumber}"? This will add stock.`)) return;
      try {
        await receive.mutateAsync(purchase._id);
      } catch (err) {
        // Error handled by hook
      }
    },
    [receive]
  );

  const handlePayClick = useCallback((purchase: Purchase) => {
    setPayAmount(String(purchase.dueAmount || 0));
    setPayMethod("cash");
    setPayReference("");
    setPayDialog({ open: true, purchase });
  }, []);

  const handlePaySubmit = useCallback(async () => {
    if (!payDialog.purchase) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await pay.mutateAsync({
        id: payDialog.purchase._id,
        amount,
        method: payMethod,
        reference: payReference.trim() || undefined,
      });
      setPayDialog({ open: false, purchase: null });
    } catch (err) {
      // Error handled by hook
    }
  }, [payDialog.purchase, payAmount, payMethod, payReference, pay]);

  const handleCancel = useCallback(
    async (purchase: Purchase) => {
      const reason = prompt(`Cancel purchase "${purchase.invoiceNumber}"? Enter reason:`);
      if (reason === null) return; // User cancelled prompt
      try {
        await cancel.mutateAsync({ id: purchase._id, reason: reason || undefined });
      } catch (err) {
        // Error handled by hook
      }
    },
    [cancel]
  );

  const columns = useMemo(
    () =>
      purchaseColumns({
        onView: handleView,
        onReceive: isHeadOffice ? handleReceive : undefined,
        onPay: isHeadOffice ? handlePayClick : undefined,
        onCancel: isHeadOffice ? handleCancel : undefined,
      }),
    [isHeadOffice, handleView, handleReceive, handlePayClick, handleCancel]
  );

  const isActioning = isReceiving || isPaying || isCancelling;

  // Print table handler
  const handlePrintTable = useCallback(() => {
    if (printRef.current && purchases.length > 0) {
      printDocument(printRef.current, "Purchases Report");
    }
  }, [purchases]);

  return (
    <div className="flex flex-col gap-3">
      <HeaderSection
        icon={ShoppingBag}
        title="Purchases"
        variant="compact"
        description="Supplier invoices and stock entry (Head Office)"
        actions={[
          {
            icon: Printer,
            text: "Print",
            variant: "outline",
            size: "sm",
            onClick: handlePrintTable,
            disabled: purchases.length === 0,
          },
          {
            icon: ClipboardList,
            text: isFetching ? "Refreshing..." : "Refresh",
            variant: "outline",
            size: "sm",
            onClick: () => refetch(),
          },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        <SelectInput
          name="status"
          label=""
          items={STATUS_OPTIONS}
          value={status || ALL_VALUE}
          onValueChange={(v) => updateFilters("status", v)}
          placeholder="Status"
          className="w-[140px]"
        />
        <SelectInput
          name="paymentStatus"
          label=""
          items={PAYMENT_STATUS_OPTIONS}
          value={paymentStatus || ALL_VALUE}
          onValueChange={(v) => updateFilters("paymentStatus", v)}
          placeholder="Payment"
          className="w-[140px]"
        />
        <div className="flex-1" />
        <PurchaseCreateDialog token={token} disabled={!isHeadOffice || isActioning} />
      </div>

      <ErrorBoundaryWrapper>
        <DataTable
          columns={columns}
          data={purchases}
          isLoading={isLoading}
          pagination={{
            total: pagination?.total || 0,
            limit: pagination?.limit || 15,
            page: pagination?.page || currentPage,
            pages: pagination?.pages || 1,
            hasNext: pagination?.hasNext || false,
            hasPrev: pagination?.hasPrev || false,
            onPageChange: handlePageChange,
          }}
          className="h-[70dvh] rounded-lg"
        />
      </ErrorBoundaryWrapper>

      {/* Payment Dialog */}
      <Dialog open={payDialog.open} onOpenChange={(open: boolean) => setPayDialog({ open, purchase: open ? payDialog.purchase : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Invoice</Label>
              <div className="font-mono text-sm">{payDialog.purchase?.invoiceNumber}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Amount</Label>
                <div className="font-mono">৳{(payDialog.purchase?.dueAmount || 0).toLocaleString()}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payAmount">Pay Amount</Label>
                <Input
                  id="payAmount"
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payReference">Reference (optional)</Label>
              <Input
                id="payReference"
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
                placeholder="Transaction/reference ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <SelectInput
                name="payMethod"
                label=""
                items={[
                  { value: "cash", label: "Cash" },
                  { value: "bank_transfer", label: "Bank Transfer" },
                  { value: "bkash", label: "bKash" },
                  { value: "nagad", label: "Nagad" },
                  { value: "rocket", label: "Rocket" },
                ]}
                value={payMethod}
                onValueChange={setPayMethod}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialog({ open: false, purchase: null })}>
              Cancel
            </Button>
            <Button onClick={handlePaySubmit} disabled={isPaying}>
              {isPaying ? "Processing..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Detail Sheet */}
      <PurchaseDetailSheet
        open={detailSheet.open}
        onOpenChange={(open) => setDetailSheet({ open, purchase: open ? detailSheet.purchase : null })}
        purchase={detailSheet.purchase}
        suppliers={suppliers as Supplier[]}
        isHeadOffice={isHeadOffice}
        onReceive={handleReceive}
        onPay={handlePayClick}
        onCancel={handleCancel}
        isReceiving={isReceiving}
        isPaying={isPaying}
        isCancelling={isCancelling}
      />

      {/* Hidden Print Content */}
      <div className="sr-only">
        <div ref={printRef}>
          <div className="print-header">
            <h1>Purchases Report</h1>
            <div className="subtitle">
              {status && `Status: ${statusLabels[status] || status}`}
              {status && paymentStatus && " | "}
              {paymentStatus && `Payment: ${paymentLabels[paymentStatus] || paymentStatus}`}
              {!status && !paymentStatus && "All Purchases"}
            </div>
          </div>

          <div className="print-meta">
            <div>Total: {pagination?.total || purchases.length} purchases</div>
            <div>Page {pagination?.page || 1} of {pagination?.pages || 1}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>PO #</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th className="text-right">Total</th>
                <th className="text-right">Paid</th>
                <th className="text-right">Due</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => {
                const supplierInfo = getSupplierInfo(p.supplier, suppliers as Supplier[]);
                return (
                  <tr key={p._id}>
                    <td className="font-mono">{p.invoiceNumber}</td>
                    <td className="font-mono">{p.purchaseOrderNumber || "-"}</td>
                    <td>{supplierInfo.name}</td>
                    <td>{formatDate(p.invoiceDate || p.createdAt)}</td>
                    <td>
                      <span className={`badge badge-${p.status === "received" ? "success" : p.status === "cancelled" ? "danger" : "default"}`}>
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${p.paymentStatus === "paid" ? "success" : p.paymentStatus === "unpaid" ? "warning" : "default"}`}>
                        {paymentLabels[p.paymentStatus] || p.paymentStatus}
                      </span>
                    </td>
                    <td className="text-right font-mono">{formatPrice(p.grandTotal)}</td>
                    <td className="text-right font-mono text-success">{formatPrice(p.paidAmount || 0)}</td>
                    <td className="text-right font-mono text-warning font-bold">{formatPrice(p.dueAmount || 0)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className="text-right font-bold">Page Totals:</td>
                <td className="text-right font-mono font-bold">
                  {formatPrice(purchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0))}
                </td>
                <td className="text-right font-mono text-success font-bold">
                  {formatPrice(purchases.reduce((sum, p) => sum + (p.paidAmount || 0), 0))}
                </td>
                <td className="text-right font-mono text-warning font-bold">
                  {formatPrice(purchases.reduce((sum, p) => sum + (p.dueAmount || 0), 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
