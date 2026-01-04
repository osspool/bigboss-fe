// feature/finance/components/DailyBreakdown.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FinanceByDay } from "@/types";

interface DailyBreakdownProps {
  data: FinanceByDay[];
  currency?: string;
  isLoading?: boolean;
}

export function DailyBreakdown({
  data,
  currency = "BDT",
  isLoading,
}: DailyBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No data available for the selected period
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expense</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead className="text-right">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((day, index) => (
              <TableRow key={`${day.date}-${day.branchId || "all"}-${index}`}>
                <TableCell className="font-medium">
                  {formatDate(day.date)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {day.branchCode
                    ? `${day.branchCode} - ${day.branchName || ""}`
                    : "All Branches"}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {formatCurrency(day.income)}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {formatCurrency(day.expense)}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    day.net >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(day.net)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {day.count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
