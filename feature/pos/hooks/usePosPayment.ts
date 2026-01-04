"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { usePaymentMethods } from "@/hooks/query";
import type { PaymentMethodConfig } from "@classytic/commerce-sdk/platform";
import type {
  PosPaymentMethod,
  PaymentOption,
  SplitPaymentEntry,
  PaymentState,
} from "@/types";
import { parseCashReceived, calculateChange, calculateAmountDue, parsePositiveNumber } from "../utils";

// ============= Payment Mapping (consolidated from pos-payment.ts) =============

function getPaymentKey(method: PaymentMethodConfig, index: number): string {
  return method._id || `${method.type}:${method.provider || ""}:${method.name}:${index}`;
}

function mapPlatformMethodToPosMethod(method: PaymentMethodConfig): PosPaymentMethod | null {
  switch (method.type) {
    case "cash":
      return "cash";
    case "mfs": {
      const provider = (method.provider || "").toLowerCase();
      if (provider === "bkash" || provider === "nagad" || provider === "rocket" || provider === "upay") {
        return provider as PosPaymentMethod;
      }
      return null;
    }
    case "bank_transfer":
      return "bank_transfer";
    case "card":
      return "card";
    default:
      return null;
  }
}

export function paymentNeedsReference(posMethod: PosPaymentMethod): boolean {
  return posMethod !== "cash";
}

// ============= Split Entry Factory =============

function createSplitEntry(option: PaymentOption): SplitPaymentEntry {
  const suffix = Math.random().toString(16).slice(2);
  return {
    id: `split_${Date.now()}_${suffix}`,
    paymentKey: option.key,
    posMethod: option.posMethod,
    amount: "",
    reference: "",
    error: undefined,
  };
}

// ============= Hook Return Type =============

export interface UsePosPaymentReturn {
  options: PaymentOption[];
  isLoading: boolean;
  state: PaymentState;
  selectedOption: PaymentOption | null;
  // Actions
  selectPayment: (key: string) => void;
  setMode: (mode: "single" | "split") => void;
  setCashReceived: (value: string) => void;
  setReference: (value: string) => void;
  addSplit: (paymentKey?: string) => void;
  updateSplit: (id: string, patch: Partial<Pick<SplitPaymentEntry, "paymentKey" | "amount" | "reference">>) => void;
  removeSplit: (id: string) => void;
  validateSplitEntry: (id: string) => string | undefined;
  validateAllSplits: () => boolean;
  reset: () => void;
}

// ============= Main Hook =============

