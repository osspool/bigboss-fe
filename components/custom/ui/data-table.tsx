"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";
import { useState, useRef, useEffect, useCallback, useMemo, RefObject } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { ApiPagination, ApiPaginationData } from "./api-pagination";

interface ScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  isScrollable: boolean;
}

// Custom hook for debounced scroll detection
const useScrollDetection = (ref: RefObject<HTMLDivElement | null>, delay = 100) => {
  const [scrollState, setScrollState] = useState<ScrollState>({
    canScrollLeft: false,
    canScrollRight: false,
    isScrollable: false
  });

  const checkScroll = useCallback(() => {
    const scrollContainer = ref.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!scrollContainer) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    const isScrollable = scrollWidth > clientWidth;
    const canScrollLeft = scrollLeft > 5; // Small threshold for better UX
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - 5;

    setScrollState(prev => {
      // Only update if values actually changed to prevent unnecessary re-renders
      if (
        prev.canScrollLeft !== canScrollLeft ||
        prev.canScrollRight !== canScrollRight ||
        prev.isScrollable !== isScrollable
      ) {
        return { canScrollLeft, canScrollRight, isScrollable };
      }
      return prev;
    });
  }, [ref]);

  // Debounced scroll check
  const debouncedCheckScroll = useCallback(() => {
    const timeoutId = setTimeout(checkScroll, delay);
    return () => clearTimeout(timeoutId);
  }, [checkScroll, delay]);

  return { ...scrollState, checkScroll: debouncedCheckScroll };
};

interface ScrollButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
  className?: string;
}

// Memoized scroll button component
const ScrollButton = ({ direction, onClick, visible, className }: ScrollButtonProps) => {
  if (!visible) return null;

  return (
    <Button
      variant="secondary"
      size="sm"
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-30 h-10 w-10 p-0 shadow-lg border-2",
        "bg-background hover:bg-muted transition-all duration-200 ease-in-out",
        "hover:scale-105 active:scale-95",
        direction === 'left' ? "left-3" : "right-3",
        className
      )}
      onClick={onClick}
      aria-label={`Scroll ${direction}`}
    >
      {direction === 'left' ? (
        <ChevronLeft className="h-5 w-5" />
      ) : (
        <ChevronRight className="h-5 w-5" />
      )}
    </Button>
  );
};

export interface DataTablePaginationProps extends Partial<ApiPaginationData> {
  onPageChange?: (page: number) => void;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pagination?: DataTablePaginationProps;
  enableSorting?: boolean;
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  className?: string;
}

export function DataTable<TData, TValue>({ 
  columns, 
  data, 
  isLoading = false, 
  pagination,
  enableSorting = false,
  enableRowSelection = false,
  onRowSelectionChange,
  className 
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { canScrollLeft, canScrollRight, isScrollable, checkScroll } = useScrollDetection(scrollAreaRef);

  const {
    total = 0,
    limit = 10,
    pages = 1,
    page = 1,
    hasNext = false,
    hasPrev = false,
    onPageChange = () => {},
  } = pagination ?? {};

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    onSortingChange: setSorting,
    onRowSelectionChange: enableRowSelection ? (updater) => {
      setRowSelection(updater);
      // Notify parent immediately when selection changes
      if (onRowSelectionChange) {
        const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
        // Get the selected row data
        const selectedRows = data.filter((_, index) => newSelection[index]);
        onRowSelectionChange(selectedRows);
      }
    } : undefined,
    state: {
      sorting,
      rowSelection: enableRowSelection ? rowSelection : undefined,
    },
    enableRowSelection,
  });

  // Memoized scroll handler
  const scrollHorizontally = useCallback((direction: "left" | "right") => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!scrollContainer) return;

    const scrollAmount = Math.min(300, scrollContainer.clientWidth * 0.8);
    scrollContainer.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }, []);

  // Optimized wheel handler
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isScrollable) return;

    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!scrollContainer?.contains(e.target as Node)) return;

    // Handle shift+wheel or horizontal trackpad scroll
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      const delta = e.deltaY || e.deltaX;
      scrollContainer.scrollBy({
        left: delta,
        behavior: 'auto'
      });
    }
  }, [isScrollable]);

  // Setup event listeners with proper cleanup
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!scrollContainer) return;

    // Initial check
    checkScroll();

    // Add event listeners
    scrollContainer.addEventListener('scroll', checkScroll, { passive: true });
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup
    return () => {
      scrollContainer.removeEventListener('scroll', checkScroll);
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, [checkScroll, handleWheel]);

  // Recheck when data changes
  useEffect(() => {
    const timer = setTimeout(checkScroll, 150);
    return () => clearTimeout(timer);
  }, [data, checkScroll]);

  // Memoized loading state
  const loadingState = useMemo(() => (
    <div className="w-full h-full min-h-[24rem] flex items-center justify-center bg-background/50 rounded-lg border border-border">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading data...</p>
      </div>
    </div>
  ), []);

  // Memoized empty state
  const emptyState = useMemo(() => (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">No results found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      </TableCell>
    </TableRow>
  ), [columns.length]);

  if (isLoading) {
    return loadingState;
  }

  return (
    <div className={cn("flex flex-col h-full gap-4", className)}>
      <div className="flex-1 min-h-0 rounded-lg border overflow-hidden bg-background shadow-sm relative">
        {/* Scroll Buttons */}
        <ScrollButton
          direction="left"
          onClick={() => scrollHorizontally('left')}
          visible={canScrollLeft}
        />
        <ScrollButton
          direction="right"
          onClick={() => scrollHorizontally('right')}
          visible={canScrollRight}
        />

        <ScrollArea ref={scrollAreaRef} className="h-full w-full">
          <div className="min-w-full">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-border hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "bg-muted/50 font-semibold text-foreground h-12 px-4 whitespace-nowrap",
                          "first:rounded-tl-lg last:rounded-tr-lg"
                        )}
                      >
                        {header.isPlaceholder ? null : (
                          enableSorting && header.column.getCanSort() ? (
                            <Button
                              variant="ghost"
                              onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                              className="h-auto p-0 font-semibold hover:bg-transparent whitespace-nowrap"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="ml-2 h-4 w-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="ml-2 h-4 w-4" />
                              ) : (
                                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                              )}
                            </Button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "hover:bg-muted/50 transition-colors border-b border-border/50",
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-3 text-sm whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  emptyState
                )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {pagination && (
        <ApiPagination
          total={total}
          limit={limit}
          pages={pages}
          page={page}
          hasNext={hasNext}
          hasPrev={hasPrev}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
