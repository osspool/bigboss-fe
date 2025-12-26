/**
 * POS Helper Utilities
 */

import type { MembershipConfig, MembershipTierConfig } from "@/types/platform.types";
import type { Customer } from "@/types/customer.types";

/**
 * Extract order ID from API response
 */
export function extractOrderId(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const record = response as Record<string, unknown>;
  const data = record.data && typeof record.data === "object"
    ? (record.data as Record<string, unknown>)
    : null;
  const candidate =
    data?.orderId ??
    data?._id ??
    data?.id ??
    record.orderId ??
    record._id ??
    record.id;
  return typeof candidate === "string" ? candidate : null;
}

/**
 * Parse cash received input to number
 */
export function parseCashReceived(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Parse input to positive number (min 0)
 */
export function parsePositiveNumber(value: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return n > 0 ? n : 0;
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(
  items: Array<{ lineTotal: number }>,
  discountInput: string
) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const rawDiscount = parsePositiveNumber(discountInput);
  const discount = subtotal <= 0 ? 0 : Math.min(rawDiscount, subtotal);
  const total = Math.max(0, subtotal - discount);

  return { subtotal, discount, total, itemCount: items.length };
}

function findTierConfig(
  membershipConfig: MembershipConfig | null | undefined,
  tierName: string | null | undefined
): MembershipTierConfig | undefined {
  if (!membershipConfig?.tiers || !tierName) return undefined;
  const normalized = tierName.toLowerCase();
  return membershipConfig.tiers.find((tier) => tier.name.toLowerCase() === normalized);
}

export function calculateTierDiscount(
  subtotal: number,
  membershipConfig: MembershipConfig | null | undefined,
  tierName: string | null | undefined
): number {
  if (!membershipConfig?.enabled || !membershipConfig?.tiers || !tierName) return 0;
  const tier = findTierConfig(membershipConfig, tierName);
  if (!tier?.discountPercent) return 0;
  return Math.round((subtotal * tier.discountPercent) / 100);
}

export function validateRedemption(
  pointsToRedeem: number,
  customerPoints: number,
  orderTotal: number,
  membershipConfig: MembershipConfig | null | undefined
) {
  if (!membershipConfig?.enabled) {
    return { valid: false, error: "Membership program disabled" };
  }
  const config = membershipConfig?.redemption;
  if (!config?.enabled) {
    return { valid: false, error: "Points redemption not enabled" };
  }

  if (pointsToRedeem < (config.minRedeemPoints ?? 0)) {
    return {
      valid: false,
      error: `Minimum ${config.minRedeemPoints} points required`,
    };
  }

  if (pointsToRedeem > customerPoints) {
    return {
      valid: false,
      error: `Insufficient points. Available: ${customerPoints}`,
    };
  }

  if (orderTotal < (config.minOrderAmount ?? 0)) {
    return {
      valid: false,
      error: `Minimum order of ৳${config.minOrderAmount} required`,
    };
  }

  const maxDiscount = Math.floor(
    (orderTotal * (config.maxRedeemPercent ?? 100)) / 100
  );
  const requestedDiscount = Math.floor(pointsToRedeem / (config.pointsPerBdt ?? 1));

  let actualDiscount = requestedDiscount;
  let actualPoints = pointsToRedeem;

  if (requestedDiscount > maxDiscount) {
    actualDiscount = maxDiscount;
    actualPoints = maxDiscount * (config.pointsPerBdt ?? 1);
  }

  return {
    valid: true,
    discountAmount: actualDiscount,
    pointsToRedeem: actualPoints,
    maxAllowedPoints: maxDiscount * (config.pointsPerBdt ?? 1),
  };
}

export function calculatePointsToEarn(
  finalTotal: number,
  membershipConfig: MembershipConfig | null | undefined,
  tierName: string | null | undefined
): number {
  if (!membershipConfig?.enabled || finalTotal <= 0) return 0;
  const { pointsPerAmount = 1, amountPerPoint = 100, roundingMode = "floor" } =
    membershipConfig;
  const basePoints = (finalTotal / amountPerPoint) * pointsPerAmount;

  let multiplier = 1;
  const tier = findTierConfig(membershipConfig, tierName);
  if (tier?.pointsMultiplier) {
    multiplier = tier.pointsMultiplier;
  }

  const points = basePoints * multiplier;

  if (roundingMode === "ceil") return Math.ceil(points);
  if (roundingMode === "round") return Math.round(points);
  return Math.floor(points);
}

export function calculateOrderTotals({
  items,
  manualDiscountInput,
  membershipConfig,
  customer,
  pointsToRedeemInput,
}: {
  items: Array<{ lineTotal: number }>;
  manualDiscountInput: string;
  membershipConfig: MembershipConfig | null | undefined;
  customer: Customer | null | undefined;
  pointsToRedeemInput: string;
}) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const manualDiscount = Math.min(
    parsePositiveNumber(manualDiscountInput),
    subtotal
  );
  const tierName = customer?.membership?.tier || null;
  const customerPoints = customer?.membership?.points?.current || 0;

  const tierDiscount = calculateTierDiscount(subtotal, membershipConfig, tierName);
  const preliminaryTotal = Math.max(0, subtotal - manualDiscount - tierDiscount);

  const requestedPoints = Math.floor(parsePositiveNumber(pointsToRedeemInput));
  let redemptionDiscount = 0;
  let actualPointsRedeemed = 0;
  let redemptionError: string | null = null;
  let maxAllowedPoints = 0;

  if (requestedPoints > 0) {
    const result = validateRedemption(
      requestedPoints,
      customerPoints,
      preliminaryTotal,
      membershipConfig
    );
    if (result.valid) {
      redemptionDiscount = result.discountAmount ?? 0;
      actualPointsRedeemed = result.pointsToRedeem ?? 0;
      maxAllowedPoints = result.maxAllowedPoints ?? 0;
    } else {
      redemptionError = result.error ?? "Redemption not available";
    }
  }

  if (
    !maxAllowedPoints &&
    membershipConfig?.enabled &&
    membershipConfig?.redemption?.enabled
  ) {
    const maxDiscount = Math.floor(
      (preliminaryTotal * (membershipConfig.redemption.maxRedeemPercent ?? 100)) / 100
    );
    maxAllowedPoints = maxDiscount * (membershipConfig.redemption.pointsPerBdt ?? 1);
  }

  const total = Math.max(0, preliminaryTotal - redemptionDiscount);
  const pointsToEarn = calculatePointsToEarn(total, membershipConfig, tierName);

  return {
    subtotal,
    manualDiscount,
    tierDiscount,
    redemptionDiscount,
    totalDiscount: manualDiscount + tierDiscount + redemptionDiscount,
    total,
    pointsToEarn,
    pointsRedeemed: actualPointsRedeemed,
    redemptionError,
    maxAllowedPoints,
    tierName,
  };
}

