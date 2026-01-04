"use client";

import { useMemo, useCallback, useState } from "react";
import { Truck, ClipboardList } from "lucide-react";
import { HeaderSection } from "@classytic/clarity/dashboard";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { DataTable, ConfirmDialog } from "@classytic/clarity";
import { useBranch } from "@/contexts/BranchContext";
import { transferColumns } from "./transfer-columns";
import { useTransfers, useTransferStateActions } from "@/hooks/query";
import { useTransferStats } from "@/hooks/query";
import { TransferCreateDialog } from "./transfer-create-dialog";
import { TransferStatsCards } from "./TransferStatsCards";
import { ChallanPrintView } from "./ChallanPrintView";
import { CartonLabelPrintView } from "./CartonLabelPrintView";
import { TransferDetailSheet } from "./transfer-detail-sheet";
import { Input } from "@/components/ui/input";
import type { Transfer } from "@/types";

interface TransfersClientProps {
  token: string;
}

type TransferDialogState = { open: boolean; transfer: Transfer | null };

export function TransfersClient({ token }: TransfersClientProps) {
  const { selectedBranch } = useBranch();
  const branchId = selectedBranch?._id;
  const [dispatchDialog, setDispatchDialog] = useState<TransferDialogState>({ open: false, transfer: null });
  const [dispatchVehicleNumber, setDispatchVehicleNumber] = useState("");
  const [receiveDialog, setReceiveDialog] = useState<TransferDialogState>({ open: false, transfer: null });
  const [cancelDialog, setCancelDialog] = useState<TransferDialogState>({ open: false, transfer: null });
  const [cancelReason, setCancelReason] = useState("");
  const [printDialog, setPrintDialog] = useState<TransferDialogState>({ open: false, transfer: null });
  const [cartonLabelDialog, setCartonLabelDialog] = useState<TransferDialogState>({ open: false, transfer: null });
  const [detailSheet, setDetailSheet] = useState<TransferDialogState>({ open: false, transfer: null });

  const transferParams = useMemo(() => {
    if (!branchId) return undefined;
    if (selectedBranch?.role === "head_office") {
      return { senderBranch: branchId };
    }
    return { receiverBranch: branchId };
  }, [branchId, selectedBranch?.role]);

  const { items: transfers, isLoading, isFetching, refetch } = useTransfers(
    token,
    transferParams,
    { enabled: !!branchId }
  );

  const { data: stats, isLoading: statsLoading } = useTransferStats(
    token,
    branchId,
    { enabled: !!branchId }
  );

  const actions = useTransferStateActions(token);

  const onApprove = useCallback(
    async (t: Transfer) => {
      await actions.approve(t._id);
    },
    [actions]
  );

  const onDispatch = useCallback(
    async (t: Transfer) => {
      setDispatchVehicleNumber("");
      setDispatchDialog({ open: true, transfer: t });
    },
    []
  );

  const onMarkInTransit = useCallback(
    async (t: Transfer) => {
      await actions.inTransit(t._id);
    },
    [actions]
  );

  const onReceive = useCallback(
    async (t: Transfer) => {
      setReceiveDialog({ open: true, transfer: t });
    },
    []
  );

  const onCancel = useCallback(
    async (t: Transfer) => {
      setCancelReason("");
      setCancelDialog({ open: true, transfer: t });
    },
    []
  );

  const onPrint = useCallback((t: Transfer) => {
    setPrintDialog({ open: true, transfer: t });
  }, []);

  const onPrintCartonLabels = useCallback((t: Transfer) => {
    setCartonLabelDialog({ open: true, transfer: t });
  }, []);

  const onView = useCallback((t: Transfer) => {
    setDetailSheet({ open: true, transfer: t });
  }, []);

  const cols = useMemo(
    () =>
      transferColumns({
        currentBranchId: branchId,
        onView,
        onApprove,
        onDispatch,
        onMarkInTransit,
        onReceive,
        onCancel,
        onPrint,
        onPrintCartonLabels,
      }),
    [branchId, onView, onApprove, onDispatch, onMarkInTransit, onReceive, onCancel, onPrint, onPrintCartonLabels]
  );

  const createDisabled = !selectedBranch || selectedBranch.role !== "head_office";

  return (
    <div className="flex flex-col gap-4">
      <HeaderSection
        icon={Truck}
        title="Transfers (Challan)"
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

      <TransferStatsCards stats={stats} isLoading={statsLoading} />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedBranch?.role === "head_office"
            ? "Head office: create → approve → dispatch"
            : "Sub-branch: receive transfers, request stock"}
        </div>
        <TransferCreateDialog token={token} disabled={createDisabled} />
      </div>

      <ErrorBoundaryWrapper>
        <DataTable columns={cols} data={transfers} isLoading={isLoading} className="h-[70dvh] rounded-lg" />
      </ErrorBoundaryWrapper>

      <ConfirmDialog
        open={dispatchDialog.open}
        onOpenChange={(open) => setDispatchDialog((s) => ({ ...s, open }))}
        title="Dispatch Transfer"
        description="Add transport details (optional) and dispatch this challan."
        confirmText="Dispatch"
        variant="default"
        isLoading={actions.isDispatching}
        onConfirm={async () => {
          const t = dispatchDialog.transfer;
          if (!t?._id) return;
          const vehicleNumber = dispatchVehicleNumber.trim() || undefined;
          await actions.dispatch({
            id: t._id,
            data: { transport: vehicleNumber ? { vehicleNumber } : undefined },
          });
          setDispatchDialog({ open: false, transfer: null });
        }}
      >
        <Input
          placeholder="Vehicle number (optional)"
          value={dispatchVehicleNumber}
          onChange={(e) => setDispatchVehicleNumber(e.target.value)}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={receiveDialog.open}
        onOpenChange={(open) => setReceiveDialog((s) => ({ ...s, open }))}
        title="Receive Transfer"
        description="This will mark the challan as received (full receipt)."
        confirmText="Receive"
        variant="default"
        isLoading={actions.isReceiving}
        onConfirm={async () => {
          const t = receiveDialog.transfer;
          if (!t?._id) return;
          await actions.receive({ id: t._id, data: {} });
          setReceiveDialog({ open: false, transfer: null });
        }}
      />

      <ConfirmDialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog((s) => ({ ...s, open }))}
        title="Cancel Transfer"
        description="Cancels the challan (only allowed for draft/approved)."
        confirmText="Cancel Transfer"
        variant="destructive"
        isLoading={actions.isCancelling}
        onConfirm={async () => {
          const t = cancelDialog.transfer;
          if (!t?._id) return;
          await actions.cancel({ id: t._id, reason: cancelReason.trim() || undefined });
          setCancelDialog({ open: false, transfer: null });
        }}
      >
        <Input
          placeholder="Cancel reason (optional)"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </ConfirmDialog>

      <ChallanPrintView
        transfer={printDialog.transfer}
        open={printDialog.open}
        onOpenChange={(open) => setPrintDialog((s) => ({ ...s, open }))}
      />

      <CartonLabelPrintView
        transfer={cartonLabelDialog.transfer}
        open={cartonLabelDialog.open}
        onOpenChange={(open) => setCartonLabelDialog((s) => ({ ...s, open }))}
      />

      <TransferDetailSheet
        transfer={detailSheet.transfer}
        open={detailSheet.open}
        onOpenChange={(open) => setDetailSheet((s) => ({ ...s, open }))}
      />
    </div>
  );
}
