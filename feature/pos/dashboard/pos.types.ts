import type { PaymentMethod, PaymentMethodConfig } from "@/types/common.types";

/**
 * POS Cart Item (UI State)
 * This is a UI-specific type for the POS cart, not an API type
 */
export interface PosCartItem {
  productId: string;
  productName: string;
  variantSku?: string;
  variantLabel?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image?: string;
}

export interface CategoryOption {
  slug: string;
  label: string;
}

// Re-export from common types for convenience
export type { PaymentMethod as PosPaymentMethod, PaymentMethodConfig as PlatformPaymentMethod };
