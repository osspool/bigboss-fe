"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, generateStableKey } from '@/lib/utils';

export function TableWrapper({
  title,
  description,
  icon,
  children,
  columns,
  data,
  renderRow,
  emptyState,
  className,
  tableClassName,
  maxHeight = "500px",
  ...props
}) {
  const hasData = data && data.length > 0;

  // Default empty state
  const defaultEmptyState = emptyState || {
    icon: icon,
    title: "No data available",
    description: "There are no items to display"
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Header Section */}
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Table Content */}
      {!hasData ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-lg">
          {defaultEmptyState.icon && (
            <div className="h-12 w-12 mb-4 opacity-50">
              {defaultEmptyState.icon}
            </div>
          )}
          <p className="text-lg">{defaultEmptyState.title}</p>
          {defaultEmptyState.description && (
            <p className="text-sm">{defaultEmptyState.description}</p>
          )}
        </div>
      ) : (
        <div className={cn(
          "relative overflow-auto border rounded-lg",
          maxHeight && `max-h-[${maxHeight}]`
        )}>
          <Table className={tableClassName}>
            {columns && (
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead 
                      key={generateStableKey(column.key ?? column.header ?? index, index, 'table-column-head')}
                      className={cn(column.className)}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {data?.map((item, index) => renderRow ? renderRow(item, index) : (
                <TableRow key={generateStableKey(item, index, 'table-row')}>
                  {children}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// Convenience component for simple data tables (renamed from DataTable)
export function SimpleTable({
  title,
  data,
  columns,
  emptyState,
  className,
  ...props
}) {
  const renderRow = (item, index) => (
    <TableRow key={generateStableKey(item, index, 'simple-table-row')}>
      {columns.map((column, colIndex) => (
        <TableCell key={generateStableKey(column.key ?? column.header ?? colIndex, colIndex, 'simple-table-cell')} className={column.cellClassName}>
          {column.render ? column.render(item, index) : item[column.key]}
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <TableWrapper
      title={title}
      data={data}
      columns={columns}
      renderRow={renderRow}
      emptyState={emptyState}
      className={className}
      {...props}
    />
  );
}

// Export table components for direct use
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow }; 
