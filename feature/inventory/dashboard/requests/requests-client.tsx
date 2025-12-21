"use client";

import { useMemo, useCallback, useState } from "react";
import { ClipboardList, Inbox } from "lucide-react";
import HeaderSection from "@/components/custom/dashboard/header-section";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { DataTable } from "@/components/custom/ui/data-table";
import { useBranch } from "@/contexts/BranchContext";
import { requestColumns } from "./request-columns";
import { useStockRequests, useStockRequestActions } from "@/hooks/query/useStockRequests";
import { RequestCreateDialog } from "./request-create-dialog";
import { ConfirmDialog } from "@/components/custom/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import type { StockRequest } from "@/types/inventory.types";

interface RequestsClientProps {
  token: string;
}

type RequestDialogState = { open: boolean; request: StockRequest | null };

export function RequestsClient({ token }: RequestsClientProps) {
  const { selectedBranch } = useBranch();
  const branchId = selectedBranch?._id;
  const isHeadOffice = selectedBranch?.role === "head_office";
  const [rejectDialog, setRejectDialog] = useState<RequestDialogState>({ open: false, request: null });
  const [rejectReason, setRejectReason] = useState("");
  const [fulfillDialog, setFulfillDialog] = useState<RequestDialogState>({ open: false, request: null });
  const [fulfillRemarks, setFulfillRemarks] = useState("");
  const [cancelDialog, setCancelDialog] = useState<RequestDialogState>({ open: false, request: null });
  const [cancelReason, setCancelReason] = useState("");

  const { requests, isLoading, isFetching, refetch } = useStockRequests(
    token,
    branchId ? { branchId } : undefined,
    { enabled: !!branchId }
  );

  const actions = useStockRequestActions(token);

  const onApprove = useCallback(
    async (r: StockRequest) => {
      await actions.approve({ id: r._id });
    },
    [actions]
  );

  const onReject = useCallback(
    async (r: StockRequest) => {
      setRejectReason("");
      setRejectDialog({ open: true, request: r });
    },
    []
  );

  const onFulfill = useCallback(
    async (r: StockRequest) => {
      setFulfillRemarks("");
      setFulfillDialog({ open: true, request: r });
    },
    []
  );

  const onCancel = useCallback(
    async (r: StockRequest) => {
      setCancelReason("");
      setCancelDialog({ open: true, request: r });
    },
    []
  );

  const cols = useMemo(
    () =>
      requestColumns({
        currentBranchId: branchId,
        isHeadOffice,
        onApprove,
        onReject,
        onFulfill,
        onCancel,
      }),
    [branchId, isHeadOffice, onApprove, onReject, onFulfill, onCancel]
  );

  const createDisabled = !selectedBranch || selectedBranch.role === "head_office";

  return (
    <div className="flex flex-col gap-3">
      <HeaderSection
        icon={Inbox}
        title="Stock Requests"
        variant="compact"
        description={selectedBranch ? `Branch: ${selectedBranch.name}` : "Select a branch"}
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

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isHeadOffice
            ? "Head office: approve/reject → fulfill (creates challan)"
            : "Sub-branch: create requests to head office"}
        </div>
        <RequestCreateDialog token={token} disabled={createDisabled} />
      </div>

      <ErrorBoundaryWrapper>
        <DataTable columns={cols} data={requests} isLoading={isLoading} className="h-[70dvh] rounded-lg" />
      </ErrorBoundaryWrapper>

      <ConfirmDialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog((s) => ({ ...s, open }))}
        title="Reject Request"
        description="Provide a rejection reason for the branch."
        confirmText="Reject"
        variant="destructive"
        isLoading={actions.isRejecting}
        onConfirm={async () => {
          const r = rejectDialog.request;
          const reason = rejectReason.trim();
          if (!r?._id || !reason) return;
          await actions.reject({ id: r._id, reason });
          setRejectDialog({ open: false, request: null });
        }}
      >
        <Input
          placeholder="Rejection reason (required)"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={fulfillDialog.open}
        onOpenChange={(open) => setFulfillDialog((s) => ({ ...s, open }))}
        title="Fulfill Request"
        description="This will create a transfer (challan) from head office."
        confirmText="Fulfill"
        variant="default"
        isLoading={actions.isFulfilling}
        onConfirm={async () => {
          const r = fulfillDialog.request;
          if (!r?._id) return;
          await actions.fulfill({ id: r._id, remarks: fulfillRemarks.trim() || undefined });
          setFulfillDialog({ open: false, request: null });
        }}
      >
        <Input
          placeholder="Remarks (optional)"
          value={fulfillRemarks}
          onChange={(e) => setFulfillRemarks(e.target.value)}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog((s) => ({ ...s, open }))}
        title="Cancel Request"
        description="Cancels the request (pending only)."
        confirmText="Cancel Request"
        variant="destructive"
        isLoading={actions.isCancelling}
        onConfirm={async () => {
          const r = cancelDialog.request;
          if (!r?._id) return;
          await actions.cancel({ id: r._id, reason: cancelReason.trim() || undefined });
          setCancelDialog({ open: false, request: null });
        }}
      >
        <Input
          placeholder="Cancel reason (optional)"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </ConfirmDialog>
    </div>
  );
}
