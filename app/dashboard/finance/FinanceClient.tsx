"use client";

import { useState } from "react";
import { useBranches } from "@/hooks/query";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { financeApi } from "@classytic/commerce-sdk/finance";
import {
  FinanceSummaryCard,
  FinanceExportButton,
  FinanceFilters,
  MethodBreakdown,
  DailyBreakdown,
} from "@/feature/finance/components";
import type {
  FinanceSummaryParams,
  FinanceSummary,
  FinanceByMethod,
  FinanceByDay,
  FinanceTotals,
} from "@/types";

interface FinanceClientProps {
  token: string;
}

// Transform API response to match component types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformApiResponse(apiData: any): FinanceSummary {
  // Transform totals
  const totals: FinanceTotals = {
    income: apiData.totals?.incomeBdt ?? 0,
    expense: apiData.totals?.expenseBdt ?? 0,
    net: apiData.totals?.netBdt ?? 0,
    count: apiData.totals?.count ?? 0,
    currency: "BDT",
  };

  // Transform byMethod (object to array)
  const byMethod: FinanceByMethod[] = apiData.byMethod
    ? Object.entries(apiData.byMethod).map(([method, data]: [string, any]) => ({
        method,
        income: data.incomeBdt ?? 0,
        expense: data.expenseBdt ?? 0,
        net: data.netBdt ?? 0,
        count: data.count ?? 0,
      }))
    : [];

  // Transform byDay
  const byDay: FinanceByDay[] = apiData.byDay
    ? apiData.byDay.map((day: any) => ({
        date: day.dateKey,
        branchCode: day.branchCode,
        branchName: day.branchName,
        branchId: day.branchId,
        income: day.totals?.incomeBdt ?? 0,
        expense: day.totals?.expenseBdt ?? 0,
        net: day.totals?.netBdt ?? 0,
        count: day.totals?.count ?? 0,
        byMethod: day.byMethod
          ? Object.entries(day.byMethod).map(([method, data]: [string, any]) => ({
              method,
              income: data.incomeBdt ?? 0,
              expense: data.expenseBdt ?? 0,
              net: data.netBdt ?? 0,
              count: data.count ?? 0,
            }))
          : [],
      }))
    : [];

  return {
    totals,
    byMethod,
    byDay,
    dateRange: apiData.dateRange ?? { startDate: "", endDate: "" },
  };
}

export default function FinanceClient({ token }: FinanceClientProps) {
  // Track report state
  const [isReportEnabled, setIsReportEnabled] = useState(false);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);

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

  // Mutation for generating report
  const generateReportMutation = useMutation({
    mutationFn: async (params: FinanceSummaryParams) => {
      console.log("[Finance] Starting mutation with params:", params);
      console.log("[Finance] Token available:", !!token);
      const response = await financeApi.getSummary({ token, params });
      console.log("[Finance] API response:", response);
      return response;
    },
    onSuccess: (response) => {
      console.log("[Finance] Mutation success:", response);
      if (response.success && response.data) {
        const transformed = transformApiResponse(response.data);
        console.log("[Finance] Transformed data:", transformed);
        setSummary(transformed);
      }
    },
    onError: (error) => {
      console.error("[Finance] Mutation error:", error);
    },
  });

  // Handle generate report button click
  const handleGenerateReport = () => {
    console.log("[Finance] Generate button clicked");
    console.log("[Finance] Token:", token ? "present" : "missing");
    console.log("[Finance] Filters:", filters);

    if (!token) {
      console.warn("[Finance] No token available, aborting");
      return;
    }

    setIsReportEnabled(true);
    generateReportMutation.mutate(filters);
  };

  const isFetching = generateReportMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FinanceFilters
        filters={filters}
        onFilterChange={setFilters}
        branches={branches}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleGenerateReport}
          disabled={isFetching}
        >
          <FileText className="h-4 w-4 mr-2" />
          {isFetching ? "Generating..." : "Generate Report"}
        </Button>
        <FinanceExportButton
          token={token}
          params={filters}
          format="csv"
          disabled={isFetching || !summary}
        />
      </div>

      {/* Summary Cards */}
      {summary?.totals && (
        <FinanceSummaryCard totals={summary.totals} isLoading={isFetching} />
      )}

      {/* Method Breakdown */}
      {summary?.byMethod && (
        <MethodBreakdown
          data={summary.byMethod}
          currency={summary.totals.currency}
          isLoading={isFetching}
        />
      )}

      {/* Daily Breakdown */}
      {summary?.byDay && (
        <DailyBreakdown
          data={summary.byDay}
          currency={summary.totals.currency}
          isLoading={isFetching}
        />
      )}

      {/* Empty State */}
      {!isFetching && !summary && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isReportEnabled
              ? "No financial data available for the selected period"
              : "Select date range and click \"Generate Report\" to view financial summary"}
          </p>
        </div>
      )}
    </div>
  );
}
