// Re-export POS types from central location
export type {
  PosCartItem,
  PosPaymentMethod,
  PaymentOption,
  SplitPaymentEntry,
  PaymentState,
} from "@/types/pos.types";

export type { PaymentMethodConfig as PlatformPaymentMethod } from "@/types/common.types";

// Local UI-specific types
export interface CategoryOption {
  slug: string;
  label: string;
}
