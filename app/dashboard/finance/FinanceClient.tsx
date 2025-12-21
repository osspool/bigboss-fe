"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useFinanceSummary } from "@/hooks/query/useFinance";
import { useBranches } from "@/hooks/query/useBranches";
import {
  FinanceSummaryCard,
  FinanceExportButton,
  FinanceFilters,
  MethodBreakdown,
  DailyBreakdown,
} from "@/feature/finance/components";
import type { FinanceSummaryParams } from "@/types/finance.types";

export default function FinanceClient() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken || "";

  // Initialize with last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [filters, setFilters] = useState<FinanceSummaryParams>({
    startDate:
      thirtyDaysAgo.toISOString().split("T")[0] + "T00:00:00.000Z",
    endDate: today.toISOString().split("T")[0] + "T23:59:59.999Z",
  });

  // Fetch branches for filter
  const { items: branches = [] } = useBranches(token, {
    limit: 100,
  });

  // Fetch finance summary
  const { data: summaryData, isLoading } = useFinanceSummary(token, filters);

  const summary = summaryData?.data;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FinanceFilters
        filters={filters}
        onFilterChange={setFilters}
        branches={branches}
      />

      {/* Export Button */}
      <div className="flex justify-end">
        <FinanceExportButton
          token={token}
          params={filters}
          format="csv"
          disabled={isLoading || !summary}
        />
      </div>

      {/* Summary Cards */}
      {summary?.totals && (
        <FinanceSummaryCard totals={summary.totals} isLoading={isLoading} />
      )}

      {/* Method Breakdown */}
      {summary?.byMethod && (
        <MethodBreakdown
          data={summary.byMethod}
          currency={summary.totals?.currency}
          isLoading={isLoading}
        />
      )}

      {/* Daily Breakdown */}
      {summary?.byDay && (
        <DailyBreakdown
          data={summary.byDay}
          currency={summary.totals?.currency}
          isLoading={isLoading}
        />
      )}

      {/* Empty State */}
      {!isLoading && !summary && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No financial data available for the selected period
          </p>
        </div>
      )}
    </div>
  );
}
