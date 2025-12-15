import { type ApiResponse } from "../api-factory";
import { handleApiRequest } from "../api-handler";
import type { Cart, AddToCartPayload } from "@/types/cart.types";

const ENDPOINT = "/api/v1/cart";

/**
 * Cart API - Following CART_API_GUIDE.md
 *
 * Endpoints:
 * - GET /api/v1/cart - Get (or auto-create) current user cart
 * - POST /api/v1/cart/items - Add item
 * - PATCH /api/v1/cart/items/:itemId - Update quantity
 * - DELETE /api/v1/cart/items/:itemId - Remove item
 * - DELETE /api/v1/cart - Clear all items
 */
export const cartApi = {
  getCart: async (token: string): Promise<Cart> => {
    const response = await handleApiRequest<ApiResponse<Cart>>("GET", ENDPOINT, { token });
    return response.data!;
  },

  addToCart: async (token: string, data: AddToCartPayload): Promise<Cart> => {
    const response = await handleApiRequest<ApiResponse<Cart>>("POST", `${ENDPOINT}/items`, {
      token,
      body: data,
    });
    return response.data!;
  },

  updateCartItem: async (token: string, itemId: string, quantity: number): Promise<Cart> => {
    const response = await handleApiRequest<ApiResponse<Cart>>("PATCH", `${ENDPOINT}/items/${itemId}`, {
      token,
      body: { quantity },
    });
    return response.data!;
  },

  removeCartItem: async (token: string, itemId: string): Promise<Cart> => {
    const response = await handleApiRequest<ApiResponse<Cart>>("DELETE", `${ENDPOINT}/items/${itemId}`, {
      token,
    });
    return response.data!;
  },

  clearCart: async (token: string): Promise<Cart> => {
    const response = await handleApiRequest<ApiResponse<Cart>>("DELETE", ENDPOINT, { token });
    return response.data!;
  },
};
