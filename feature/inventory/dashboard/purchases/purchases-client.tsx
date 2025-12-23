"use client";

import { useMemo, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, ShoppingBag, Filter } from "lucide-react";
import { toast } from "sonner";
import HeaderSection from "@/components/custom/dashboard/header-section";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { DataTable } from "@/components/custom/ui/data-table";
import { useBranch } from "@/contexts/BranchContext";
import { PurchaseCreateDialog } from "./purchase-create-dialog";
import { usePurchases, usePurchaseActions } from "@/hooks/query/usePurchases";
import { purchaseColumns } from "./purchase-columns";
import type { Purchase } from "@/types/inventory.types";
import SelectInput from "@/components/form/form-utils/select-input";
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

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "", label: "All Payment" },
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

export function PurchasesClient({ token }: PurchasesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedBranch } = useBranch();
  const isHeadOffice = selectedBranch?.role === "head_office";

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

  const { receive, pay, cancel, isReceiving, isPaying, isCancelling } = usePurchaseActions(token);

  // Payment dialog state
  const [payDialog, setPayDialog] = useState<{ open: boolean; purchase: Purchase | null }>({
    open: false,
    purchase: null,
  });
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");

  // Update URL with filters
  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
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
      });
      setPayDialog({ open: false, purchase: null });
    } catch (err) {
      // Error handled by hook
    }
  }, [payDialog.purchase, payAmount, payMethod, pay]);

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
        onReceive: isHeadOffice ? handleReceive : undefined,
        onPay: isHeadOffice ? handlePayClick : undefined,
        onCancel: isHeadOffice ? handleCancel : undefined,
      }),
    [isHeadOffice, handleReceive, handlePayClick, handleCancel]
  );

  const isActioning = isReceiving || isPaying || isCancelling;

  return (
    <div className="flex flex-col gap-3">
      <HeaderSection
        icon={ShoppingBag}
        title="Purchases"
        variant="compact"
        description="Supplier invoices and stock entry (Head Office)"
        actions={[
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
          value={status}
          onValueChange={(v) => updateFilters("status", v)}
          placeholder="Status"
          className="w-[140px]"
        />
        <SelectInput
          name="paymentStatus"
          label=""
          items={PAYMENT_STATUS_OPTIONS}
          value={paymentStatus}
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
      <Dialog open={payDialog.open} onOpenChange={(open) => setPayDialog({ open, purchase: open ? payDialog.purchase : null })}>
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
    </div>
  );
}
