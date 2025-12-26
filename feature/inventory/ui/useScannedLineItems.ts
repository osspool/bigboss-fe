"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { usePosLookupMutation, formatVariantLabel } from "@/hooks/query/usePos";
import { makeLineKey } from "./line-items";
import type { PosLookupResponse } from "@/types/pos.types";

export interface ScannedLineItemBase {
  key: string;
  productId: string;
  productName: string;
  variantSku?: string;
  variantLabel?: string;
  subtitle?: string;
  quantity: number;
  cartonNumber?: string;
}

type LookupData = NonNullable<PosLookupResponse["data"]>;

function defaultBuildItem(lookup: LookupData, qty: number): ScannedLineItemBase {
  const product = lookup?.product;
  const productId = product?._id;
  const variantSku = lookup?.variantSku || undefined;
  const variantLabel = lookup?.matchedVariant?.attributes
    ? formatVariantLabel(lookup.matchedVariant.attributes)
    : variantSku;

  return {
    key: makeLineKey(productId, variantSku),
    productId,
    productName: product?.name,
    variantSku,
    variantLabel,
    quantity: qty,
  };
}

export interface UseScannedLineItemsOptions<TItem extends ScannedLineItemBase> {
  token: string;
  branchId: string | undefined;
  buildItem?: (lookup: LookupData, qty: number) => TItem;
  onNotFoundMessage?: (res: PosLookupResponse) => string;
}

export function useScannedLineItems<TItem extends ScannedLineItemBase = ScannedLineItemBase>({
  token,
  branchId,
  buildItem = defaultBuildItem as (lookup: LookupData, qty: number) => TItem,
  onNotFoundMessage,
}: UseScannedLineItemsOptions<TItem>) {
  const lookupMutation = usePosLookupMutation(token);

  const [code, setCode] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [items, setItems] = useState<TItem[]>([]);

  const add = useCallback(async () => {
    const c = code.trim();
    if (!c) return;
    if (!branchId) {
      toast.error("Select a branch");
      return;
    }
    const qty = Math.max(1, Number(quantity) || 1);

    const res = await lookupMutation.mutateAsync({ code: c, branchId });
    if (!res?.success || !res?.data?.product?._id) {
      toast.error(onNotFoundMessage?.(res) || res?.message || "Not found");
      return;
    }

    const nextItem = buildItem(res.data as LookupData, qty);
    if (!nextItem?.productId) {
      toast.error("Invalid item");
      return;
    }

    setItems((prev) => {
      const next = [...prev];
      const idx = next.findIndex((i) => i.key === nextItem.key);
      if (idx >= 0) {
        next[idx] = { ...next[idx], quantity: (next[idx].quantity || 0) + qty };
        return next;
      }
      next.push(nextItem);
      return next;
    });

    setCode("");
    setQuantity("1");
  }, [code, quantity, branchId, lookupMutation, buildItem, onNotFoundMessage]);

  const updateQuantityAt = useCallback((index: number, nextQuantity: number | string) => {
    const q = Math.max(1, Number(nextQuantity) || 1);
    setItems((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], quantity: q };
      return next;
    });
  }, []);

  const updateItemAt = useCallback((index: number, patch: Partial<TItem>) => {
    setItems((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

  const removeAt = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setCode("");
    setQuantity("1");
    setItems([]);
  }, []);

  return {
    code,
    setCode,
    quantity,
    setQuantity,
    items,
    setItems,
    isLookingUp: lookupMutation.isPending,
    add,
    updateQuantityAt,
    updateItemAt,
    removeAt,
    reset,
  };
}
