/**
 * POS Helper Utilities
 */

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
