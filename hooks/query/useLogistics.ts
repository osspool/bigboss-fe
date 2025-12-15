"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { logisticsApi } from "@/api/platform/logistics-api";
import type {
  Shipment,
  PickupStore,
  TrackingResult,
  CreateShipmentPayload,
  ProviderCharges,
  ProviderName,
} from "@/types/logistics.types";

// ==================== Query Keys ====================

export const LOGISTICS_KEYS = {
  all: ["logistics"] as const,
  pickupStores: (provider?: string) => [...LOGISTICS_KEYS.all, "pickup-stores", provider] as const,
  shipment: (id: string) => [...LOGISTICS_KEYS.all, "shipment", id] as const,
  tracking: (id: string) => [...LOGISTICS_KEYS.all, "tracking", id] as const,
  charge: (params: { deliveryAreaId: number; amount: number; weight?: number }) =>
    [...LOGISTICS_KEYS.all, "charge", params] as const,
  config: () => [...LOGISTICS_KEYS.all, "config"] as const,
};

// ==================== Query Options Types ====================

type QueryOptions = {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
};

// ==================== Pickup Stores ====================

/**
 * Fetch pickup stores from logistics provider (RedX)
 * Used for selecting pickup location when creating shipments
 */
export function usePickupStores(token: string, provider?: string, options: QueryOptions = {}) {
  return useQuery({
    queryKey: LOGISTICS_KEYS.pickupStores(provider),
    queryFn: async (): Promise<PickupStore[]> => {
      const response = await logisticsApi.getPickupStores({ token, provider });
      return response.data || [];
    },
    enabled: options.enabled !== false && !!token,
    staleTime: options.staleTime ?? 5 * 60 * 1000, // 5 minutes - stores don't change often
  });
}

// ==================== Calculate Delivery Charge ====================

interface ChargeParams {
  deliveryAreaId: number;
  pickupAreaId?: number;
  amount: number;
  weight?: number;
  provider?: ProviderName;
}

/**
 * Calculate delivery charge via provider API (raw query)
 *
 * @example
 * const { data: charges } = useDeliveryChargeCalculation(token, {
 *   deliveryAreaId: 1206,
 *   amount: isCOD ? cartTotal : 0,
 * });
 */
export function useDeliveryChargeCalculation(
  token: string | null,
  params: ChargeParams | null,
  options: QueryOptions = {}
) {
  const hasValidParams = !!params?.deliveryAreaId && params?.amount !== undefined;

  return useQuery({
    queryKey: LOGISTICS_KEYS.charge(
      params
        ? { deliveryAreaId: params.deliveryAreaId, amount: params.amount, weight: params.weight }
        : { deliveryAreaId: 0, amount: 0 }
    ),
    queryFn: async (): Promise<ProviderCharges> => {
      if (!params) throw new Error("Params required");
      const response = await logisticsApi.calculateCharge({
        deliveryAreaId: params.deliveryAreaId,
        pickupAreaId: params.pickupAreaId,
        amount: params.amount,
        weight: params.weight,
        provider: params.provider,
      });
      if (!response.data) throw new Error("No charge data returned");
      return response.data;
    },
    enabled: options.enabled !== false && hasValidParams,
    staleTime: options.staleTime ?? 60 * 1000, // 1 minute
  });
}

// ==================== Delivery Charge Hook (Convenience) ====================

interface UseDeliveryChargeParams {
  /** Area internalId from @classytic/bd-areas */
  deliveryAreaId: number | null | undefined;
  /** Order amount for COD charge calculation (0 for prepaid) */
  amount: number;
  /** Parcel weight in grams (optional, default: 500g) */
  weight?: number;
  /** Enable/disable the query */
  enabled?: boolean;
}

interface UseDeliveryChargeReturn {
  /** Delivery charges from provider */
  charges: ProviderCharges | null;
  /** Delivery charge only */
  deliveryCharge: number;
  /** COD charge only */
  codCharge: number;
  /** Total charge (delivery + COD) */
  totalCharge: number;
  /** Loading state */
  isLoading: boolean;
  /** Fetching state (for refetches) */
  isFetching: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch function */
  refetch: () => void;
}

/**
 * Hook to fetch delivery charges from logistics API
 * Convenience wrapper with extracted charge values
 *
 * @example
 * const { deliveryCharge, isLoading } = useDeliveryCharge({
 *   deliveryAreaId: selectedAddress?.areaId,
 *   amount: isCOD ? subtotal : 0,
 * });
 */
