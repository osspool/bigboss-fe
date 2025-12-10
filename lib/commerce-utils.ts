import type { CartItem, CartProduct, ProductDiscount, Product } from "@/types";

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
export function calculateProductPrice(product: CartProduct | Product): number {
  const basePrice = product.basePrice || 0;
  
  if (!isDiscountActive(product.discount)) return basePrice;
  
  const { type, value } = product.discount!;
  
  if (type === "percentage") return basePrice * (1 - value / 100);
  if (type === "fixed") return Math.max(0, basePrice - value);
  
  return basePrice;
}

/**
 * Calculate unit price for a cart item (product price + variation modifiers)
 */
export function calculateItemPrice(item: CartItem): number {
  const basePrice = item.product?.currentPrice ?? calculateProductPrice(item.product);
  
  const modifierTotal = item.variations?.reduce(
    (sum, v) => sum + (v.option?.priceModifier || 0),
    0
  ) || 0;
  
  return basePrice + modifierTotal;
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
export function getProductImage(product: CartProduct | Product | null): string {
  if (!product?.images?.length) return "/placeholder.svg";
  
  const featured = product.images.find((img) => img.isFeatured);
  const image = featured || product.images[0];
  
  return image?.url || "/placeholder.svg";
}
