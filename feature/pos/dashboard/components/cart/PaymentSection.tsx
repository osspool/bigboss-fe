"use client";

import { useMemo } from "react";
import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/constants";
import type { PaymentOption, PaymentState, SplitPaymentEntry, PosPaymentMethod } from "@/types/pos.types";
import { SplitPaymentPanel } from "../SplitPaymentPanel";

interface PaymentSectionProps {
  options: PaymentOption[];
  isLoading: boolean;
  state: PaymentState;
  selectedOption: PaymentOption | null;
  total: number;
  onSelectPayment: (key: string) => void;
  onModeChange: (mode: "single" | "split") => void;
  onCashChange: (value: string) => void;
  onReferenceChange: (value: string) => void;
  onSplitAdd: (paymentKey?: string) => void;
  onSplitUpdate: (id: string, patch: Partial<Pick<SplitPaymentEntry, "paymentKey" | "amount" | "reference">>) => void;
  onSplitRemove: (id: string) => void;
}

function getPaymentIcon(method: PosPaymentMethod) {
  switch (method) {
    case "cash":
      return Banknote;
    case "bkash":
    case "nagad":
    case "rocket":
    case "upay":
      return Smartphone;
    case "card":
    case "bank_transfer":
      return CreditCard;
    default:
      return Banknote;
  }
}

export function PaymentSection({
  options,
  isLoading,
  state,
  selectedOption,
  total,
  onSelectPayment,
  onModeChange,
  onCashChange,
  onReferenceChange,
  onSplitAdd,
  onSplitUpdate,
  onSplitRemove,
}: PaymentSectionProps) {
  const Icon = getPaymentIcon(state.selectedMethod);

  const cashSuggestions = useMemo(() => {
    if (state.selectedMethod !== "cash") return [];
    const rounded = Math.ceil(total);
    if (!Number.isFinite(rounded) || rounded <= 0) return [];

    const roundUp = (v: number, step: number) => Math.ceil(v / step) * step;
    const candidates = [
      rounded,
      roundUp(rounded, 50),
      roundUp(rounded, 100),
      roundUp(rounded, 500),
      roundUp(rounded, 1000),
    ];
    return Array.from(new Set(candidates)).sort((a, b) => a - b).slice(0, 5);
  }, [total, state.selectedMethod]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Payment</p>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Payment</p>
        <div className="text-xs text-muted-foreground">
          No active payment methods configured.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Payment</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {state.mode === "single" ? (
            <>
              <Icon className="h-3.5 w-3.5" />
              <span className="capitalize">{state.selectedMethod.replace(/_/g, " ")}</span>
            </>
          ) : (
            <span className="font-medium">Split</span>
          )}
          <div className="flex items-center gap-2">
            <span>Split</span>
            <Switch
              checked={state.mode === "split"}
              onCheckedChange={(checked) => onModeChange(checked ? "split" : "single")}
            />
          </div>
        </div>
      </div>

      {/* Split or Single Mode Content */}
      {state.mode === "split" ? (
        <SplitPaymentPanel
          options={options}
          entries={state.splitEntries}
          total={total}
          remaining={state.splitRemaining}
          onAdd={onSplitAdd}
          onRemove={onSplitRemove}
          onUpdate={onSplitUpdate}
        />
      ) : (
        <>
          {/* Payment Method Buttons */}
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <Button
                key={opt.key}
                type="button"
                variant={state.selectedKey === opt.key ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectPayment(opt.key)}
                className="h-9"
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Method Notes */}
          {selectedOption?.note && (
            <p className="text-xs text-muted-foreground">{selectedOption.note}</p>
          )}
          {selectedOption?.walletNumber && (
            <p className="text-xs text-muted-foreground">
              Wallet: <span className="font-medium">{selectedOption.walletNumber}</span>
            </p>
          )}

          {/* Cash Mode */}
          {state.selectedMethod === "cash" ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <Input
                  placeholder="Cash received (BDT)"
                  inputMode="numeric"
                  value={state.cashReceived}
                  onChange={(e) => onCashChange(e.target.value)}
                />
              </div>
              {cashSuggestions.length > 0 && (
                <div className="col-span-2 flex flex-wrap gap-2">
                  {cashSuggestions.map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => onCashChange(String(amt))}
                    >
                      {amt === Math.ceil(total) ? "Exact" : formatPrice(amt)}
                    </Button>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Due:{" "}
                <span className={state.amountDue > 0 ? "text-destructive font-medium" : "font-medium"}>
                  {formatPrice(state.amountDue)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                Change: <span className="font-medium">{formatPrice(state.changeAmount)}</span>
              </div>
            </div>
          ) : (
            /* Reference Input for non-cash */
            <Input
              placeholder={
                state.selectedMethod === "card"
                  ? "Card reference (Slip/Auth No.)"
                  : "MFS reference (Txn ID)"
              }
              value={state.reference}
              onChange={(e) => onReferenceChange(e.target.value)}
            />
          )}
        </>
      )}

      {/* Split Total Display */}
      {state.mode === "split" && (
        <div className="text-xs text-muted-foreground">
          Allocated: <span className="font-medium">{formatPrice(state.splitTotal)}</span>
        </div>
      )}
    </div>
  );
}
