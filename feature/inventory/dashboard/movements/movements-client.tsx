"use client";

import { ClipboardList, ScrollText } from "lucide-react";
import HeaderSection from "@/components/custom/dashboard/header-section";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { DataTable } from "@/components/custom/ui/data-table";
import { useBranch } from "@/contexts/BranchContext";
import { useMovements } from "@/hooks/query/useMovements";
import { movementColumns } from "./movement-columns";

interface MovementsClientProps {
  token: string;
}

export function MovementsClient({ token }: MovementsClientProps) {
  const { selectedBranch } = useBranch();
  const branchId = selectedBranch?._id;

  const { movements, isLoading, isFetching, refetch } = useMovements(
    token,
    branchId ? { branchId } : undefined,
    { enabled: !!branchId }
  );

  return (
    <div className="flex flex-col gap-3">
      <HeaderSection
        icon={ScrollText}
        title="Stock Movements"
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

      <ErrorBoundaryWrapper>
        <DataTable columns={movementColumns} data={movements} isLoading={isLoading} className="h-[70dvh] rounded-lg" />
      </ErrorBoundaryWrapper>
    </div>
  );
}
