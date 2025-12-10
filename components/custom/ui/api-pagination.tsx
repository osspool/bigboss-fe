"use client";

import { CustomPagination, PaginationInfo } from "./custom-pagination";
import { cn } from "@/lib/utils";

/**
 * Standard API pagination response format
 */
export interface ApiPaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiPaginationProps extends Partial<ApiPaginationData> {
  onPageChange?: (page: number) => void;
  className?: string;
  showInfo?: boolean;
  infoPosition?: "left" | "right";
}

/**
 * ApiPagination - A reusable pagination component for API-driven data
 *
 * Matches the standard API pagination response format:
 * - total: Total number of documents/items
 * - pages: Total number of pages
 * - page: Current page number
 * - limit: Items per page
 * - hasNext: Whether next page exists
 * - hasPrev: Whether previous page exists
 */
export function ApiPagination({
  total = 0,
  limit = 10,
  pages = 1,
  page = 1,
  hasNext = false,
  hasPrev = false,
  onPageChange = () => {},
  className,
  showInfo = true,
  infoPosition = "left",
}: ApiPaginationProps) {
  const infoComponent = showInfo && (
    <div className="shrink-0">
      <PaginationInfo
        total={total}
        page={page}
        limit={limit}
      />
    </div>
  );

  const paginationComponent = (
    <div className="flex justify-center sm:justify-end">
      <CustomPagination
        page={page}
        pages={pages}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPageChange={onPageChange}
      />
    </div>
  );

  return (
    <div className={cn(
      "shrink-0 bg-muted/30 rounded-lg border border-border p-3 mb-2",
      className
    )}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {infoPosition === "left" ? (
          <>
            <div className="order-2 sm:order-1">{infoComponent}</div>
            <div className="order-1 sm:order-2">{paginationComponent}</div>
          </>
        ) : (
          <>
            <div className="order-1 sm:order-1">{paginationComponent}</div>
            <div className="order-2 sm:order-2">{infoComponent}</div>
          </>
        )}
      </div>
    </div>
  );
}
