"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/api/platform/platform-api";
import { toast } from "sonner";
import type {
  PlatformConfig,
  UpdatePlatformConfigPayload,
  CheckoutSettings,
  PaymentMethodConfig,
  MembershipConfig,
} from "@/types/platform.types";

// ============================================
// PLATFORM CONFIG HOOK
// ============================================

/**
 * Hook to fetch platform configuration
 */
export function usePlatformConfig(token: string | null = null, select: string | null = null) {
  const queryResult = useQuery<PlatformConfig>({
    queryKey: ["platform-config", select],
    queryFn: async () => {
      const response = await platformApi.getConfig({ token, select });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.message || "Failed to fetch platform config"
      );
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

// ============================================
// UPDATE PLATFORM CONFIG HOOK
// ============================================

/**
 * Hook to update platform configuration
 */
export function useUpdatePlatformConfig(token: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: UpdatePlatformConfigPayload) => {
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
    onError: (error: Error) => {
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

// ============================================
// PAYMENT METHODS HOOK
// ============================================

/**
 * Hook to fetch payment methods only
 * Convenience hook for checkout/POS
 */
export function usePaymentMethods(token: string | null = null) {
  const queryResult = useQuery<PaymentMethodConfig[]>({
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

// ============================================
// DELIVERY ZONES HOOK
// ============================================

/**
 * Hook to fetch delivery zones
 * Convenience hook for checkout
 */
export function useDeliveryZones(token: string | null = null) {
  const queryResult = useQuery<CheckoutSettings>({
    queryKey: ["platform-config", "checkout"],
    queryFn: async () => {
      const response = await platformApi.getCheckoutSettings({ token });
      if (response.success) {
        return response.data?.checkout || ({} as CheckoutSettings);
      }
      throw new Error(response.message || "Failed to fetch checkout settings");
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const checkout = queryResult.data;

  return {
    deliveryZones: checkout?.deliveryZones || [],
    freeDeliveryThreshold: checkout?.freeDeliveryThreshold || 0,
    allowStorePickup: checkout?.allowStorePickup || false,
    pickupBranches: checkout?.pickupBranches || [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

// ============================================
// MEMBERSHIP CONFIG HOOK
// ============================================

/**
 * Hook to fetch membership config only
 * Convenience hook for loyalty programs
 */
export function useMembershipConfig(token: string | null = null) {
  const queryResult = useQuery<MembershipConfig | null>({
    queryKey: ["platform-config", "membership"],
    queryFn: async () => {
      const response = await platformApi.getMembershipConfig({ token });
      if (response.success) {
        return response.data?.membership || null;
      }
      throw new Error(response.message || "Failed to fetch membership config");
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    membership: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
