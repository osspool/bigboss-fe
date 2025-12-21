import { BaseApi } from '@/api/api-factory';
import type {
  Order,
  OrderShipping,
  CreateOrderPayload,
  UpdateStatusPayload,
  FulfillOrderPayload,
  RefundOrderPayload,
  RequestShippingPayload,
  UpdateShippingPayload,
} from '@/types/order.types';

/**
 * Order API Client
 *
 * Customer: checkout, getMyOrders, getMyOrder, cancel, requestCancellation
 * Admin: updateStatus, fulfill, refund, requestShipping, updateShipping
 *
 * @see docs/api/commerce/checkout.md
 * @see docs/api/commerce/order.md
 */
class OrderApi extends BaseApi<Order, CreateOrderPayload, Partial<Order>> {

  // ============ Customer ============

  /**
   * Checkout - create order from cart
   * POST /api/v1/orders
   *
   * @see docs/api/commerce/checkout.md
   */
  checkout = ({ token, organizationId, data }: {
    token: string;
    organizationId?: string | null;
    data: CreateOrderPayload;
  }) => this.create({ token, organizationId, data });

  /** Get my orders */
  getMyOrders = ({ token, params = {} }: {
    token: string;
    params?: Record<string, unknown>;
  }) => this.request<Order[]>('GET', `${this.baseUrl}/my`, { token, params });

  /** Get my order detail */
  getMyOrder = ({ token, id }: {
    token: string;
    id: string;
  }) => this.request<Order>('GET', `${this.baseUrl}/my/${id}`, { token });

  /** Cancel order */
  cancel = ({ token, id, reason, refund = false }: {
    token: string;
    id: string;
    reason?: string;
    refund?: boolean;
  }) => this.request<Order>('POST', `${this.baseUrl}/${id}/cancel`, {
    token,
    data: { reason, refund },
  });

  /** Request cancellation (awaits admin review) */
  requestCancellation = ({ token, id, reason }: {
    token: string;
    id: string;
    reason?: string;
  }) => this.request<Order>('POST', `${this.baseUrl}/${id}/cancel-request`, {
    token,
    data: { reason },
  });

  // ============ Admin ============

  /** Update order status */
  updateStatus = ({ token, organizationId, id, data }: {
    token: string;
    organizationId?: string | null;
    id: string;
    data: UpdateStatusPayload;
  }) => this.request<Order>('PATCH', `${this.baseUrl}/${id}/status`, {
    token,
    organizationId,
    data,
  });

  /**
   * Fulfill order (ship)
   * - Decrements inventory from branch
   * - recordCogs: true → also creates COGS expense transaction
   */
  fulfill = ({ token, organizationId, id, data = {} }: {
    token: string;
    organizationId?: string | null;
    id: string;
    data?: FulfillOrderPayload;
  }) => this.request<Order>('POST', `${this.baseUrl}/${id}/fulfill`, {
    token,
    organizationId,
    data,
  });

  /** Refund order */
  refund = ({ token, organizationId, id, data = {} }: {
    token: string;
    organizationId?: string | null;
    id: string;
    data?: RefundOrderPayload;
  }) => this.request<Order>('POST', `${this.baseUrl}/${id}/refund`, {
    token,
    organizationId,
    data,
  });

  // ============ Shipping ============

  /** Get shipping info */
  getShipping = ({ token, id }: {
    token: string;
    id: string;
  }) => this.request<OrderShipping>('GET', `${this.baseUrl}/${id}/shipping`, { token });

  /** Request shipping pickup */
  requestShipping = ({ token, organizationId, id, data }: {
    token: string;
    organizationId?: string | null;
    id: string;
    data: RequestShippingPayload;
  }) => this.request<OrderShipping>('POST', `${this.baseUrl}/${id}/shipping`, {
    token,
    organizationId,
    data,
  });

  /** Update shipping status */
  updateShipping = ({ token, organizationId, id, data }: {
    token: string;
    organizationId?: string | null;
    id: string;
    data: UpdateShippingPayload;
  }) => this.request<OrderShipping>('PATCH', `${this.baseUrl}/${id}/shipping`, {
    token,
    organizationId,
    data,
  });
}

export const orderApi = new OrderApi('orders');
export default orderApi;