export function useDeliveryCharge({
  deliveryAreaId,
  amount,
  weight = 500,
  enabled = true,
}: UseDeliveryChargeParams): UseDeliveryChargeReturn {
  const { data, isLoading, isFetching, error, refetch } = useQuery<ProviderCharges | null>({
    queryKey: LOGISTICS_KEYS.charge({
      deliveryAreaId: deliveryAreaId || 0,
      amount,
      weight,
    }),
    queryFn: async () => {
      if (!deliveryAreaId) return null;

      const response = await logisticsApi.calculateCharge({
        deliveryAreaId,
        amount,
        weight,
      });

      return response.data || null;
    },
    enabled: enabled && !!deliveryAreaId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  return {
    charges: data || null,
    deliveryCharge: data?.deliveryCharge ?? 0,
    codCharge: data?.codCharge ?? 0,
    totalCharge: data?.totalCharge ?? 0,
    isLoading,
    isFetching,
    error: error as Error | null,
    refetch,
  };
}

// ==================== Shipment Queries ====================

/**
 * Get shipment by ID
 */
export function useShipment(token: string, shipmentId: string | null, options: QueryOptions = {}) {
  return useQuery({
    queryKey: LOGISTICS_KEYS.shipment(shipmentId || ""),
    queryFn: async (): Promise<Shipment> => {
      if (!shipmentId) throw new Error("Shipment ID required");
      const response = await logisticsApi.getShipment({ token, id: shipmentId });
      if (!response.data) throw new Error("Shipment not found");
      return response.data;
    },
    enabled: options.enabled !== false && !!token && !!shipmentId,
    staleTime: options.staleTime ?? 30 * 1000, // 30 seconds
  });
}

/**
 * Track shipment - fetches latest status from provider
 */
export function useTrackShipment(token: string, shipmentId: string | null, options: QueryOptions = {}) {
  return useQuery({
    queryKey: LOGISTICS_KEYS.tracking(shipmentId || ""),
    queryFn: async (): Promise<TrackingResult> => {
      if (!shipmentId) throw new Error("Shipment ID required");
      const response = await logisticsApi.trackShipment({ token, id: shipmentId });
      if (!response.data) throw new Error("Tracking data not found");
      return response.data;
    },
    enabled: options.enabled !== false && !!token && !!shipmentId,
    staleTime: options.staleTime ?? 60 * 1000, // 1 minute
    refetchInterval: options.refetchInterval ?? 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

// ==================== Shipment Mutations ====================

/**
 * Create shipment via logistics provider API
 *
 * After successful creation:
 * - Shipment record created in our system
 * - Order.shipping updated with tracking info
 * - Order queries invalidated
 */
export function useCreateShipment(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateShipmentPayload) => {
      const response = await logisticsApi.createShipment({ token, data });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Shipment created successfully");
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: LOGISTICS_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create shipment");
    },
  });
}

/**
 * Cancel shipment
 */
export function useCancelShipment(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shipmentId, reason }: { shipmentId: string; reason?: string }) => {
      const response = await logisticsApi.cancelShipment({
        token,
        id: shipmentId,
        data: { reason },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Shipment cancelled");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: LOGISTICS_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel shipment");
    },
  });
}

/**
 * Update shipment status manually (admin)
 */
export function useUpdateShipmentStatus(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shipmentId,
      status,
      message,
    }: {
      shipmentId: string;
      status: string;
      message?: string;
    }) => {
      const response = await logisticsApi.updateShipmentStatus({
        token,
        id: shipmentId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { status: status as any, message },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Shipment status updated");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: LOGISTICS_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}

// ==================== Combined Logistics Actions Hook ====================

/**
 * Combined hook for all logistics mutations
 * Use this in components that need multiple logistics actions
 */
export function useLogisticsActions(token: string) {
  const createShipment = useCreateShipment(token);
  const cancelShipment = useCancelShipment(token);
  const updateStatus = useUpdateShipmentStatus(token);

  return {
    // Create
    createShipment: createShipment.mutateAsync,
    isCreatingShipment: createShipment.isPending,
    // Cancel
    cancelShipment: cancelShipment.mutateAsync,
    isCancellingShipment: cancelShipment.isPending,
    // Update status
    updateShipmentStatus: updateStatus.mutateAsync,
    isUpdatingStatus: updateStatus.isPending,
    // Combined loading state
    isLoading: createShipment.isPending || cancelShipment.isPending || updateStatus.isPending,
  };
}