/**
 * Calculate change amount for cash payment
 */
export function calculateChange(cashReceived: number, total: number): number {
  return Math.max(0, cashReceived - total);
}

/**
 * Calculate amount due for cash payment
 */
export function calculateAmountDue(cashReceived: number, total: number): number {
  return Math.max(0, total - cashReceived);
}

/**
 * Validate Bangladesh phone number (11 digits starting with 01)
 */
export function isValidBDPhone(phone: string): boolean {
  return /^01\d{9}$/.test(phone);
}

/**
 * Check if string looks like a phone number search
 */
export function isPhoneSearch(query: string): { exact: boolean; likely: boolean } {
  const trimmed = query.trim();
  return {
    exact: /^01\d{9}$/.test(trimmed),
    likely: /^\d{4,}$/.test(trimmed),
  };
}

/**
 * Transform POS order response to receipt format
 * Use this for immediate receipt display after checkout
 * (No extra API call needed - per pos.md recommendation)
 */
export function transformOrderToReceipt(
  orderResponse: unknown,
  branchInfo: { name: string; phone?: string }
): import("@/types/pos.types").PosReceiptData | null {
  if (!orderResponse || typeof orderResponse !== "object") return null;

  const response = orderResponse as Record<string, unknown>;
  const order = (response.data ?? response) as Record<string, unknown>;

  if (!order._id) return null;

  const payment = (order.currentPayment ?? {}) as Record<string, unknown>;
  const membership = (order.membershipApplied ?? {}) as Record<string, unknown>;
  const vat = (order.vat ?? {}) as Record<string, unknown>;
  const items = (order.items ?? []) as Array<Record<string, unknown>>;

  // currentPayment.amount is in paisa, convert to BDT
  const paymentAmountPaisa = typeof payment.amount === "number" ? payment.amount : 0;
  const paymentAmountBdt = paymentAmountPaisa / 100;

  return {
    orderId: String(order._id || ""),
    orderNumber: String(order.orderNumber || order._id || "").slice(-8).toUpperCase(),
    invoiceNumber: order.invoiceNumber ? String(order.invoiceNumber) : undefined,
    date: String(order.createdAt || new Date().toISOString()),
    branch: branchInfo,
    cashier: order.cashierName ? String(order.cashierName) : undefined,
    customer: {
      name: order.customerName ? String(order.customerName) : undefined,
      phone: order.customerPhone ? String(order.customerPhone) : null,
    },
    membership: membership.cardId
      ? {
          cardId: String(membership.cardId),
          tier: membership.tier ? String(membership.tier) : undefined,
          pointsEarned:
            typeof membership.pointsEarned === "number"
              ? membership.pointsEarned
              : undefined,
          tierDiscount:
            typeof membership.tierDiscountApplied === "number"
              ? membership.tierDiscountApplied
              : undefined,
        }
      : undefined,
    items: items.map((item) => ({
      name: String(item.productName || item.name || "Item"),
      variant: item.variantLabel
        ? String(item.variantLabel)
        : item.variantSku
        ? String(item.variantSku)
        : undefined,
      quantity: typeof item.quantity === "number" ? item.quantity : 1,
      unitPrice: typeof item.unitPrice === "number" ? item.unitPrice : 0,
      total:
        typeof item.total === "number"
          ? item.total
          : (typeof item.quantity === "number" ? item.quantity : 1) *
            (typeof item.unitPrice === "number" ? item.unitPrice : 0),
      vatRate: typeof item.vatRate === "number" ? item.vatRate : 0,
      vatAmount: typeof item.vatAmount === "number" ? item.vatAmount : 0,
    })),
    subtotal: typeof order.subtotal === "number" ? order.subtotal : 0,
    discount: typeof order.discountAmount === "number" ? order.discountAmount : 0,
    deliveryCharge: typeof order.deliveryCharge === "number" ? order.deliveryCharge : 0,
    vat: {
      applicable: !!vat.applicable,
      rate: typeof vat.rate === "number" ? vat.rate : 0,
      amount: typeof vat.amount === "number" ? vat.amount : 0,
      taxableAmount: typeof vat.taxableAmount === "number" ? vat.taxableAmount : 0,
      sellerBin: vat.sellerBin ? String(vat.sellerBin) : undefined,
      pricesIncludeVat:
        typeof vat.pricesIncludeVat === "boolean" ? vat.pricesIncludeVat : true,
    },
    total: typeof order.totalAmount === "number" ? order.totalAmount : 0,
    payment: {
      method: String(payment.method || "cash"),
      amount: paymentAmountBdt || (typeof order.totalAmount === "number" ? order.totalAmount : 0),
      reference: payment.reference ? String(payment.reference) : undefined,
      // Handle split payments
      ...(payment.method === "split" && Array.isArray(payment.payments)
        ? {
            payments: (payment.payments as Array<Record<string, unknown>>).map((p) => ({
              method: String(p.method || "cash"),
              amount: typeof p.amount === "number" ? p.amount / 100 : 0,
              reference: p.reference ? String(p.reference) : undefined,
            })),
          }
        : {}),
    },
  };
}
