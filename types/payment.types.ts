/**
 * Payment Types (aligned with @classytic/revenue)
 * Payment gateway, verification, and related operations.
 * For Transaction types, see transaction.types.ts
 */

import type {
  PaymentGatewayType,
  PaymentMethod,
  PaymentStatus,
  PaymentDetails,
  GatewayInfo,
} from "./common.types";

// ============ Enums/Unions ============

export type { PaymentGatewayType, PaymentMethod, PaymentStatus } from "./common.types";

// ============ Schemas (mirror revenue library) ============

export type { PaymentDetails, GatewayInfo } from "./common.types";

export interface CurrentPayment {
  status: PaymentStatus;
  transactionId?: string;
  /**
   * Amount stored in smallest currency unit (paisa for BDT), matching @classytic/revenue.
   * Use `amount / 100` for display in BDT.
   */
  amount?: number;
  method?: PaymentMethod;
  reference?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

// ============ Admin Manual Verification ============
// Note: Transaction types moved to transaction.types.ts

export interface VerifyPaymentPayload {
  transactionId: string; // ObjectId
  notes?: string;
}

export interface RejectPaymentPayload {
  transactionId: string; // ObjectId
  reason: string;
}

export interface VerificationResult {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  category: string;
  verifiedAt: string;
  verifiedBy: string;
  // Avoid circular import by using a lightweight reference type
  entity: {
    referenceModel?: string;
    referenceId?: string;
  } | null;
}

export interface RejectResult {
  transactionId: string;
  status: "failed";
  failedAt: string;
  failureReason: string;
}
