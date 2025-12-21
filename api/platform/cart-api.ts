import { type ApiResponse } from "../api-factory";
import { handleApiRequest } from "../api-handler";
import type { Cart, AddCartItemPayload } from "@/types/cart.types";

const ENDPOINT = "/api/v1/cart";

/**
 * Cart API Client
 *
 * **Authentication:** Required for all endpoints (use Bearer token)
 *
 * **Base URL:** `/api/v1/cart`
 *
 * **Endpoints:**
 * - `GET /api/v1/cart` - Get current user's cart (auto-creates if doesn't exist)
 * - `POST /api/v1/cart/items` - Add item to cart (productId + quantity + optional variantSku)
 * - `PATCH /api/v1/cart/items/:itemId` - Update cart item quantity
 * - `DELETE /api/v1/cart/items/:itemId` - Remove item from cart
 * - `DELETE /api/v1/cart` - Clear all items from cart
 *
 * **Response Format:** All endpoints return `{ success: true, data: Cart }`
 *
 * **Error Format:** `{ success: false, message: "error description" }`
 *
 * **Common Errors:**
 * - 400: Product not found, invalid variant, insufficient stock
 * - 401: Not authenticated
 * - 404: Cart/item not found
 *
 * @see {@link file://d:/projects/ecom/bigboss/fe-prod/docs/api/commerce/cart.md Cart API Guide}
 */
export const cartApi = {
  /**
   * Get current user's cart
   * GET /api/v1/cart
   *
   * Auto-creates cart if it doesn't exist for the user.
   * Returns cart with fully populated product details.
   *
   * @param token - User authentication token
   * @returns Cart with items array
   *
   * @example
   * ```typescript
   * const cart = await cartApi.getCart(token);
   * console.log(cart.items); // [{ _id, product, variantSku, quantity }]
   * ```
   */
  getCart: async (token: string): Promise<Cart> => {
    const response = await handleApiRequest<ApiResponse<Cart>>("GET", ENDPOINT, { token });
    return response.data!;
  },

  /**
   * Add item to cart
   * POST /api/v1/cart/items
   *
   * @param token - User authentication token
   * @param data - Product ID, quantity, and optional variant SKU
   * @returns Updated cart
   *
   * @example Simple Product
   * ```typescript
   * await cartApi.addToCart(token, {
   *   productId: "507f...",
   *   quantity: 2
   * });
   * ```
   *
   * @example Variant Product
   * ```typescript
   * await cartApi.addToCart(token, {
   *   productId: "507f...",
   *   variantSku: "TSHIRT-M-RED",
   *   quantity: 1
   * });
   * ```
   */
  addToCart: async (token: string, data: AddCartItemPayload): Promise<Cart> => {
    const response = await handleApiRequest<ApiResponse<Cart>>("POST", `${ENDPOINT}/items`, {
      token,
      body: data,
    });
    return response.data!;
  },

  /**
   * Update cart item quantity
   * PATCH /api/v1/cart/items/:itemId
   *
   * @param token - User authentication token
   * @param itemId - Cart item ID (from cart.items[].\_id)
   * @param quantity - New quantity (minimum: 1)
   * @returns Updated cart
   *
   * @example
   * ```typescript
   * await cartApi.updateCartItem(token, "item_id", 3);
   * ```
   */
  updateCartItem: async (token: string, itemId: string, quantity: number): Promise<Cart> => {
    const response = await handleApiRequest<ApiResponse<Cart>>("PATCH", `${ENDPOINT}/items/${itemId}`, {
      token,
      body: { quantity },
    });
    return response.data!;
  },

  /**
   * Remove item from cart
   * DELETE /api/v1/cart/items/:itemId
   *
   * @param token - User authentication token
   * @param itemId - Cart item ID (from cart.items[].\_id)
   * @returns Updated cart
   *
   * @example
   * ```typescript
   * await cartApi.removeCartItem(token, "item_id");
   * ```
   */
  removeCartItem: async (token: string, itemId: string): Promise<Cart> => {
    const response = await handleApiRequest<ApiResponse<Cart>>("DELETE", `${ENDPOINT}/items/${itemId}`, {
      token,
    });
    return response.data!;
  },

  /**
   * Clear all items from cart
   * DELETE /api/v1/cart
   *
   * @param token - User authentication token
   * @returns Empty cart
   *
   * @example
   * ```typescript
   * await cartApi.clearCart(token);
   * ```
   */
  clearCart: async (token: string): Promise<Cart> => {
    const response = await handleApiRequest<ApiResponse<Cart>>("DELETE", ENDPOINT, { token });
    return response.data!;
  },
};
