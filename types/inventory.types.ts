/**
 * Inventory Types
 *
 * Based on: INVENTORY_API_GUIDE.md
 * Pattern: Stripe action-based pattern for state transitions
 */

// ============= Enums =============

export type StockMovementType =
  | 'purchase'
  | 'sale'
  | 'transfer_in'
  | 'transfer_out'
  | 'adjustment'
  | 'initial'
  | 'return';

export type TransferStatus =
  | 'draft'
  | 'approved'
  | 'dispatched'
  | 'in_transit'
  | 'received'
  | 'partial_received'
  | 'cancelled';

export type StockRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'fulfilled'
  | 'partial_fulfilled'
  | 'cancelled';

// Action types follow Stripe action-based pattern
export type TransferActionType = 'approve' | 'dispatch' | 'in-transit' | 'receive' | 'cancel';
export type StockRequestActionType = 'approve' | 'reject' | 'fulfill' | 'cancel';

// ============= Stock Entry =============

export interface StockEntry {
  _id: string;
  product: string;
  variantSku?: string | null;
  branch: string | { _id: string; name: string; code?: string };

  quantity: number;
  reservedQuantity: number;

  /** Weighted Average Cost - admin only */
  costPrice?: number;

  reorderPoint?: number;
  reorderQuantity?: number;

  isActive: boolean;
  lastCountDate?: string;

  // Virtuals
  availableQuantity?: number;
  needsReorder?: boolean;
}

// ============= Stock Movement (Audit) =============

export interface StockMovement {
  _id: string;
  stockEntry?: string;
  product: string | { _id: string; name: string };
  variantSku?: string;
  branch: string | { _id: string; name: string; code?: string };

  type: StockMovementType;
  quantity: number;
  balanceAfter?: number;
  previousQuantity?: number;
  newQuantity?: number;

  reference?: { model?: string; id?: string } | string;
  referenceType?: 'transfer' | 'order' | 'purchase' | 'adjustment';

  costPrice?: number;
  costPerUnit?: number;
  reason?: string;

  actor?: string | { _id: string; name: string };
  notes?: string;
  createdBy?: string | { _id: string; name: string };
  createdAt: string;
}

// ============= Purchase =============

export interface PurchaseItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  costPrice?: number;
  expiryDate?: string;
}

export interface CreatePurchasePayload {
  branchId?: string; // Defaults to head office
  supplierId?: string;
  supplierName?: string; // Alternative to supplierId for quick entry
  referenceNo?: string;
  purchaseOrderNumber?: string; // Alias for referenceNo
  notes?: string;
  date?: string;
  items: PurchaseItem[];
  createTransaction?: boolean; // Default: false
  paymentMethod?: string;
  amount?: number;
}

// Alias for hooks that use different naming
export type RecordPurchasePayload = CreatePurchasePayload;

// ============= Transfer (Challan) =============

export type TransferType = 'head_to_sub' | 'sub_to_sub' | 'sub_to_head';

export interface TransferItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  quantityReceived?: number;
}

export interface TransportDetails {
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  estimatedArrival?: string;
  courierName?: string;
  trackingId?: string;
}

export interface TransferStatusHistoryEntry {
  status: TransferStatus;
  at: string;
  by?: string;
  notes?: string | null;
}

export interface InventoryTransfer {
  _id: string;
  challanNumber: string;
  transferType?: TransferType;

  senderBranch: string | { _id: string; name: string; code?: string };
  receiverBranch: string | { _id: string; name: string; code?: string };

  items: TransferItem[];
  status: TransferStatus;
  documentType?: string;

  totalValue?: number;

  transport?: TransportDetails;
  remarks?: string;

  statusHistory?: TransferStatusHistoryEntry[];
  dispatchMovements?: string[];
  receiveMovements?: string[];

  createdAt: string;
  updatedAt: string;

  createdBy?: string | { _id: string; name: string };
  approvedBy?: string | { _id: string; name: string };
  dispatchedBy?: string | { _id: string; name: string };
  receivedBy?: string | { _id: string; name: string };
}

