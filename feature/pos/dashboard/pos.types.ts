// Re-export POS types from central location
export type {
  PosCartItem,
  PosPaymentMethod,
  PaymentOption,
  SplitPaymentEntry,
  PaymentState,
  PaymentMethodConfig as PlatformPaymentMethod,
} from "@/types";

// Local UI-specific types
export interface CategoryOption {
  slug: string;
  label: string;
}
