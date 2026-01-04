// feature/finance/components/FinanceExportButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { financeApi } from "@classytic/commerce-sdk/finance";
import type { FinanceStatementParams } from "@/types";
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

      console.log("[Finance Export] Response:", response);

      // Helper to trigger download
      const downloadFile = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      };

      const filename = `finance-statements-${new Date().toISOString().split("T")[0]}.${format}`;

      // Handle CSV response (api-handler returns { data: Blob, response } for CSV)
      if (format === "csv") {
        // Check if response is blob wrapper from api-handler
        if (response && "data" in response && response.data instanceof Blob) {
          downloadFile(response.data, filename);
          toast.success("Export successful");
          return;
        }

        // Fallback: if JSON response with success wrapper
        if (response.success && response.data) {
          const csvContent =
            typeof response.data === "string"
              ? response.data
              : convertToCSV(response.data as unknown[]);
          const blob = new Blob([csvContent], { type: "text/csv" });
          downloadFile(blob, filename);
          toast.success("Export successful");
          return;
        }
      }

      // Handle JSON response
      if (format === "json") {
        if (response.success && response.data) {
          const blob = new Blob([JSON.stringify(response.data, null, 2)], {
            type: "application/json",
          });
          downloadFile(blob, filename);
          toast.success("Export successful");
          return;
        }
      }

      toast.error("No data to export");
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
function convertToCSV(data: unknown[]): string {
  if (!data || data.length === 0) return "";

  const firstRow = data[0] as Record<string, unknown>;
  const headers = Object.keys(firstRow);
  const csvRows = [
    headers.join(","),
    ...data.map((row) => {
      const rowData = row as Record<string, unknown>;
      return headers
        .map((header) => {
          const value = rowData[header];
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value ?? "");
          return stringValue.includes(",") || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        })
        .join(",");
    }),
  ];

  return csvRows.join("\n");
}
