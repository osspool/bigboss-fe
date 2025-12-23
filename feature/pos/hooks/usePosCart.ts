"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { PosProduct } from "@/types/pos.types";
import type { PosCartItem } from "../dashboard/pos.types";
import {
  calculateVariantPrice,
  formatVariantLabel,
  getVariantStock,
  getPosProductImage,
} from "@/hooks/query/usePos";
import { calculateCartTotals } from "../utils";

export interface UsePosCartReturn {
  cart: PosCartItem[];
  cartSummary: {
    subtotal: number;
    discount: number;
    total: number;
    itemCount: number;
  };
  discountInput: string;
  setDiscountInput: (value: string) => void;
  addToCart: (product: PosProduct, variantSku?: string) => void;
  updateQuantity: (index: number, delta: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  resetCart: () => void;
}

export function usePosCart(): UsePosCartReturn {
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [discountInput, setDiscountInput] = useState("");

  const cartSummary = useMemo(
    () => calculateCartTotals(cart, discountInput),
    [cart, discountInput]
  );

  const addToCart = useCallback((product: PosProduct, variantSku?: string) => {
    const variant = variantSku
      ? product.variants?.find((v) => v.sku === variantSku)
      : null;

    // Check stock
    if (variantSku) {
      const stock = getVariantStock(product, variantSku);
      if (stock <= 0) {
        toast.error("Out of stock");
        return;
      }
    } else if (!product.branchStock?.inStock) {
      toast.error("Out of stock");
      return;
    }

    const unitPrice = variant
      ? calculateVariantPrice(product.basePrice, variant.priceModifier)
      : product.basePrice;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product._id && item.variantSku === variantSku
      );

      if (existingIndex >= 0) {
        const next = [...prev];
        const existing = next[existingIndex];
        const quantity = existing.quantity + 1;
        next[existingIndex] = {
          ...existing,
          quantity,
          lineTotal: quantity * unitPrice,
        };
        return next;
      }

      const newItem: PosCartItem = {
        productId: product._id,
        productName: product.name,
        variantSku,
        variantLabel: variant?.attributes
          ? formatVariantLabel(variant.attributes)
          : undefined,
        quantity: 1,
        unitPrice,
        lineTotal: unitPrice,
        image: getPosProductImage(product),
      };
      return [...prev, newItem];
    });

    toast.success("Added to cart");
  }, []);

  const updateQuantity = useCallback((index: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) return prev;
      const quantity = Math.max(1, item.quantity + delta);
      next[index] = { ...item, quantity, lineTotal: quantity * item.unitPrice };
      return next;
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    if (window.confirm("Clear all items from cart?")) {
      setCart([]);
    }
  }, []);

  const resetCart = useCallback(() => {
    setCart([]);
    setDiscountInput("");
  }, []);

  return {
    cart,
    cartSummary,
    discountInput,
    setDiscountInput,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    resetCart,
  };
}
