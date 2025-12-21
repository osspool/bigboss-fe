// Inventory Feature
// Implements head-office controlled stock movement (Bangladesh challan flow)

// Navigation
export { InventoryNav } from "./ui/InventoryNav";

// Dashboard Clients
export { InventoryClient } from "./dashboard/stock/InventoryClient";
export { LowStockClient } from "./dashboard/low-stock/LowStockClient";
export { TransfersClient } from "./dashboard/transfers/transfers-client";
export { RequestsClient } from "./dashboard/requests/requests-client";
export { PurchasesClient } from "./dashboard/purchases/purchases-client";
export { MovementsClient } from "./dashboard/movements/movements-client";

// Reusable UI Components
export { ScanAddControls } from "./ui/ScanAddControls";
export { LineItemsTable } from "./ui/LineItemsTable";
export { useScannedLineItems } from "./ui/useScannedLineItems";
export { makeLineKey } from "./ui/line-items";

// Dialogs
export { TransferCreateDialog } from "./dashboard/transfers/transfer-create-dialog";
export { RequestCreateDialog } from "./dashboard/requests/request-create-dialog";
export { PurchaseCreateDialog } from "./dashboard/purchases/purchase-create-dialog";
export { StockAdjustmentDialog } from "./dashboard/stock/StockAdjustmentDialog";

// Stats Cards
export { TransferStatsCards } from "./dashboard/transfers/TransferStatsCards";

