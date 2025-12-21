"use client";

import { useMemo } from "react";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "@/types/customer.types";

interface CustomerLookupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onSearch: () => void;
  results: Customer[];
  isLoading: boolean;
  onSelect: (customer: Customer) => void;
  onCreate: () => void;
}

export function CustomerLookupDialog({
  open,
  onOpenChange,
  searchValue,
  onSearchValueChange,
  onSearch,
  results,
  isLoading,
  onSelect,
  onCreate,
}: CustomerLookupDialogProps) {
  const trimmed = searchValue.trim();
  const showEmpty = trimmed.length < 2;

  const content = useMemo(() => {
    if (showEmpty) {
      return (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Type at least 2 characters to search customers.
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No customer found.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {results.map((customer) => (
          <Button
            key={customer._id}
            type="button"
            variant="outline"
            className="w-full h-auto justify-between px-3 py-2"
            onClick={() => onSelect(customer)}
          >
            <div className="text-left">
              <p className="text-sm font-medium">{customer.name || "Customer"}</p>
              <p className="text-xs text-muted-foreground">{customer.phone}</p>
            </div>
            {customer.tier && (
              <Badge variant="secondary" className="capitalize">
                {customer.tier}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    );
  }, [isLoading, results, showEmpty]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Find customer</DialogTitle>
          <DialogDescription>Search by phone or name and attach loyalty info.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            placeholder="Phone or name"
            value={searchValue}
            onChange={(e) => onSearchValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearch();
              }
            }}
          />
          <Button type="button" onClick={onSearch} className="shrink-0">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        <div className="pt-3">{content}</div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCreate}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add new
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
