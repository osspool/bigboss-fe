"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { usePaymentMethods } from "@/hooks/query/usePlatformConfig";
import type { PaymentMethodConfig } from "@/types/common.types";
import type { PosPaymentMethod } from "@/types/pos.types";
import { getPaymentKey, mapPlatformMethodToPosMethod } from "../dashboard/pos-payment";
import { parseCashReceived, calculateChange, calculateAmountDue } from "../utils";

export interface UsePosPaymentReturn {
  // Payment methods
  paymentMethods: PaymentMethodConfig[];
  paymentMethodsLoading: boolean;
  selectedPaymentKey: string | null;
  selectedPosMethod: PosPaymentMethod;
  // Cash handling
  cashReceived: string;
  cashReceivedNumber: number;
  changeAmount: number;
  amountDue: number;
  // Reference handling
  paymentReference: string;
  // Actions
  setSelectedPaymentKey: (key: string | null) => void;
  setCashReceived: (value: string) => void;
  setPaymentReference: (value: string) => void;
  resetPayment: () => void;
}

export function usePosPayment(token: string, total: number): UsePosPaymentReturn {
  const [selectedPaymentKey, setSelectedPaymentKey] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [paymentReference, setPaymentReference] = useState("");

  const {
    paymentMethods: platformPaymentMethods,
    isLoading: paymentMethodsLoading,
  } = usePaymentMethods(token);

  // Filter active payment methods that can be mapped to POS methods
  const paymentMethods = useMemo(() => {
    const list = platformPaymentMethods || [];
    return list.filter((m) => m?.isActive !== false && mapPlatformMethodToPosMethod(m));
  }, [platformPaymentMethods]);

  // Get selected platform payment method
  const selectedPlatformMethod = useMemo(() => {
    if (paymentMethods.length === 0) return null;

    const keyed = paymentMethods.map((m, idx) => ({
      key: getPaymentKey(m, idx),
      method: m,
    }));

    return keyed.find((k) => k.key === selectedPaymentKey) || keyed[0];
  }, [paymentMethods, selectedPaymentKey]);

  // Auto-select first payment method (prefer cash)
  useEffect(() => {
    if (selectedPaymentKey) return;
    if (paymentMethods.length === 0) return;

    const keyed = paymentMethods.map((m, idx) => ({
      key: getPaymentKey(m, idx),
      method: m,
    }));

    const cash = keyed.find((k) => k.method.type === "cash");
    setSelectedPaymentKey((cash || keyed[0])?.key ?? null);
  }, [paymentMethods, selectedPaymentKey]);

  // Map to POS payment method type
  const selectedPosMethod = useMemo((): PosPaymentMethod => {
    const platformMethod = selectedPlatformMethod?.method;
    const mapped = platformMethod ? mapPlatformMethodToPosMethod(platformMethod) : null;
    return mapped || "cash";
  }, [selectedPlatformMethod]);

  // Reset inputs when switching payment method
  useEffect(() => {
    setPaymentReference("");
    setCashReceived("");
  }, [selectedPosMethod]);

  // Cash calculations
  const cashReceivedNumber = useMemo(
    () => parseCashReceived(cashReceived),
    [cashReceived]
  );

  const changeAmount = useMemo(() => {
    if (selectedPosMethod !== "cash") return 0;
    return calculateChange(cashReceivedNumber, total);
  }, [cashReceivedNumber, total, selectedPosMethod]);

  const amountDue = useMemo(() => {
    if (selectedPosMethod !== "cash") return 0;
    return calculateAmountDue(cashReceivedNumber, total);
  }, [cashReceivedNumber, total, selectedPosMethod]);

  const resetPayment = useCallback(() => {
    setPaymentReference("");
    setCashReceived("");
  }, []);

  return {
    paymentMethods,
    paymentMethodsLoading,
    selectedPaymentKey,
    selectedPosMethod,
    cashReceived,
    cashReceivedNumber,
    changeAmount,
    amountDue,
    paymentReference,
    setSelectedPaymentKey,
    setCashReceived,
    setPaymentReference,
    resetPayment,
  };
}
