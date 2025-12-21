"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { SizeTableData } from "@/data/constants";

interface SizeTableProps {
  tables: SizeTableData[];
  variant?: "default" | "compact";
  className?: string;
}

export function SizeTable({ tables, variant = "default", className }: SizeTableProps) {
  if (!tables || tables.length === 0) {
    return null;
  }

  const isCompact = variant === "compact";

  // Single table - no tabs needed
  if (tables.length === 1) {
    return (
      <div className={className}>
        <SingleTable table={tables[0]} isCompact={isCompact} />
      </div>
    );
  }

  // Multiple tables - use tabs
  return (
    <div className={className}>
      <Tabs defaultValue={tables[0].category} className="w-full">
        <TabsList
          className={cn(
            "flex flex-wrap gap-2 h-auto bg-transparent mb-6",
            isCompact ? "justify-start" : "justify-center"
          )}
        >
          {tables.map((table) => (
            <TabsTrigger
              key={table.category}
              value={table.category}
              className={cn(
                "border border-input bg-background",
                "data-[state=active]:bg-foreground data-[state=active]:text-background",
                isCompact ? "px-3 py-1.5 text-sm" : "px-4 py-2"
              )}
            >
              {table.category}
            </TabsTrigger>
          ))}
        </TabsList>

        {tables.map((table) => (
          <TabsContent key={table.category} value={table.category}>
            <SingleTable table={table} isCompact={isCompact} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function SingleTable({ table, isCompact }: { table: SizeTableData; isCompact: boolean }) {
  return (
    <div className={cn("border border-border rounded-lg overflow-hidden", isCompact ? "" : "p-6")}>
      {table.description && (
        <p className={cn("text-muted-foreground mb-4", isCompact ? "text-sm px-4 pt-4" : "text-center")}>
          {table.description}
        </p>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {table.headers.map((header, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    isCompact ? "text-xs py-2" : "py-3",
                    index === 0 ? "font-semibold" : "text-center"
                  )}
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-muted/30">
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    className={cn(
                      isCompact ? "text-sm py-2" : "py-3",
                      cellIndex === 0
                        ? "font-medium"
                        : "text-center text-muted-foreground"
                    )}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
