"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";

/**
 * DateRangeFilter Component
 *
 * A simplified component for selecting date ranges using react-day-picker v9
 * - Only applies filter when explicitly submitted
 * - Supports clearing filters
 * - Uses Popover to show calendar on click
 * - No date-fns dependency
 *
 * @param {Object} props
 * @param {Date} props.initialStartDate - Initial start date
 * @param {Date} props.initialEndDate - Initial end date
 * @param {Function} props.onFilter - Callback when filter is applied (receives startDate, endDate)
 * @param {Function} props.onClear - Callback when filter is cleared
 * @param {string} props.className - Additional classes for the container
 * @param {string} props.buttonClassName - Additional classes for trigger button
 * @param {string} props.placeholder - Placeholder text when no date selected
 * @param {Date} props.minDate - Minimum selectable date
 * @param {Date} props.maxDate - Maximum selectable date
 * @param {boolean} props.alignRight - Align popover to the right
 */
export function DateRangeFilter({
  initialStartDate,
  initialEndDate,
  onFilter,
  onClear,
  className,
  buttonClassName,
  placeholder = "Pick a date range",
  minDate,
  maxDate,
  alignRight = true,
}) {
  // Internal state for range selection (before applying)
  const [dateRange, setDateRange] = React.useState(
    initialStartDate || initialEndDate
      ? { from: initialStartDate, to: initialEndDate }
      : undefined
  );

  // Applied state (shown on button)
  const [appliedRange, setAppliedRange] = React.useState(dateRange);

  // Popover open state
  const [open, setOpen] = React.useState(false);

  // Update state when props change
  React.useEffect(() => {
    const newRange =
      initialStartDate || initialEndDate
        ? { from: initialStartDate, to: initialEndDate }
        : undefined;
    setDateRange(newRange);
    setAppliedRange(newRange);
  }, [initialStartDate, initialEndDate]);

  // Handle applying the filter
  const handleApplyFilter = () => {
    setAppliedRange(dateRange);
    onFilter?.(dateRange?.from || null, dateRange?.to || null);
    setOpen(false);
  };

  // Handle clearing the filter
  const handleClearFilter = (e) => {
    e?.stopPropagation?.();
    setDateRange(undefined);
    setAppliedRange(undefined);
    onClear?.();
    setOpen(false);
  };

  // Format the display text
  const getDisplayText = () => {
    if (!appliedRange?.from && !appliedRange?.to) return placeholder;

    const formatDate = (date) => {
      if (!date) return "";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    if (appliedRange.from && appliedRange.to) {
      return `${formatDate(appliedRange.from)} - ${formatDate(appliedRange.to)}`;
    }
    if (appliedRange.from) return `From ${formatDate(appliedRange.from)}`;
    if (appliedRange.to) return `Until ${formatDate(appliedRange.to)}`;
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !(appliedRange?.from || appliedRange?.to) && "text-muted-foreground",
              buttonClassName
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayText()}
            {(appliedRange?.from || appliedRange?.to) && (
              <X
                className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                onClick={handleClearFilter}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align={alignRight ? "end" : "start"}
          side="bottom"
        >
          <div className="p-3 space-y-4">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              numberOfMonths={1}
              initialFocus
            />

            {/* Action buttons */}
            <div className="flex justify-between gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilter}
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyFilter}
                disabled={!dateRange?.from && !dateRange?.to}
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 