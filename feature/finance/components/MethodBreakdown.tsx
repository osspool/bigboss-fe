// feature/finance/components/MethodBreakdown.tsx
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
import type { FinanceByMethod } from "@/types";

interface MethodBreakdownProps {
  data: FinanceByMethod[];
  currency?: string;
  isLoading?: boolean;
}

export function MethodBreakdown({
  data,
  currency = "BDT",
  isLoading,
}: MethodBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatMethod = (method: string) => {
    return method
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Breakdown by Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
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
          <CardTitle>Breakdown by Payment Method</CardTitle>
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
        <CardTitle>Breakdown by Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expense</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead className="text-right">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((method) => (
              <TableRow key={method.method}>
                <TableCell className="font-medium">
                  {formatMethod(method.method)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {formatCurrency(method.income)}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {formatCurrency(method.expense)}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    method.net >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(method.net)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {method.count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
