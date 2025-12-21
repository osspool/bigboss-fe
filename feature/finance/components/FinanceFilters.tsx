// feature/finance/components/FinanceFilters.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FinanceSummaryParams } from "@/types/finance.types";

interface FinanceFiltersProps {
  filters: FinanceSummaryParams;
  onFilterChange: (filters: FinanceSummaryParams) => void;
  branches?: Array<{ _id: string; code: string; name: string }>;
}

export function FinanceFilters({
  filters,
  onFilterChange,
  branches = [],
}: FinanceFiltersProps) {
  const handleChange = (key: keyof FinanceSummaryParams, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  // Default to last 30 days if not set
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const defaultStartDate =
    filters.startDate ||
    thirtyDaysAgo.toISOString().split("T")[0] + "T00:00:00.000Z";
  const defaultEndDate =
    filters.endDate || today.toISOString().split("T")[0] + "T23:59:59.999Z";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={
                filters.startDate
                  ? new Date(filters.startDate).toISOString().split("T")[0]
                  : new Date(defaultStartDate).toISOString().split("T")[0]
              }
              onChange={(e) => {
                const date = e.target.value
                  ? new Date(e.target.value).toISOString().split("T")[0] +
                    "T00:00:00.000Z"
                  : "";
                handleChange("startDate", date);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={
                filters.endDate
                  ? new Date(filters.endDate).toISOString().split("T")[0]
                  : new Date(defaultEndDate).toISOString().split("T")[0]
              }
              onChange={(e) => {
                const date = e.target.value
                  ? new Date(e.target.value).toISOString().split("T")[0] +
                    "T23:59:59.999Z"
                  : "";
                handleChange("endDate", date);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select
              value={filters.source || "all"}
              onValueChange={(value) =>
                handleChange("source", value === "all" ? "" : value)
              }
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="pos">POS</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {branches && branches.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select
                value={filters.branchId || "all"}
                onValueChange={(value) =>
                  handleChange("branchId", value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="branch">
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch._id} value={branch._id}>
                      {branch.code} - {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
