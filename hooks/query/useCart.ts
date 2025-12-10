"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/api/platform/cart-api";
import { toast } from "sonner";
import {
  calculateItemPrice,
  calculateCartSubtotal,
  getCartItemCount,
} from "@/lib/commerce-utils";
import type { Cart, CartItem, AddToCartPayload, UpdateCartItemPayload } from "@/types";

export const CART_QUERY_KEY = ["cart"];

interface UseCartReturn {
  cart: Cart | null | undefined;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  isFetching: boolean;
  isUpdating: boolean;
  error: Error | null;
  addToCart: (data: AddToCartPayload) => void;
  updateCartItem: (data: UpdateCartItemPayload) => void;
  removeCartItem: (itemId: string) => void;
  clearCart: () => void;
  getItemPrice: typeof calculateItemPrice;
}

/**
 * Cart hook with React Query
 */
export function useCart(token: string | null | undefined): UseCartReturn {
  const queryClient = useQueryClient();

  // Query
  const { data: cart, isLoading, error, isFetching } = useQuery<Cart | null>({
    queryKey: CART_QUERY_KEY,
    queryFn: () => cartApi.getCart(token!),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Add to cart
  const addMutation = useMutation({
    mutationFn: (data: AddToCartPayload) => cartApi.addToCart(token!, data),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      return { previousCart: queryClient.getQueryData<Cart>(CART_QUERY_KEY) };
    },
    onError: (err: Error, _, context) => {
      if (context?.previousCart) queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      toast.error(err.message || "Failed to add item");
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
      toast.success("Added to cart!");
    },
  });

  // Update quantity
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: UpdateCartItemPayload) =>
      cartApi.updateCartItem(token!, itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<Cart>(CART_QUERY_KEY);
      
      queryClient.setQueryData<Cart | null>(CART_QUERY_KEY, (old) =>
        old ? { ...old, items: old.items.map((i) => (i._id === itemId ? { ...i, quantity } : i)) } : old
      );
      
      return { previousCart };
    },
    onError: (err: Error, _, context) => {
      if (context?.previousCart) queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      toast.error(err.message || "Failed to update");
    },
    onSuccess: (data) => queryClient.setQueryData(CART_QUERY_KEY, data),
  });

  // Remove item
  const removeMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeCartItem(token!, itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<Cart>(CART_QUERY_KEY);
      
      queryClient.setQueryData<Cart | null>(CART_QUERY_KEY, (old) =>
        old ? { ...old, items: old.items.filter((i) => i._id !== itemId) } : old
      );
      
      return { previousCart };
    },
    onError: (err: Error, _, context) => {
      if (context?.previousCart) queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      toast.error(err.message || "Failed to remove");
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
      toast.success("Item removed");
    },
  });

  // Clear cart
  const clearMutation = useMutation({
    mutationFn: () => cartApi.clearCart(token!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<Cart>(CART_QUERY_KEY);
      queryClient.setQueryData<Cart | null>(CART_QUERY_KEY, (old) => (old ? { ...old, items: [] } : old));
      return { previousCart };
    },
    onError: (err: Error, _, context) => {
      if (context?.previousCart) queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      toast.error(err.message || "Failed to clear cart");
    },
    onSuccess: (data) => {
      queryClient.setQueryData(CART_QUERY_KEY, data);
      toast.success("Cart cleared");
    },
  });

  const items = cart?.items || [];
  const isUpdating = addMutation.isPending || updateMutation.isPending || removeMutation.isPending || clearMutation.isPending;

  return {
    cart,
    items,
    itemCount: getCartItemCount(items),
    subtotal: calculateCartSubtotal(items),
    isLoading,
    isFetching,
    isUpdating,
    error,
    addToCart: (data: AddToCartPayload) => addMutation.mutate(data),
    updateCartItem: (data: UpdateCartItemPayload) => updateMutation.mutate(data),
    removeCartItem: (itemId: string) => removeMutation.mutate(itemId),
    clearCart: () => clearMutation.mutate(),
    getItemPrice: calculateItemPrice,
  };
}

/**
 * Lightweight hook for cart count (header badge)
 */
export function useCartCount(token: string | null | undefined) {
  const { data: cart, isLoading } = useQuery<Cart | null>({
    queryKey: CART_QUERY_KEY,
    queryFn: () => cartApi.getCart(token!),
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    count: getCartItemCount(cart?.items || []),
    isLoading,
  };
}
