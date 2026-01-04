import type { PaymentMethodConfig } from "@/types";
import type { PosPaymentMethod } from "./pos.types";

/**
 * Generate unique key for payment method selection
 */
export function getPaymentKey(method: PaymentMethodConfig, index: number): string {
  return method._id || `${method.type}:${method.provider || ""}:${method.name}:${index}`;
}

/**
 * Map platform payment config to POS API payment method
 *
 * Platform Config structure: { type: "mfs", provider: "bkash" }
 * POS API expects: method: "bkash" (provider name directly for MFS)
 *
 * This mapping is required per API spec:
 * - Platform API: Uses generic "mfs" type with provider field
 * - POS/Order API: Uses provider name directly (bkash, nagad)
 */
export function mapPlatformMethodToPosMethod(
  method: PaymentMethodConfig
): PosPaymentMethod | null {
  switch (method.type) {
    case "cash":
      return "cash";
    case "mfs": {
      // For MFS, use provider name directly per POS API spec
      const provider = (method.provider || "").toLowerCase();
      if (provider === "bkash" || provider === "nagad" || provider === "rocket" || provider === "upay") {
        return provider as PosPaymentMethod;
      }
      return null;
    }
    case "bank_transfer":
      return "bank_transfer";
    case "card":
      return "card";
    default:
      return null;
  }
}

export function paymentNeedsReference(posMethod: PosPaymentMethod): boolean {
  return posMethod !== "cash";
}
