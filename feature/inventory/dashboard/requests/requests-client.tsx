"use client";

import { useMemo, useCallback, useState } from "react";
import { ClipboardList, Inbox } from "lucide-react";
import { HeaderSection } from "@classytic/clarity/dashboard";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { DataTable, ConfirmDialog } from "@classytic/clarity";
import { useBranch } from "@/contexts/BranchContext";
import { requestColumns } from "./request-columns";
import { useStockRequests, useStockRequestActions } from "@/hooks/query";
import { RequestCreateDialog } from "./request-create-dialog";
import { RequestDetailSheet } from "./request-detail-sheet";
import { FulfillRequestSheet } from "./fulfill-request-sheet";
import { Input } from "@/components/ui/input";
import type { StockRequest } from "@/types";

interface RequestsClientProps {
  token: string;
}

type RequestDialogState = { open: boolean; request: StockRequest | null };
type RequestSheetState = { open: boolean; request: StockRequest | null };

export function RequestsClient({ token }: RequestsClientProps) {
  const { selectedBranch } = useBranch();
  const branchId = selectedBranch?._id;
  const isHeadOffice = selectedBranch?.role === "head_office";
  const [detailSheet, setDetailSheet] = useState<RequestSheetState>({ open: false, request: null });
  const [fulfillSheet, setFulfillSheet] = useState<RequestSheetState>({ open: false, request: null });
  const [cancelDialog, setCancelDialog] = useState<RequestDialogState>({ open: false, request: null });
  const [cancelReason, setCancelReason] = useState("");

  const requestParams = useMemo(() => {
    if (!branchId) return undefined;
    if (isHeadOffice) {
      return { fulfillingBranch: branchId };
    }
    return { requestingBranch: branchId };
  }, [branchId, isHeadOffice]);

  const { requests, isLoading, isFetching, refetch } = useStockRequests(
    token,
    requestParams,
    { enabled: !!branchId }
  );

  const actions = useStockRequestActions(token);

  const onView = useCallback((r: StockRequest) => {
    setDetailSheet({ open: true, request: r });
  }, []);

  const onFulfill = useCallback((r: StockRequest) => {
    setFulfillSheet({ open: true, request: r });
  }, []);

  const onCancel = useCallback((r: StockRequest) => {
    setCancelReason("");
    setCancelDialog({ open: true, request: r });
  }, []);

  const cols = useMemo(
    () =>
      requestColumns({
        currentBranchId: branchId,
        isHeadOffice,
        onView,
        onApprove: onView, // Approve now opens detail sheet for quantity editing
        onReject: onView,  // Reject now opens detail sheet
        onFulfill,
        onCancel,
      }),
    [branchId, isHeadOffice, onView, onFulfill, onCancel]
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

      <RequestDetailSheet
        open={detailSheet.open}
        onOpenChange={(open) => setDetailSheet((s) => ({ ...s, open }))}
        request={detailSheet.request}
        token={token}
        isHeadOffice={isHeadOffice}
      />

      <FulfillRequestSheet
        open={fulfillSheet.open}
        onOpenChange={(open) => setFulfillSheet((s) => ({ ...s, open }))}
        request={fulfillSheet.request}
        token={token}
      />

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
