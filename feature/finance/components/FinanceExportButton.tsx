// feature/finance/components/FinanceExportButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { financeApi } from "@/api/platform/finance-api";
import type { FinanceStatementParams } from "@/types/finance.types";
import { toast } from "sonner";

interface FinanceExportButtonProps {
  token: string;
  params: Omit<FinanceStatementParams, "format">;
  format?: "csv" | "json";
  disabled?: boolean;
}

export function FinanceExportButton({
  token,
  params,
  format = "csv",
  disabled,
}: FinanceExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const response = await financeApi.getStatements({
        token,
        params: { ...params, format },
      });

      if (response.success && response.data) {
        // Convert data to CSV or trigger download
        if (format === "csv") {
          // For CSV, backend should return CSV string or data to convert
          const csvContent =
            typeof response.data === "string"
              ? response.data
              : convertToCSV(response.data);

          const blob = new Blob([csvContent], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `finance-statements-${new Date().toISOString().split("T")[0]}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          // For JSON
          const blob = new Blob([JSON.stringify(response.data, null, 2)], {
            type: "application/json",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `finance-statements-${new Date().toISOString().split("T")[0]}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }

        toast.success("Export successful");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export statements");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting}
      variant="outline"
      size="sm"
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : `Export ${format.toUpperCase()}`}
    </Button>
  );
}

// Helper to convert data to CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value ?? "");
          return stringValue.includes(",") || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        })
        .join(",")
    ),
  ];

  return csvRows.join("\n");
}
