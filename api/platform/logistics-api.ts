// @/api/platform/logistics-api.ts
import { BaseApi, type RequestOptions, type ApiResponse } from "../api-factory";
import { handleApiRequest } from "../api-handler";
import type {
  Shipment,
  TrackingResult,
  PickupStore,
  LogisticsConfig,
  ProviderCharges,
  CreateShipmentPayload,
  UpdateShipmentStatusPayload,
  CancelShipmentPayload,
  ProviderName,
} from "@/types/logistics.types";

// ==================== Request Options ====================

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

// ==================== Logistics API ====================

/**
 * Logistics API
 *
 * Manages shipments and delivery charge calculation.
 *
 * NOTE: For area data (divisions, districts, areas), use @classytic/bd-areas directly:
 * ```typescript
 * import { searchAreas, getAreasByDistrict, getArea } from '@classytic/bd-areas';
 * ```
 *
 * Public Endpoints:
 * - GET /logistics/charge - Calculate delivery charge via provider (RedX)
 *
 * Shipment Endpoints (Admin/Store Manager):
 * - POST /logistics/shipments - Create shipment
 * - GET /logistics/shipments/:id - Get shipment
 * - GET /logistics/shipments/:id/track - Track shipment
 * - PATCH /logistics/shipments/:id/status - Update status manually
 * - POST /logistics/shipments/:id/cancel - Cancel shipment
 *
 * Admin Endpoints:
 * - GET /logistics/config - Get config (read-only)
 * - GET /logistics/pickup-stores - List pickup stores
 * - GET /logistics/health/circuit-status - Get circuit breaker status
 * - POST /logistics/health/circuit-reset/:provider - Reset circuit breaker
 */
class LogisticsApi extends BaseApi<Shipment, CreateShipmentPayload> {
  constructor(config = {}) {
    super('logistics', config);
  }

  // ============================================
  // CHARGE CALCULATION (Public)
  // ============================================

  /**
   * Calculate delivery charge via provider API (e.g., RedX)
   * GET /logistics/charge
   *
   * Use this to get real-time delivery charges from the logistics provider
   * before creating an order.
   *
   * @param deliveryAreaId - Area internalId from @classytic/bd-areas
   * @param amount - COD amount in BDT (use 0 for prepaid orders)
   * @param weight - Parcel weight in grams (default: 500g)
   *
   * @example
   * import { searchAreas } from '@classytic/bd-areas';
   *
   * // 1. User selects area
   * const areas = searchAreas('mohamm');
   * const selectedArea = areas[0]; // { internalId: 1206, name: 'Mohammadpur', ... }
   *
   * // 2. Calculate delivery charge
   * const { data } = await logisticsApi.calculateCharge({
   *   deliveryAreaId: selectedArea.internalId,
   *   amount: isCOD ? cartTotal : 0,
   * });
   * // { deliveryCharge: 60, codCharge: 15, totalCharge: 75 }
   */
  async calculateCharge({
    deliveryAreaId,
    pickupAreaId,
    amount,
    weight,
    provider,
    options = {},
  }: {
    deliveryAreaId: number;
    pickupAreaId?: number;
    amount: number;
    weight?: number;
    provider?: ProviderName;
    options?: FetchOptions;
  }): Promise<ApiResponse<ProviderCharges>> {
    if (!deliveryAreaId || amount === undefined) {
      throw new Error("deliveryAreaId and amount are required");
    }

    const queryString = this.createQueryString({
      deliveryAreaId,
      pickupAreaId,
      amount,
      weight,
      provider,
    });

    return handleApiRequest("GET", `${this.baseUrl}/charge?${queryString}`, {
      cache: "no-store",
      ...options,
    });
  }

  // ============================================
  // CONFIG ENDPOINTS (Admin - Read-only)
  // ============================================