// Alias for hooks
export type Transfer = InventoryTransfer;

export interface CreateTransferPayload {
  senderBranchId?: string; // Defaults to head office
  receiverBranchId: string;
  documentType?: string;
  items: {
    productId: string;
    variantSku?: string;
    quantity: number;
  }[];
  remarks?: string;
}

// Single action payload following Stripe pattern
export interface TransferActionPayload {
  action: TransferActionType;
  transport?: TransportDetails; // For 'dispatch'
  items?: {
    productId: string;
    variantSku?: string;
    quantityReceived: number;
  }[]; // For 'receive' (partial receipt)
  reason?: string; // For 'cancel'
}

// Individual action payloads (for type-safe hooks)
export interface UpdateTransferPayload {
  items?: {
    productId: string;
    variantSku?: string;
    quantity: number;
  }[];
  remarks?: string;
  documentType?: string;
}

export interface DispatchTransferPayload {
  transport?: TransportDetails;
}

export interface ReceiveTransferPayload {
  items?: {
    productId: string;
    variantSku?: string;
    quantityReceived: number;
  }[];
}

// ============= Stock Request =============

export type StockRequestPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface StockRequestItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  approvedQuantity?: number;
  notes?: string;
}

export interface StockRequest {
  _id: string;
  requestNumber: string;

  requestingBranch: string | { _id: string; name: string; code?: string };
  fulfillingBranch?: string | { _id: string; name: string; code?: string };

  items: StockRequestItem[];
  status: StockRequestStatus;
  priority?: StockRequestPriority;

  reason?: string;
  expectedDate?: string;
  notes?: string;
  reviewNotes?: string;
  rejectionReason?: string;

  createdAt: string;
  updatedAt: string;

  createdBy?: string | { _id: string; name: string };
  reviewedBy?: string | { _id: string; name: string };
}

export interface CreateStockRequestPayload {
  requestingBranchId?: string; // Requesting branch
  items: {
    productId: string;
    variantSku?: string;
    quantity: number;
    notes?: string;
  }[];
  priority?: StockRequestPriority;
  reason?: string;
  expectedDate?: string;
  notes?: string;
}

export interface StockRequestActionPayload {
  action: StockRequestActionType;
  items?: {
    productId: string;
    variantSku?: string;
    approvedQuantity: number;
  }[]; // For 'approve'
  reason?: string; // For 'reject' or 'cancel'
  remarks?: string; // For 'fulfill'
  documentType?: string; // For 'fulfill'
}

// ============= Adjustments =============

export interface AdjustmentItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  mode: 'add' | 'remove' | 'set';
}

export interface CreateAdjustmentPayload {
  branchId?: string;
  items?: AdjustmentItem[];
  // Single item adjustment (alternative to items[])
  productId?: string;
  variantSku?: string;
  quantity?: number;
  mode?: 'add' | 'remove' | 'set';
  reason?: string;
  lostAmount?: number; // Creates expense transaction if provided
}

// Bulk adjustment (POS format)
export interface BulkAdjustmentPayload {
  adjustments: AdjustmentItem[];
  branchId?: string;
  reason?: string;
}

// Stock adjustment (POS/Inventory format)
export interface AdjustStockPayload {
  productId: string;
  variantSku?: string;
  quantity: number;
  mode: 'add' | 'remove' | 'set';
  branchId?: string;
  reason?: string;
  notes?: string;
}

// Adjustment result
export interface AdjustStockResult {
  success: boolean;
  processed: number;
  failed?: number;
  message?: string;
}

// ============= Low Stock =============

export interface LowStockItem {
  product: { _id: string; name: string; sku?: string };
  variantSku?: string;
  branch: { _id: string; name: string; code: string };
  quantity: number;
  reorderPoint: number;
}

// ============= Transfer Stats =============

export interface TransferStats {
  total: number;
  byStatus: Record<TransferStatus, number>;
  pending: number;
  inTransit: number;
}

// ============= Movement Query Params =============

export interface MovementQueryParams {
  productId?: string;
  branchId?: string;
  type?: StockMovementType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
