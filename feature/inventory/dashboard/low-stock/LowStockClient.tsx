"use client";

import { useMemo } from "react";
import { AlertTriangle, ClipboardList, TrendingDown } from "lucide-react";
import HeaderSection from "@/components/custom/dashboard/header-section";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { DataTable } from "@/components/custom/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBranch } from "@/contexts/BranchContext";
import { useLowStock } from "@/hooks/query/useLowStock";
import { lowStockColumns } from "./low-stock-columns";
import { cn } from "@/lib/utils";

interface LowStockClientProps {
  token: string;
}

export function LowStockClient({ token }: LowStockClientProps) {
  const { selectedBranch } = useBranch();
  const branchId = selectedBranch?._id;

  const { items, isLoading, isFetching, refetch } = useLowStock(
    token,
    branchId ? { branchId } : undefined,
    { enabled: !!branchId }
  );

  // Calculate stats
  const stats = useMemo(() => {
    const outOfStock = items.filter((i) => i.quantity === 0).length;
    const critical = items.filter((i) => {
      const percentage = (i.quantity / i.reorderPoint) * 100;
      return i.quantity > 0 && percentage < 25;
    }).length;
    const low = items.filter((i) => {
      const percentage = (i.quantity / i.reorderPoint) * 100;
      return percentage >= 25 && percentage < 50;
    }).length;

    return {
      total: items.length,
      outOfStock,
      critical,
      low,
    };
  }, [items]);

  if (!selectedBranch) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <AlertTriangle className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold">No Branch Selected</h3>
        <p className="text-muted-foreground">
          Please select a branch to view low stock alerts
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <HeaderSection
        icon={AlertTriangle}
        title="Low Stock Alerts"
        variant="compact"
        description={`Stock levels below reorder point for ${selectedBranch.name}`}
        badge={
          <Badge variant="outline" className="ml-2">
            {selectedBranch.code}
          </Badge>
        }
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {isLoading ? "-" : stats.total}
                </p>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning/10 text-warning">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            stats.outOfStock > 0 && "border-destructive/50"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight text-destructive">
                  {isLoading ? "-" : stats.outOfStock}
                </p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/10 text-destructive">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            stats.critical > 0 && "border-orange-500/50"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight text-orange-500">
                  {isLoading ? "-" : stats.critical}
                </p>
                <p className="text-sm text-muted-foreground">Critical (&lt;25%)</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500/10 text-orange-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight text-warning">
                  {isLoading ? "-" : stats.low}
                </p>
                <p className="text-sm text-muted-foreground">Low (25-50%)</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning/10 text-warning">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Use stock requests to replenish inventory from head office, or create
          transfers to redistribute stock between branches.
        </p>
      </div>

      {/* Low Stock Table */}
      <ErrorBoundaryWrapper>
        <DataTable
          columns={lowStockColumns}
          data={items}
          isLoading={isLoading}
          className="h-[60dvh] rounded-lg"
        />
      </ErrorBoundaryWrapper>
    </div>
  );
}