export function usePosPayment(token: string, total: number): UsePosPaymentReturn {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [reference, setReference] = useState("");
  const [mode, setMode] = useState<"single" | "split">("single");
  const [splitEntries, setSplitEntries] = useState<SplitPaymentEntry[]>([]);

  const { paymentMethods: platformMethods, isLoading } = usePaymentMethods(token);

  // Build payment options with all derived data
  const options = useMemo<PaymentOption[]>(() => {
    const list = platformMethods || [];
    return list
      .filter((m) => m?.isActive !== false)
      .map((m, idx) => {
        const posMethod = mapPlatformMethodToPosMethod(m);
        if (!posMethod) return null;
        return {
          key: getPaymentKey(m, idx),
          posMethod,
          label: m.name,
          needsReference: paymentNeedsReference(posMethod),
          note: m.note,
          walletNumber: m.type === "mfs" ? m.walletNumber : undefined,
        };
      })
      .filter(Boolean) as PaymentOption[];
  }, [platformMethods]);

  // Auto-select first payment method (prefer cash)
  useEffect(() => {
    if (selectedKey || options.length === 0) return;
    const cash = options.find((o) => o.posMethod === "cash");
    setSelectedKey((cash || options[0])?.key ?? null);
  }, [options, selectedKey]);

  const selectedOption = useMemo(() => {
    if (options.length === 0) return null;
    return options.find((o) => o.key === selectedKey) || options[0];
  }, [options, selectedKey]);

  const selectedMethod = selectedOption?.posMethod || "cash";

  // Reset inputs when switching payment method in single mode
  useEffect(() => {
    if (mode !== "single") return;
    setReference("");
    setCashReceived("");
  }, [selectedMethod, mode]);

  // Initialize split entries when switching to split mode
  useEffect(() => {
    if (mode !== "split" || splitEntries.length > 0) return;
    const opt = selectedOption || options[0];
    if (opt) {
      setSplitEntries([createSplitEntry(opt)]);
    }
  }, [mode, splitEntries.length, selectedOption, options]);

  // Cash calculations
  const cashReceivedNumber = useMemo(() => parseCashReceived(cashReceived), [cashReceived]);
  const changeAmount = useMemo(() => {
    if (selectedMethod !== "cash") return 0;
    return calculateChange(cashReceivedNumber, total);
  }, [cashReceivedNumber, total, selectedMethod]);
  const amountDue = useMemo(() => {
    if (selectedMethod !== "cash") return 0;
    return calculateAmountDue(cashReceivedNumber, total);
  }, [cashReceivedNumber, total, selectedMethod]);

  // Split calculations
  const splitTotal = useMemo(
    () => splitEntries.reduce((sum, e) => sum + parsePositiveNumber(e.amount), 0),
    [splitEntries]
  );
  const splitRemaining = total - splitTotal;
  const splitIsBalanced = Math.abs(splitRemaining) < 0.01 && splitTotal > 0;

  // Validate a single split entry
  const validateSplitEntry = useCallback(
    (id: string): string | undefined => {
      const entry = splitEntries.find((e) => e.id === id);
      if (!entry) return undefined;

      const opt = options.find((o) => o.key === entry.paymentKey);
      if (!opt) return "Invalid payment method";

      const amount = parsePositiveNumber(entry.amount);
      if (amount <= 0) return "Amount required";

      if (opt.needsReference && !entry.reference.trim()) {
        return `Reference required for ${opt.label}`;
      }

      return undefined;
    },
    [splitEntries, options]
  );

  // Validate all split entries and update error states
  const validateAllSplits = useCallback((): boolean => {
    let hasError = false;
    setSplitEntries((prev) =>
      prev.map((entry) => {
        const opt = options.find((o) => o.key === entry.paymentKey);
        let error: string | undefined;

        if (!opt) {
          error = "Invalid method";
        } else {
          const amount = parsePositiveNumber(entry.amount);
          if (amount <= 0) {
            error = "Amount required";
          } else if (opt.needsReference && !entry.reference.trim()) {
            error = "Reference required";
          }
        }

        if (error) hasError = true;
        return { ...entry, error };
      })
    );
    return !hasError;
  }, [options]);

  // Actions
  const selectPayment = useCallback((key: string) => setSelectedKey(key), []);

  const addSplit = useCallback(
    (paymentKey?: string) => {
      const opt = paymentKey
        ? options.find((o) => o.key === paymentKey)
        : selectedOption || options[0];
      if (!opt) return;
      setSplitEntries((prev) => [...prev, createSplitEntry(opt)]);
    },
    [options, selectedOption]
  );

  const updateSplit = useCallback(
    (id: string, patch: Partial<Pick<SplitPaymentEntry, "paymentKey" | "amount" | "reference">>) => {
      setSplitEntries((prev) =>
        prev.map((entry) => {
          if (entry.id !== id) return entry;
          const updated = { ...entry, ...patch, error: undefined };
          // Update posMethod if paymentKey changed
          if (patch.paymentKey) {
            const opt = options.find((o) => o.key === patch.paymentKey);
            if (opt) {
              updated.posMethod = opt.posMethod;
              if (patch.paymentKey !== entry.paymentKey) {
                updated.reference = ""; // Clear reference on method change
              }
            }
          }
          return updated;
        })
      );
    },
    [options]
  );

  const removeSplit = useCallback((id: string) => {
    setSplitEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const reset = useCallback(() => {
    setReference("");
    setCashReceived("");
    setMode("single");
    setSplitEntries([]);
  }, []);

  // Build state object
  const state: PaymentState = {
    mode,
    selectedKey,
    selectedMethod,
    reference,
    cashReceived,
    changeAmount,
    amountDue,
    splitEntries,
    splitTotal,
    splitRemaining,
    splitIsBalanced,
  };

  return {
    options,
    isLoading,
    state,
    selectedOption,
    selectPayment,
    setMode,
    setCashReceived,
    setReference,
    addSplit,
    updateSplit,
    removeSplit,
    validateSplitEntry,
    validateAllSplits,
    reset,
  };
}

// Re-export for backward compatibility (deprecated - use types from pos.types.ts)
export type { PaymentOption, SplitPaymentEntry };
