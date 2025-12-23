import type { PaymentMethodConfig } from "@/types/common.types";
import type { PosPaymentMethod } from "@/types/pos.types";

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

// Re-export from common types for convenience
export type { PosPaymentMethod, PaymentMethodConfig as PlatformPaymentMethod };
