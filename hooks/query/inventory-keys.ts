/**
 * Shared Inventory Query Keys
 *
 * Centralized query keys for all inventory-related queries.
 * Import these in hooks to ensure consistent cache invalidation.
 *
 * @see docs/api/commerce/inventory.md
 */

// ============================================
// INVENTORY (Stock Entries / Products)
// ============================================
export const INVENTORY_KEYS = {
  all: ["inventory"] as const,
  products: (branchId?: string) => [...INVENTORY_KEYS.all, "products", branchId] as const,
  productsList: (branchId?: string, params?: Record<string, unknown>) =>
    [...INVENTORY_KEYS.products(branchId), params] as const,
  lookup: (code: string, branchId?: string) =>
    [...INVENTORY_KEYS.all, "lookup", code, branchId] as const,
};

// ============================================
// TRANSFERS (Challans)
// ============================================
export const TRANSFER_KEYS = {
  all: ["inventory", "transfers"] as const,
  list: (params?: Record<string, unknown>) => [...TRANSFER_KEYS.all, "list", params] as const,
  detail: (id: string) => [...TRANSFER_KEYS.all, "detail", id] as const,
  stats: ["inventory", "transfers", "stats"] as const,
  statsByBranch: (branchId?: string) => [...TRANSFER_KEYS.stats, branchId] as const,
};

// ============================================
// STOCK REQUESTS
// ============================================
export const REQUEST_KEYS = {
  all: ["inventory", "requests"] as const,
  list: (params?: Record<string, unknown>) => [...REQUEST_KEYS.all, "list", params] as const,
  pending: () => [...REQUEST_KEYS.all, "pending"] as const,
  detail: (id: string) => [...REQUEST_KEYS.all, "detail", id] as const,
};

// ============================================
// STOCK MOVEMENTS (Audit Trail)
// ============================================
export const MOVEMENT_KEYS = {
  all: ["inventory", "movements"] as const,
  list: (params?: Record<string, unknown>) => [...MOVEMENT_KEYS.all, "list", params] as const,
};

// ============================================
// PURCHASES
// ============================================
export const PURCHASE_KEYS = {
  all: ["inventory", "purchases"] as const,
  history: (params?: Record<string, unknown>) => [...PURCHASE_KEYS.all, "history", params] as const,
};

// ============================================
// LOW STOCK
// ============================================
export const LOW_STOCK_KEYS = {
  all: ["inventory", "low-stock"] as const,
  list: (params?: { branchId?: string; threshold?: number }) =>
    [...LOW_STOCK_KEYS.all, "list", params] as const,
};

// ============================================
// INVALIDATION HELPERS
// ============================================

/**
 * Get all keys that should be invalidated when stock quantities change.
 * Use this for: receive transfer, dispatch, adjustments, purchases.
 */
export function getStockChangeInvalidationKeys(branchId?: string) {
  return [
    INVENTORY_KEYS.all,           // All inventory product queries
    MOVEMENT_KEYS.all,            // Audit trail (new movements created)
    LOW_STOCK_KEYS.all,           // Low stock alerts may change
  ];
}

/**
 * Get all keys that should be invalidated when a transfer state changes.
 * Use this for: approve, dispatch, receive, cancel.
 */
export function getTransferStateInvalidationKeys() {
  return [
    TRANSFER_KEYS.all,            // Transfer list and details
    TRANSFER_KEYS.stats,          // Stats counts change
    REQUEST_KEYS.all,             // If transfer was from request fulfillment
  ];
}
