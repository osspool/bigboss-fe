"use client";
import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DateFilter({
  label = null,
  value, // Date or YYYY-MM-DD
  onChange,
  className,
  buttonClassName,
}) {
  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      const dt = new Date(y, (m || 1) - 1, d || 1);
      return isNaN(dt.getTime()) ? undefined : dt;
    }
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? undefined : dt;
  }, [value]);

  const [open, setOpen] = useState(false);

  const handleSelect = (date) => {
    if (!date) return;
    onChange?.(date);
    setOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <div className="text-sm font-medium">{label}</div>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("h-9", buttonClassName)} type="button">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {selectedDate ? selectedDate.toLocaleDateString("en-GB") : "Pick date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}


