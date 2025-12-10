// @/api/platform/order-api.ts
import { BaseApi, type RequestOptions, type PaginatedResponse, type ApiResponse } from "../api-factory";
import { handleApiRequest } from "../api-handler";
import type {
  Order,
  Shipping,
  CreateOrderPayload,
  CancelOrderPayload,
  CancelRequestPayload,
  UpdateStatusPayload,
  FulfillOrderPayload,
  RefundOrderPayload,
  RequestShippingPayload,
  UpdateShippingPayload,
} from "@/types/order.types";


// ==================== Request Options ====================

type FetchOptions = Omit<RequestOptions, 'token' | 'organizationId'>;

// ==================== Order API ====================

/**
 * Order API - extends base CRUD with customer/admin specific endpoints
 * 
 * Customer Endpoints:
 * - POST /orders - Create order (checkout from cart)
 * - GET /orders/my - List my orders
 * - GET /orders/my/:id - Get my order detail
 * - GET /orders/:id/shipping - Get shipping info
 * - POST /orders/:id/cancel - Cancel order
 * - POST /orders/:id/cancel-request - Request cancellation (admin review)
 * 
 * Admin Endpoints:
 * - GET /orders - List all orders
 * - GET /orders/:id - Get order by ID
 * - PATCH /orders/:id - Update order
 * - DELETE /orders/:id - Delete order
 * - PATCH /orders/:id/status - Update order status
 * - POST /orders/:id/fulfill - Ship order
 * - POST /orders/:id/refund - Refund order
 * - POST /orders/:id/shipping - Request shipping pickup
 * - PATCH /orders/:id/shipping - Update shipping status
 */
class OrderApi extends BaseApi {
  constructor(config = {}) {
    super('orders', config);
  }

  // ==================== Customer Endpoints ====================

  /**
   * Create order (checkout from cart)
   * POST /orders
   * Cart items are fetched server-side from user's cart
   */
  async checkout({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: CreateOrderPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Order>> {
    return handleApiRequest("POST", this.baseUrl, {
      token,
      body: data,
      ...options,
    });
  }

  /**
   * Get my orders (customer)
   * GET /orders/my
   */
  async getMyOrders({
    token,
    params = {},
    options = {},
  }: {
    token: string;
    params?: Record<string, unknown>;
    options?: FetchOptions;
  }): Promise<PaginatedResponse<Order>> {
    const processedParams = this.prepareParams(params);
    const queryString = this.createQueryString(processedParams);
    const url = queryString ? `${this.baseUrl}/my?${queryString}` : `${this.baseUrl}/my`;

    return handleApiRequest("GET", url, {
      token,
      cache: "no-store",
      ...options,
    });
  }

  /**
   * Get my order detail (customer)
   * GET /orders/my/:id
   */
  async getMyOrder({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Order>> {
    if (!id) throw new Error("Order ID is required");

    return handleApiRequest("GET", `${this.baseUrl}/my/${id}`, {
      token,
      cache: "no-store",
      ...options,
    });
  }

  /**
   * Cancel order (customer or admin)
   * POST /orders/:id/cancel
   */
  async cancel({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data?: CancelOrderPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Order>> {
    if (!id) throw new Error("Order ID is required");

    return handleApiRequest("POST", `${this.baseUrl}/${id}/cancel`, {
      token,
      body: data || {},
      ...options,
    });
  }

  /**
   * Request cancellation (awaits admin review)
   * POST /orders/:id/cancel-request
   */
  async requestCancel({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data?: CancelRequestPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Order>> {
    if (!id) throw new Error("Order ID is required");

    return handleApiRequest("POST", `${this.baseUrl}/${id}/cancel-request`, {
      token,
      body: data || {},
      ...options,
    });
  }

  // ==================== Shipping Endpoints ====================

  /**
   * Get shipping info (customer/admin)
   * GET /orders/:id/shipping
   */
  async getShipping({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Shipping>> {
    if (!id) throw new Error("Order ID is required");

    return handleApiRequest("GET", `${this.baseUrl}/${id}/shipping`, {
      token,
      cache: "no-store",
      ...options,
    });
  }

  /**
   * Request shipping pickup (admin)
   * POST /orders/:id/shipping
   */
  async requestShipping({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data: RequestShippingPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Shipping>> {
    if (!id) throw new Error("Order ID is required");
    if (!data?.provider) throw new Error("Shipping provider is required");

    return handleApiRequest("POST", `${this.baseUrl}/${id}/shipping`, {
      token,
      body: data,
      ...options,
    });
  }

  /**
   * Update shipping status (admin / webhook)
   * PATCH /orders/:id/shipping
   */
  async updateShipping({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data: UpdateShippingPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Shipping>> {
    if (!id) throw new Error("Order ID is required");
    if (!data?.status) throw new Error("Shipping status is required");

    return handleApiRequest("PATCH", `${this.baseUrl}/${id}/shipping`, {
      token,
      body: data,
      ...options,
    });
  }

  // ==================== Admin Endpoints ====================

  /**
   * Update order status (admin)
   * PATCH /orders/:id/status
   */
  async updateStatus({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data: UpdateStatusPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Order>> {
    if (!id) throw new Error("Order ID is required");
    if (!data?.status) throw new Error("Status is required");

    return handleApiRequest("PATCH", `${this.baseUrl}/${id}/status`, {
      token,
      body: data,
      ...options,
    });
  }

  /**
   * Fulfill order / Ship (admin)
   * POST /orders/:id/fulfill
   */
  async fulfill({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data?: FulfillOrderPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Order>> {
    if (!id) throw new Error("Order ID is required");

    return handleApiRequest("POST", `${this.baseUrl}/${id}/fulfill`, {
      token,
      body: data || {},
      ...options,
    });
  }

  /**
   * Refund order (admin)
   * POST /orders/:id/refund
   */
  async refund({
    token,
    id,
    data,
    options = {},
  }: {
    token: string;
    id: string;
    data: RefundOrderPayload;
    options?: FetchOptions;
  }): Promise<ApiResponse<Order>> {
    if (!id) throw new Error("Order ID is required");
    if (!data?.reason) throw new Error("Refund reason is required");

    return handleApiRequest("POST", `${this.baseUrl}/${id}/refund`, {
      token,
      body: data,
      ...options,
    });
  }
}

// Create and export singleton instance
export const orderApi = new OrderApi();

// Export class for custom configurations
export { OrderApi };
