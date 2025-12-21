import type { PlatformConfig, PaymentMethod } from "@/types/platform.types";

// usePlatformConfig
export interface UsePlatformConfigResult {
  config: PlatformConfig | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePlatformConfig(token?: string | null, select?: string | null): UsePlatformConfigResult;

// useUpdatePlatformConfig
export interface UseUpdatePlatformConfigResult {
  updateConfig: (data: Partial<PlatformConfig>) => Promise<PlatformConfig>;
  isUpdating: boolean;
  error: Error | null;
}

export function useUpdatePlatformConfig(token: string): UseUpdatePlatformConfigResult;

// usePaymentMethods
export interface UsePaymentMethodsResult {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePaymentMethods(token?: string | null): UsePaymentMethodsResult;

// useDeliveryZones
export interface DeliveryZone {
  name: string;
  areas: string[];
  deliveryFee: number;
  estimatedDays: number;
}

export interface PickupBranch {
  _id: string;
  name: string;
  address?: string;
}

export interface UseDeliveryZonesResult {
  deliveryZones: DeliveryZone[];
  freeDeliveryThreshold: number;
  allowStorePickup: boolean;
  pickupBranches: PickupBranch[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useDeliveryZones(token?: string | null): UseDeliveryZonesResult;
