"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/api/platform/platform-api";
import { toast } from "sonner";

/**
 * Hook to fetch platform configuration
 *
 * @param {string|null} token - Access token (optional for public access)
 * @param {string|null} select - Optional field selection (e.g., "paymentMethods", "checkout,vat")
 * @returns {Object} Query result with config data
 *
 * @example
 * // Full config
 * const { config } = usePlatformConfig(token);
 *
 * // Selected fields
 * const { config } = usePlatformConfig(token, "paymentMethods");
 * const { config } = usePlatformConfig(null, "checkout"); // public
 */
export function usePlatformConfig(token = null, select = null) {
  const queryResult = useQuery({
    queryKey: ["platform-config", select],
    queryFn: async () => {
      const response = await platformApi.getConfig({ token, select });
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch platform config");
    },
    staleTime: token ? 0 : 5 * 60 * 1000, // 5 minutes for public, 0 for authenticated
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    config: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

/**
 * Hook to update platform configuration
 *
 * @param {string} token - Admin access token (required)
 * @returns {Object} Mutation helpers
 *
 * @example
 * const { updateConfig, isUpdating } = useUpdatePlatformConfig(token);
 *
 * // Update payment methods
 * await updateConfig({
 *   paymentMethods: [
 *     { type: 'cash', name: 'Cash', isActive: true },
 *     { type: 'mfs', provider: 'bkash', name: 'bKash', walletNumber: '01712345678' }
 *   ]
 * });
 */
export function useUpdatePlatformConfig(token) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await platformApi.updateConfig({ token, data });
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to update platform config");
    },
    onSuccess: () => {
      // Invalidate all platform-config queries
      queryClient.invalidateQueries({ queryKey: ["platform-config"] });
      queryClient.invalidateQueries({ queryKey: ["platform-delivery"] });

      toast.success("Configuration updated successfully");
    },
    onError: (error) => {
      console.error("Platform config update error:", error);
      toast.error(error.message || "Failed to update configuration");
    },
  });

  return {
    updateConfig: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to fetch payment methods only
 * Convenience hook for checkout/POS
 *
 * @param {string|null} token - Optional access token
 * @returns {Object} Query result with payment methods
 */
export function usePaymentMethods(token = null) {
  const queryResult = useQuery({
    queryKey: ["platform-config", "paymentMethods"],
    queryFn: async () => {
      const response = await platformApi.getPaymentMethods({ token });
      if (response.success) {
        return response.data?.paymentMethods || [];
      }
      throw new Error(response.message || "Failed to fetch payment methods");
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    paymentMethods: queryResult.data || [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

/**
 * Hook to fetch delivery zones
 * Convenience hook for checkout
 *
 * @param {string|null} token - Optional access token
 * @returns {Object} Query result with delivery zones
 */
export function useDeliveryZones(token = null) {
  const queryResult = useQuery({
    queryKey: ["platform-config", "checkout"],
    queryFn: async () => {
      const response = await platformApi.getCheckoutSettings({ token });
      if (response.success) {
        return response.data?.checkout || {};
      }
      throw new Error(response.message || "Failed to fetch checkout settings");
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const checkout = queryResult.data || {};

  return {
    deliveryZones: checkout.deliveryZones || [],
    freeDeliveryThreshold: checkout.freeDeliveryThreshold || 0,
    allowStorePickup: checkout.allowStorePickup || false,
    pickupBranches: checkout.pickupBranches || [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
