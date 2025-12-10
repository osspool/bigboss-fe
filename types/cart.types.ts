/**
 * Cart Types
 *
 * Type definitions for shopping cart functionality.
 * Includes cart items, cart operations, and API payloads.
 */

import type { ProductImage, ProductDiscount, ProductVariation } from "./product.types";

// ==================== Cart Item Variation ====================

/**
 * Selected variation option in a cart item
 * Stores user's choice from available product variations
 */
export interface CartItemVariation {
  /** Variation name (e.g., "Size", "Color") */
  name: string;
  /** Selected option details */
  option: {
    /** Option value (e.g., "Medium", "Red") */
    value: string;
    /** Price modifier for this option */
    priceModifier?: number;
  };
}

// ==================== Cart Product ====================

/**
 * Populated product data in cart
 * Backend populates only essential fields needed for cart display
 * Fields: name, images, variations, discount, basePrice, slug
 */
export interface CartProduct {
  /** Product MongoDB ObjectId */
  _id: string;
  /** Product name */
  name: string;
  /** Product URL slug */
  slug: string;
  /** Base price before discounts and variations */
  basePrice: number;
  /** Product images */
  images: ProductImage[];
  /** Available variations */
  variations: ProductVariation[];
  /** Active discount (if any) */
  discount?: ProductDiscount;
  /** Virtual: Current price after discount */
  currentPrice?: number;
}

// ==================== Cart Item ====================

/**
 * Individual item in the shopping cart
 */
export interface CartItem {
  /** Cart item unique identifier */
  _id: string;
  /** Populated product data */
  product: CartProduct;
  /** Selected variation options */
  variations?: CartItemVariation[];
  /** Quantity of this item in cart */
  quantity: number;
}

// ==================== Cart ====================

/**
 * User's shopping cart
 */
export interface Cart {
  /** Cart unique identifier */
  _id: string;
  /** User ID who owns this cart */
  user: string;
  /** Items in the cart */
  items: CartItem[];
  /** Cart creation timestamp (ISO string) */
  createdAt: string;
  /** Cart last update timestamp (ISO string) */
  updatedAt: string;
}

// ==================== Cart API Payloads ====================

/**
 * Add item to cart request payload
 */
export interface AddToCartPayload {
  /** Product ID to add */
  productId: string;
  /** Quantity to add */
  quantity: number;
  /** Selected variations (if product has variations) */
  variations?: Array<{
    /** Variation name */
    name: string;
    /** Selected option */
    option: {
      /** Option value */
      value: string;
    };
  }>;
}

/**
 * Update cart item quantity payload
 */
export interface UpdateCartItemPayload {
  /** Cart item ID to update */
  itemId: string;
  /** New quantity */
  quantity: number;
}

/**
 * Remove item from cart payload
 */
export interface RemoveFromCartPayload {
  /** Cart item ID to remove */
  itemId: string;
}

/**
 * Clear entire cart payload
 */
export interface ClearCartPayload {
  /** User ID whose cart to clear */
  userId: string;
}

// ==================== Cart API Responses ====================

/**
 * Cart API response
 */
export interface CartResponse {
  success: boolean;
  data: Cart;
}

/**
 * Cart operation success response
 */
export interface CartOperationResponse {
  success: boolean;
  message: string;
  data: Cart;
}

// ==================== Cart Computed Types ====================

/**
 * Cart item with computed total price
 * Used for display purposes
 */
export interface CartItemWithTotal extends CartItem {
  /** Total price for this item (price × quantity) */
  totalPrice: number;
  /** Unit price (base + variation modifiers + discount) */
  unitPrice: number;
}

/**
 * Cart summary for checkout
 */
export interface CartSummary {
  /** Subtotal (sum of all items before discounts) */
  subtotal: number;
  /** Total discount amount */
  totalDiscount: number;
  /** Total after discounts, before shipping */
  total: number;
  /** Number of items in cart */
  itemCount: number;
  /** Number of unique products */
  productCount: number;
}

/**
 * Cart with computed summary
 */
export interface CartWithSummary extends Cart {
  /** Cart summary calculations */
  summary: CartSummary;
  /** Items with computed totals */
  itemsWithTotals: CartItemWithTotal[];
}
