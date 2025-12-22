"use client";

import { useMemo } from "react";
import { ClipboardList, ShoppingBag } from "lucide-react";
import HeaderSection from "@/components/custom/dashboard/header-section";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { DataTable } from "@/components/custom/ui/data-table";
import { useBranch } from "@/contexts/BranchContext";
import { PurchaseCreateDialog } from "./purchase-create-dialog";
import { usePurchaseHistory } from "@/hooks/query/usePurchases";
import { movementColumns, type MovementRow } from "../movements/movement-columns";

interface PurchasesClientProps {
  token: string;
}

export function PurchasesClient({ token }: PurchasesClientProps) {
  const { selectedBranch } = useBranch();
  const branchId = selectedBranch?._id;
  const isHeadOffice = selectedBranch?.role === "head_office";

  const { history, isLoading, isFetching, refetch } = usePurchaseHistory(
    token,
    branchId ? { branchId } : undefined,
    { enabled: !!branchId }
  );
  const columns = useMemo(() => movementColumns({ onView: () => {} }), []);
  const rows = history as MovementRow[];

  return (
    <div className="flex flex-col gap-3">
      <HeaderSection
        icon={ShoppingBag}
        title="Purchases"
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
          Head office only: record supplier purchases (adds stock).
        </div>
        <PurchaseCreateDialog token={token} disabled={!isHeadOffice} />
      </div>

      <ErrorBoundaryWrapper>
        <DataTable columns={columns} data={rows} isLoading={isLoading} className="h-[70dvh] rounded-lg" />
      </ErrorBoundaryWrapper>
    </div>
  );
}
