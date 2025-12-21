/**
 * Cart Types
 *
 * Type definitions for shopping cart matching the backend cart schema.
 *
 * @see {@link file://d:/projects/ecom/bigboss/fe-prod/docs/api/commerce/cart.md Cart API Guide}
 */

import type { Product, ProductVariant } from './product.types';

// ==================== Cart Item ====================

/**
 * Cart Item (Backend Response Format)
 * Represents a single item in the shopping cart as returned by API
 *
 * @example Simple Product
 * {
 *   _id: "cart_item_id",
 *   product: { name: "Wireless Mouse", basePrice: 300, ... },
 *   quantity: 2
 * }
 *
 * @example Variant Product
 * {
 *   _id: "cart_item_id",
 *   product: { name: "T-Shirt", basePrice: 500, ... },
 *   variantSku: "TSHIRT-M-RED",
 *   quantity: 1
 * }
 */
export interface CartItem {
  /** Cart item ID (for update/remove operations via PATCH/DELETE /cart/items/:itemId) */
  _id: string;

  /** Product reference (fully populated Product object from backend) */
  product: Product;

  /**
   * Variant SKU (optional)
   * - null/undefined for simple products
   * - Required for variant products (e.g., "TSHIRT-M-RED")
   * - Must match a valid variant.sku from product.variants[]
   */
  variantSku?: string | null;

  /** Quantity of this item (minimum: 1) */
  quantity: number;
}

// ==================== Cart ====================

/**
 * Shopping Cart
 * Represents a user's shopping cart
 */
export interface Cart {
  /** Cart ID */
  _id: string;
  /** User/Customer ID */
  user: string;
  /** Cart items */
  items: CartItem[];
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

// ==================== Frontend Helper Types ====================

/**
 * Populated Cart Item
 * Cart item with fully populated product for display
 */
export interface PopulatedCartItem {
  /** Fully populated product */
  product: Product;
  /** Variant SKU */
  variantSku?: string | null;
  /** Quantity */
  quantity: number;
  // Derived fields (computed on FE)
  /** Resolved variant (if variantSku is provided) */
  variant?: ProductVariant;
  /** Final price (basePrice + variant.priceModifier) */
  finalPrice: number;
  /** Line total (finalPrice * quantity) */
  lineTotal: number;
}

/**
 * Cart Summary
 * Complete cart with computed totals
 */
export interface CartSummary {
  /** Populated cart items with derived fields */
  items: PopulatedCartItem[];
  /** Total item count (sum of all quantities) */
  itemCount: number;
  /** Subtotal (sum of all line totals) */
  subtotal: number;
}

// ==================== Request Payloads ====================

/**
 * Add Item Payload
 * Data required to add an item to cart via POST /api/v1/cart/items
 *
 * @example Simple Product
 * ```typescript
 * {
 *   productId: "507f1f77bcf86cd799439011",
 *   quantity: 2
 * }
 * ```
 *
 * @example Variant Product (T-Shirt Size M, Color Red)
 * ```typescript
 * {
 *   productId: "507f1f77bcf86cd799439011",
 *   variantSku: "TSHIRT-M-RED",  // Must match product.variants[].sku
 *   quantity: 1
 * }
 * ```
 *
 * @see {@link file://d:/projects/ecom/bigboss/fe-prod/docs/api/commerce/cart.md#request-shapes Cart API Request Shapes}
 */
export interface AddCartItemPayload {
  /** Product ID (required) */
  productId: string;

  /**
   * Variant SKU (required for variant products, omit for simple products)
   * - For simple products: omit this field
   * - For variant products: must match a valid variant.sku from product.variants[]
   * - Example: "TSHIRT-M-RED" for Size=M, Color=Red
   */
  variantSku?: string | null;

  /** Quantity to add (minimum: 1, required) */
  quantity: number;
}

/** Alias for AddCartItemPayload (for consistency with hooks) */
export type AddToCartPayload = AddCartItemPayload;

/**
 * Update Item Payload
 * Data required to update cart item quantity
 */
export interface UpdateCartItemPayload {
  /** Cart item ID */
  itemId: string;
  /** New quantity (0 to remove) */
  quantity: number;
}

/**
 * Remove Item Payload
 * Data required to remove an item from cart
 */
export interface RemoveCartItemPayload {
  /** Cart item ID */
  itemId: string;
}

// ==================== API Response Types ====================

/**
 * Cart API Response
 */
export interface CartResponse {
  success: boolean;
  data: Cart;
}

// ==================== Legacy Types (Deprecated - For Backwards Compatibility) ====================

/**
 * @deprecated Use the new variant system instead
 * Legacy type for old variation system - kept for backwards compatibility
 * This will be removed once ProductDetailClient.tsx is migrated to the new variant system
 */
export interface CartItemVariation {
  name: string;
  option: {
    value: string;
    priceModifier: number;
  };
}
