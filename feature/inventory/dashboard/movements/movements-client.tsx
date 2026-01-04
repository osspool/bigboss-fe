"use client";

import { useCallback, useState } from "react";
import { ClipboardList, ScrollText } from "lucide-react";
import { HeaderSection } from "@classytic/clarity/dashboard";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { DataTable } from "@classytic/clarity";
import { useBranch } from "@/contexts/BranchContext";
import { useMovements } from "@/hooks/query";
import { movementColumns, type MovementRow } from "./movement-columns";
import { MovementDetailSheet } from "./movement-detail-sheet";

interface MovementsClientProps {
  token: string;
}

export function MovementsClient({ token }: MovementsClientProps) {
  const { selectedBranch } = useBranch();
  const branchId = selectedBranch?._id;
  const [selectedMovement, setSelectedMovement] = useState<MovementRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { movements, isLoading, isFetching, refetch } = useMovements(
    token,
    branchId ? { branchId } : undefined,
    { enabled: !!branchId }
  );

  const handleView = useCallback((movement: MovementRow) => {
    setSelectedMovement(movement);
    setIsDetailOpen(true);
  }, []);

  const handleDetailChange = useCallback((open: boolean) => {
    setIsDetailOpen(open);
    if (!open) {
      setSelectedMovement(null);
    }
  }, []);

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
        <DataTable
          columns={movementColumns({ onView: handleView })}
          data={movements}
          isLoading={isLoading}
          className="h-[70dvh] rounded-lg"
        />
      </ErrorBoundaryWrapper>
      <MovementDetailSheet
        open={isDetailOpen}
        onOpenChange={handleDetailChange}
        movement={selectedMovement}
      />
    </div>
  );
}
