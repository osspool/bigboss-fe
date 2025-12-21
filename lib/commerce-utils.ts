import type { CartItem, ProductDiscount, Product } from "@/types";

/**
 * Check if a discount is currently active
 */
export function isDiscountActive(discount?: ProductDiscount | null): boolean {
  if (!discount?.type || !discount?.value) return false;
  
  const now = new Date();
  if (discount.startDate && new Date(discount.startDate) > now) return false;
  if (discount.endDate && new Date(discount.endDate) < now) return false;
  
  return true;
}

/**
 * Calculate product price with discount applied
 */
export function calculateProductPrice(product: Product): number {
  const basePrice = product.basePrice || 0;
  
  if (!isDiscountActive(product.discount)) return basePrice;
  
  const { type, value } = product.discount!;
  
  if (type === "percentage") return basePrice * (1 - value / 100);
  if (type === "fixed") return Math.max(0, basePrice - value);
  
  return basePrice;
}

/**
 * Calculate unit price for a cart item
 * Handles both simple products and variant products with the new variant system.
 *
 * Price calculation:
 * - Simple products: basePrice (with discount if applicable)
 * - Variant products: basePrice + variant.priceModifier
 */
export function calculateItemPrice(item: CartItem): number {
  if (!item?.product) return 0;

  // Get base price (with discount if applicable)
  const basePrice = item.product?.currentPrice ?? calculateProductPrice(item.product);

  // For variant products, add the priceModifier from the selected variant
  if (item.variantSku && item.product.variants && item.product.variants.length > 0) {
    const variant = item.product.variants.find(v => v.sku === item.variantSku);
    if (variant) {
      return basePrice + (variant.priceModifier || 0);
    }
  }

  // Simple product or variant not found - return base price
  return basePrice;
}

/**
 * Calculate total for a cart item
 */
export function calculateItemTotal(item: CartItem): number {
  return calculateItemPrice(item) * (item.quantity || 1);
}

/**
 * Calculate cart subtotal
 */
export function calculateCartSubtotal(items: CartItem[]): number {
  return items?.reduce((total, item) => total + calculateItemTotal(item), 0) || 0;
}

/**
 * Get total item count in cart
 */
export function getCartItemCount(items: CartItem[]): number {
  return items?.reduce((count, item) => count + (item.quantity || 0), 0) || 0;
}

/**
 * Get variant details from a cart item
 * Returns the selected variant object for display purposes
 */
export function getCartItemVariant(item: CartItem) {
  if (!item?.variantSku || !item?.product?.variants) return null;
  return item.product.variants.find(v => v.sku === item.variantSku) || null;
}

/**
 * Format variant attributes for display
 * @example "Size: M, Color: Red"
 */
export function formatVariantAttributes(attributes?: Record<string, string> | null): string {
  if (!attributes || Object.keys(attributes).length === 0) return "";
  return Object.entries(attributes)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join(", ");
}

/**
 * Calculate coupon discount
 */
export function calculateCouponDiscount(
  coupon: { discountType: string; discountAmount: number; maxDiscountAmount?: number } | null,
  subtotal: number
): number {
  if (!coupon || !subtotal) return 0;
  
  let discount = 0;
  
  if (coupon.discountType === "fixed") {
    discount = coupon.discountAmount || 0;
  } else if (coupon.discountType === "percentage") {
    discount = (subtotal * (coupon.discountAmount || 0)) / 100;
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  }
  
  return Math.min(discount, subtotal);
}

/**
 * Get product image URL (featured or first)
 */
export function getProductImage(product: Product | null): string {
  if (!product?.images?.length) return "/placeholder.svg";

  const featured = product.images.find((img) => img.isFeatured);
  const image = featured || product.images[0];

  return image?.url || "/placeholder.svg";
}

// ==================== COD Amount Utilities ====================

/** Payment methods that are considered prepaid (not COD) */
const PREPAID_METHODS = ["bkash", "nagad", "rocket", "bank_transfer", "card", "online"];

/**
 * Check if a payment method is prepaid (not cash on delivery)
 */
export function isPrepaidMethod(method?: string | null): boolean {
  if (!method) return false;
  return PREPAID_METHODS.includes(method.toLowerCase());
}

/**
 * Calculate default COD amount based on payment type and status
 *
 * Logic:
 * - cash → full amount (COD required)
 * - prepaid + verified → 0 (already paid)
 * - prepaid + pending/failed → 0 (expecting payment, admin can override)
 *
 * @param order - Order object with payment and total info
 * @returns Default COD amount
 */
export function calculateDefaultCodAmount(order: {
  totalAmount: number;
  currentPayment?: {
    method?: string;
    status?: string;
    amount?: number;
  } | null;
}): number {
  const { totalAmount, currentPayment } = order;

  if (!currentPayment?.method) {
    // No payment info, assume COD
    return totalAmount;
  }

  const method = currentPayment.method.toLowerCase();
  const status = currentPayment.status?.toLowerCase();

  // Cash payment → always COD
  if (method === "cash") {
    return totalAmount;
  }

  // Prepaid methods
  if (isPrepaidMethod(method)) {
    // If verified, no COD needed
    if (status === "verified") {
      return 0;
    }
    // If pending/failed, default to 0 but admin can override
    // This assumes admin will verify payment before shipping
    return 0;
  }

  // Unknown method, default to full amount
  return totalAmount;
}

/**
 * Get COD status description for display
 */
export function getCodStatusInfo(order: {
  totalAmount: number;
  currentPayment?: {
    method?: string;
    status?: string;
  } | null;
}): { label: string; description: string; canEdit: boolean } {
  const { currentPayment } = order;
  const method = currentPayment?.method?.toLowerCase();
  const status = currentPayment?.status?.toLowerCase();

  if (!method || method === "cash") {
    return {
      label: "Cash on Delivery",
      description: "Customer will pay upon delivery",
      canEdit: true,
    };
  }

  if (status === "verified") {
    return {
      label: "Prepaid (Verified)",
      description: "Payment already verified - no COD needed",
      canEdit: true,
    };
  }

  if (status === "pending") {
    return {
      label: "Prepaid (Pending)",
      description: "Payment pending verification - set COD if needed",
      canEdit: true,
    };
  }

  if (status === "failed") {
    return {
      label: "Payment Failed",
      description: "Consider collecting full amount as COD",
      canEdit: true,
    };
  }

  return {
    label: "COD Amount",
    description: "Amount to collect on delivery",
    canEdit: true,
  };
}
