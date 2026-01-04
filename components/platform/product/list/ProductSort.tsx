"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/constants";

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface ProductSortProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
}

export function ProductSort({ value, onChange }: ProductSortProps) {
  const selectedOption = SORT_OPTIONS.find(opt => opt.value === value);
  const selectedLabel = selectedOption?.label || "Sort";

  return (
    <Select value={value} onValueChange={(val: string) => onChange(val as SortValue)}>
      <SelectTrigger className="w-[180px] h-9 text-sm">
        <SelectValue placeholder="Sort by">{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Helper to convert sort value to API sort param
export function getApiSort(value: SortValue): string {
  const option = SORT_OPTIONS.find(opt => opt.value === value);
  return option?.apiSort ?? "-createdAt";
}
