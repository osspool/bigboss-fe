"use client";

import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PaymentOption, SplitPaymentEntry } from "@/types";

interface SplitPaymentPanelProps {
  options: PaymentOption[];
  entries: SplitPaymentEntry[];
  total: number;
  remaining: number;
  onAdd: (paymentKey?: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<SplitPaymentEntry, "paymentKey" | "amount" | "reference">>) => void;
}

function parseAmount(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function SplitPaymentPanel({
  options,
  entries,
  total,
  remaining,
  onAdd,
  onRemove,
  onUpdate,
}: SplitPaymentPanelProps) {
  const totals = useMemo(() => entries.map((e) => parseAmount(e.amount)), [entries]);
  const sum = useMemo(() => totals.reduce((acc, val) => acc + val, 0), [totals]);

  const getRemainingForRow = (id: string) => {
    const idx = entries.findIndex((e) => e.id === id);
    const rowAmount = totals[idx] || 0;
    return Math.max(0, total - (sum - rowAmount));
  };

  if (options.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        No active payment methods configured.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Split payments</p>
        <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => onAdd()}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => {
          const option = options.find((o) => o.key === entry.paymentKey);
          const needsRef = option?.needsReference ?? false;
          const remainingForRow = getRemainingForRow(entry.id);
          const hasError = Boolean(entry.error);

          return (
            <div
              key={entry.id}
              className={cn(
                "rounded-md border bg-card p-2 space-y-2",
                hasError && "border-destructive"
              )}
            >
              <div className="flex gap-2 items-center">
                <Select
                  value={entry.paymentKey}
                  onValueChange={(value: string) => onUpdate(entry.id, { paymentKey: value })}
                >
                  <SelectTrigger className={cn("h-9 w-[140px]", hasError && "border-destructive")}>
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((opt) => (
                      <SelectItem key={opt.key} value={opt.key}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  className={cn("h-9 flex-1", hasError && !entry.amount && "border-destructive")}
                  placeholder="Amount"
                  inputMode="numeric"
                  value={entry.amount}
                  onChange={(e) => onUpdate(entry.id, { amount: e.target.value })}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onRemove(entry.id)}
                  disabled={entries.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{option?.note || "Select method and amount"}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => onUpdate(entry.id, { amount: String(remainingForRow) })}
                >
                  Fill {formatPrice(remainingForRow)}
                </Button>
              </div>

              {needsRef && (
                <Input
                  className={cn(
                    "h-9",
                    hasError && !entry.reference.trim() && "border-destructive"
                  )}
                  placeholder="Reference (Txn ID)"
                  value={entry.reference}
                  onChange={(e) => onUpdate(entry.id, { reference: e.target.value })}
                />
              )}

              {entry.error && (
                <p className="text-xs text-destructive">{entry.error}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Total: <span className="font-medium text-foreground">{formatPrice(total)}</span>
        </span>
        <span>
          Remaining:{" "}
          <span className={remaining === 0 ? "font-medium text-foreground" : "text-destructive font-medium"}>
            {formatPrice(remaining)}
          </span>
        </span>
      </div>
    </div>
  );
}
