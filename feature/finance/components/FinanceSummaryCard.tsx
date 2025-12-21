// feature/finance/components/FinanceSummaryCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinanceTotals } from "@/types/finance.types";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface FinanceSummaryCardProps {
  totals: FinanceTotals;
  isLoading?: boolean;
}

export function FinanceSummaryCard({
  totals,
  isLoading,
}: FinanceSummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: totals.currency || "BDT",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-20" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ArrowUpIcon className="h-4 w-4 text-green-600" />
            Total Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totals.income)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ArrowDownIcon className="h-4 w-4 text-red-600" />
            Total Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totals.expense)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              totals.net >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(totals.net)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totals.count} transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
