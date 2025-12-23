// @/api/inventory/index.ts
/**
 * Inventory API - Barrel Export
 *
 * Modular inventory API following Bangladesh retail flow:
 * - Head Office purchases stock (purchaseApi)
 * - Transfers distribute to sub-branches (transferApi)
 * - Sub-branches request stock (requestApi)
 * - Stock movements tracked for audit (movementApi)
 * - Manual corrections via adjustments (adjustmentApi)
 * - Supplier management (supplierApi)
 *
 * @see docs/api/commerce/inventory.md
 */

// Stock Entry
export { stockApi, StockApi } from './stock-api';

// Purchases
export { purchaseApi, PurchaseApi } from './purchase-api';

// Transfers (Challan)
export { transferApi, TransferApi } from './transfer-api';

// Stock Requests
export { requestApi, RequestApi } from './request-api';

// Stock Movements (Audit)
export { movementApi, MovementApi } from './movement-api';

// Adjustments
export { adjustmentApi, AdjustmentApi } from './adjustment-api';

// Suppliers
export { supplierApi, SupplierApi } from './supplier-api';

// Legacy compatibility - unified API object
// (Use individual APIs for new code)
export const inventoryApis = {
  stock: () => import('./stock-api').then(m => m.stockApi),
  purchase: () => import('./purchase-api').then(m => m.purchaseApi),
  transfer: () => import('./transfer-api').then(m => m.transferApi),
  request: () => import('./request-api').then(m => m.requestApi),
  movement: () => import('./movement-api').then(m => m.movementApi),
  adjustment: () => import('./adjustment-api').then(m => m.adjustmentApi),
  supplier: () => import('./supplier-api').then(m => m.supplierApi),
} as const;