  /**
   * Get logistics configuration (read-only from .env)
   * GET /logistics/config
   *
   * NOTE: Configuration is managed via environment variables.
   * To change settings, update .env file and restart server.
   */
  async getConfig({
    token,
    options = {},
  }: {
    token: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<LogisticsConfig>> {
    return handleApiRequest("GET", `${this.baseUrl}/config`, {
      token,
      cache: "no-store",
      ...options,
    });
  }

  // ============================================
  // PICKUP STORES (Admin)
  // ============================================

  /**
   * Get pickup stores from RedX API
   * GET /logistics/pickup-stores
   *
   * Pickup stores are created by admin in RedX dashboard.
   * Use this to list available pickup locations when creating shipments.
   *
   * @example
   * // Admin: List pickup stores for shipment creation
   * const { data: stores } = await logisticsApi.getPickupStores({ token });
   *
   * // Display in dropdown for admin to select
   * stores.forEach(store => {
   *   console.log(`${store.name} - ${store.areaName} (ID: ${store.id})`);
   * });
   *
   * // Use selected store when creating shipment
   * await logisticsApi.createShipment({
   *   token,
   *   data: {
   *     orderId: order._id,
   *     pickupStoreId: selectedStore.id,  // From dropdown
   *   },
   * });
   */
  async getPickupStores({
    token,
    provider,
    options = {},
  }: {
    token: string;
    provider?: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<PickupStore[]>> {
    const queryString = provider ? `?provider=${provider}` : '';
    return handleApiRequest(
      "GET",
      `${this.baseUrl}/pickup-stores${queryString}`,
      {
        token,
        cache: "no-store",
        ...options,
      }
    );
  }

  // ============================================
  // SHIPMENT ENDPOINTS (Admin/Store Manager)
  // ============================================

  /**
   * Create shipment for an order via RedX API
   * POST /logistics/shipments
   *
   * This creates a parcel in RedX and updates the order with tracking info.
   *
   * @example
   * // Basic: Create shipment with default pickup store
   * const shipment = await logisticsApi.createShipment({
   *   token,
   *   data: { orderId: order._id },
   * });
   *
   * @example
   * // With specific pickup store (from getPickupStores)
   * const { data: stores } = await logisticsApi.getPickupStores({ token });
   * const shipment = await logisticsApi.createShipment({
   *   token,
   *   data: {
   *     orderId: order._id,
   *     pickupStoreId: stores[0].id,  // Select pickup location
   *     weight: 500,                   // Parcel weight in grams
   *     instructions: 'Handle with care',
   *   },
   * });
   *
   * // Response includes tracking ID
   * console.log(`Tracking: ${shipment.data.trackingId}`);
   */
  async createShipment({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: CreateShipmentPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Shipment>> {
    if (!data?.orderId) throw new Error("Order ID is required");

    return handleApiRequest("POST", `${this.baseUrl}/shipments`, {
      token,
      body: data,
      ...options,
    });
  }

  /**
   * Get shipment by ID
   * GET /logistics/shipments/:id
   */
  async getShipment({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Shipment>> {
    if (!id) throw new Error("Shipment ID is required");

    return handleApiRequest("GET", `${this.baseUrl}/shipments/${id}`, {
      token,
      cache: "no-store",
      ...options,
    });
  }

  /**
   * Track shipment (fetch latest from provider)
   * GET /logistics/shipments/:id/track
   */
  async trackShipment({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<TrackingResult>> {
    if (!id) throw new Error("Shipment ID is required");

    return handleApiRequest("GET", `${this.baseUrl}/shipments/${id}/track`, {
      token,
      cache: "no-store",
      ...options,
    });
  }

  /**
   * Update shipment status manually
   * PATCH /logistics/shipments/:id/status
   */
  async updateShipmentStatus({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data: UpdateShipmentStatusPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Shipment>> {
    if (!id) throw new Error("Shipment ID is required");
    if (!data?.status) throw new Error("Status is required");

    return handleApiRequest("PATCH", `${this.baseUrl}/shipments/${id}/status`, {
      token,
      body: data,
      ...options,
    });
  }

  /**
   * Cancel shipment
   * POST /logistics/shipments/:id/cancel
   */
  async cancelShipment({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data?: CancelShipmentPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Shipment>> {
    if (!id) throw new Error("Shipment ID is required");

    return handleApiRequest("POST", `${this.baseUrl}/shipments/${id}/cancel`, {
      token,
      body: data || {},
      ...options,
    });
  }

  // ============================================
  // HEALTH & MONITORING (Admin)
  // ============================================

  /**
   * Get circuit breaker status for all providers
   * GET /logistics/health/circuit-status
   */
  async getCircuitStatus({
    token,
    options = {},
  }: {
    token: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Record<string, { state: string; failureCount: number }>>> {
    return handleApiRequest("GET", `${this.baseUrl}/health/circuit-status`, {
      token,
      cache: "no-store",
      ...options,
    });
  }

  /**
   * Reset circuit breaker for a provider
   * POST /logistics/health/circuit-reset/:provider
   */
  async resetProviderCircuit({
    token,
    provider,
    options = {},
  }: {
    token: string;
    provider: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<{ message: string }>> {
    if (!provider) throw new Error("Provider name is required");

    return handleApiRequest(
      "POST",
      `${this.baseUrl}/health/circuit-reset/${provider}`,
      {
        token,
        body: {},
        ...options,
      }
    );
  }
}

// Create and export singleton instance
export const logisticsApi = new LogisticsApi();

// Export class for custom configurations
export { LogisticsApi };
