"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/api/platform/platform-api";
import { toast } from "sonner";

/**
 * Hook to fetch platform configuration
 * @param {string} token - Access token (optional for public access)
 * @param {string} select - Optional field selection (e.g., "payment,deliveryOptions")
 * @returns {Object} Query result with config data
 */
export function usePlatformConfig(token = null, select = null) {
  const queryResult = useQuery({
    queryKey: ["platform-config", select],
    queryFn: async () => {
      const response = await platformApi.getConfig(token, select);
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
 * @param {string} token - Admin access token (required)
 * @returns {Object} Mutation helpers
 */
export function useUpdatePlatformConfig(token) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await platformApi.updateConfig(data, token);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to update platform config");
    },
    onSuccess: (data) => {
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


