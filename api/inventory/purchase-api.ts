// @/api/inventory/purchase-api.ts
import { BaseApi, type ApiResponse, type PaginatedResponse, type RequestOptions } from "../api-factory";
import { handleApiRequest } from "../api-handler";
import type {
  Purchase,
  CreatePurchasePayload,
  UpdatePurchasePayload,
  PurchaseActionType,
  StockMovement,
  StockEntry,
} from "@/types/inventory.types";

type FetchOptions = Omit<RequestOptions, "token" | "organizationId">;

/**
 * Purchase API - Supplier Invoices & Stock Entry
 *
 * Base path: /api/v1/inventory/purchases
 *
 * Purchases are the only official way to bring new inventory into the system.
 * They are Head Office only and drive COGS (weighted average cost).
 *
 * Standard CRUD:
 * - create({ token, data }) - Create purchase invoice (draft)
 * - getAll({ token, params }) - List purchases with filtering
 * - getById({ token, id }) - Get purchase by ID
 * - update({ token, id, data }) - Update draft purchase
 *
 * Actions (Stripe pattern):
 * - receive({ token, id }) - Receive purchase (creates stock movements)
 * - pay({ token, id, amount, method, reference }) - Record payment
 * - cancel({ token, id, reason }) - Cancel draft/approved purchase
 *
 * @see docs/api/commerce/inventory/purchases.md
 */
class PurchaseApi extends BaseApi<Purchase, CreatePurchasePayload, UpdatePurchasePayload> {
  constructor(config = {}) {
    super("inventory/purchases", config);
  }

  // ==================== Actions (Stripe Pattern) ====================

  /**
   * Perform a purchase action (receive/pay/cancel)
   * POST /inventory/purchases/:id/action
   *
   * @param token - Auth token
   * @param id - Purchase ID
   * @param action - Action type
   * @param data - Additional action data
   * @param options - Request options
   * @returns Updated purchase
   */
  async action({
    token,
    id,
    action,
    data = {},
    options = {},
  }: {
    token: string;
    id: string;
    action: PurchaseActionType;
    data?: Record<string, unknown>;
    options?: FetchOptions;
  }): Promise<ApiResponse<Purchase>> {
    if (!id) {
      throw new Error("Purchase ID is required");
    }

    return handleApiRequest("POST", `${this.baseUrl}/${id}/action`, {
      token,
      body: { action, ...data },
      cache: this.config.cache,
      ...options,
    });
  }

  /**
   * Receive a purchase (auto-approves draft and creates stock movements)
   * POST /inventory/purchases/:id/action { action: 'receive' }
   *
   * @param token - Auth token
   * @param id - Purchase ID
   * @param options - Request options
   * @returns Received purchase with stock entries
   */
  async receive({
    token,
    id,
    options = {},
  }: {
    token: string;
    id: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Purchase>> {
    return this.action({ token, id, action: "receive", options });
  }

  /**
   * Record payment for a purchase
   * POST /inventory/purchases/:id/action { action: 'pay', amount, method, reference }
   *
   * @param token - Auth token
   * @param id - Purchase ID
   * @param amount - Payment amount in BDT
   * @param method - Payment method (cash, bank_transfer, etc.)
   * @param reference - Payment reference (transaction ID)
   * @param options - Request options
   * @returns Updated purchase with payment status
   */
  async pay({
    token,
    id,
    amount,
    method,
    reference,
    options = {},
  }: {
    token: string;
    id: string;
    amount: number;
    method: string;
    reference?: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Purchase>> {
    return this.action({
      token,
      id,
      action: "pay",
      data: { amount, method, reference },
      options,
    });
  }

  /**
   * Cancel a purchase (draft or approved only)
   * POST /inventory/purchases/:id/action { action: 'cancel', reason }
   *
   * @param token - Auth token
   * @param id - Purchase ID
   * @param reason - Cancellation reason
   * @param options - Request options
   * @returns Cancelled purchase
   */
  async cancel({
    token,
    id,
    reason,
    options = {},
  }: {
    token: string;
    id: string;
    reason?: string;
    options?: FetchOptions;
  }): Promise<ApiResponse<Purchase>> {
    return this.action({
      token,
      id,
      action: "cancel",
      data: { reason },
      options,
    });
  }

  // ==================== Legacy Methods (Backward Compatibility) ====================

  /**
   * Record a stock purchase (legacy method)
   * Creates and optionally auto-receives a purchase
   *
   * @deprecated Use create() with autoReceive: true instead
   */
  async recordPurchase({
    token,
    data,
    options = {},
  }: {
    token: string;
    data: CreatePurchasePayload;
    options?: FetchOptions;
  }): Promise<
    ApiResponse<{
      stockEntries: StockEntry[];
      movements: StockMovement[];
    }>
  > {
    // Set autoReceive to maintain backward compatibility
    const payload = { ...data, autoReceive: true };
    return handleApiRequest("POST", this.baseUrl, {
      token,
      body: payload,
      cache: this.config.cache,
      ...options,
    });
  }
}

// Create and export a singleton instance
export const purchaseApi = new PurchaseApi();
export { PurchaseApi };
