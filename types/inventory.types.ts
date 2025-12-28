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
  | 'return'
  | 'recount';

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

// Purchase status enums
export type PurchaseStatus = 'draft' | 'approved' | 'received' | 'cancelled';
export type PurchasePaymentStatus = 'unpaid' | 'partial' | 'paid';
export type PurchasePaymentTerms = 'cash' | 'credit';
export type PurchaseActionType = 'receive' | 'pay' | 'cancel';

export interface PurchasePaymentDetails {
  amount: number;
  method: string;
  reference?: string;
  accountNumber?: string;
  walletNumber?: string;
  bankName?: string;
  accountName?: string;
  proofUrl?: string;
  transactionDate?: string;
  notes?: string;
}

// Purchase item (request shape)
export interface PurchaseItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  costPrice?: number;
  expiryDate?: string;
}

// Purchase item (response shape - populated)
export interface PurchaseItemDoc {
  _id?: string;
  product: string | { _id: string; name: string };
  productName: string;
  variantSku?: string;
  quantity: number;
  costPrice: number;
  discount?: number;
  taxRate?: number;
  lineTotal?: number;
  taxableAmount?: number;
  taxAmount?: number;
}

// Purchase status history entry
export interface PurchaseStatusHistoryEntry {
  status: PurchaseStatus;
  timestamp: string;
  actor?: string | { _id: string; name: string };
  notes?: string;
}

// Purchase document (API response)
export interface Purchase {
  _id: string;
  invoiceNumber: string;
  purchaseOrderNumber?: string;
  supplier?: string | { _id: string; name: string; code?: string };
  branch: string | { _id: string; name: string; code?: string };
  invoiceDate?: string;
  paymentTerms: PurchasePaymentTerms;
  creditDays?: number;
  dueDate?: string;
  status: PurchaseStatus;
  paymentStatus: PurchasePaymentStatus;
  items: PurchaseItemDoc[];
  subTotal?: number;
  discountTotal?: number;
  taxTotal?: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  transactionIds?: string[];
  statusHistory?: PurchaseStatusHistoryEntry[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | { _id: string; name: string };
  updatedBy?: string | { _id: string; name: string };
  approvedAt?: string;
  approvedBy?: string | { _id: string; name: string };
  receivedAt?: string;
  receivedBy?: string | { _id: string; name: string };
}

// Create purchase payload
export interface CreatePurchasePayload {
  supplierId?: string;
  purchaseOrderNumber?: string;
  paymentTerms?: PurchasePaymentTerms;
  creditDays?: number;
  items: PurchaseItem[];
  notes?: string;
  autoApprove?: boolean;
  autoReceive?: boolean;
  payment?: PurchasePaymentDetails;
}

// Update purchase payload (draft only)
export interface UpdatePurchasePayload {
  supplierId?: string;
  purchaseOrderNumber?: string;
  paymentTerms?: PurchasePaymentTerms;
  creditDays?: number;
  items?: PurchaseItem[];
  notes?: string;
}

// Purchase action payloads
export interface PurchaseReceivePayload {
  action: 'receive';
}

export interface PurchasePayPayload {
  action: 'pay';
  amount: number;
  method: string;
  reference?: string;
  accountNumber?: string;
  walletNumber?: string;
  bankName?: string;
  accountName?: string;
  proofUrl?: string;
  transactionDate?: string;
  notes?: string;
}

export interface PurchaseCancelPayload {
  action: 'cancel';
  reason?: string;
}

export type PurchaseActionPayload =
  | PurchaseReceivePayload
  | PurchasePayPayload
  | PurchaseCancelPayload;

// Alias for hooks that use different naming (backward compatibility)
export type RecordPurchasePayload = CreatePurchasePayload;

// ============= Transfer (Challan) =============

export type TransferType = 'head_to_sub' | 'sub_to_sub' | 'sub_to_head';

// Transfer item (request shape - for create/update)
export interface TransferItemPayload {
  productId: string;
  variantSku?: string;
  quantity: number;
  cartonNumber?: string;
}

// Transfer item (response shape - populated from API)
export interface TransferItem {
  _id?: string;
  product: string | { _id: string; name: string };
  productName?: string;
  productSku?: string;
  variantSku?: string;
  variantAttributes?: Record<string, string>;
  cartonNumber?: string;
  quantity: number;
  quantityReceived?: number;
  costPrice?: number;
  notes?: string;
}

export interface TransportDetails {
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  estimatedArrival?: string;
  courierName?: string;
  trackingId?: string;
  notes?: string;
}

export interface TransferStatusHistoryEntry {
  status: TransferStatus;
  timestamp: string;
  actor?: string | { _id: string; name: string };
  notes?: string | null;
}

export interface InventoryTransfer {
  _id: string;
  challanNumber: string;
  transferType?: TransferType;
  documentType?: 'delivery_challan' | 'dispatch_note' | 'delivery_slip';
  status: TransferStatus;

  senderBranch: string | { _id: string; name: string; code?: string };
  receiverBranch: string | { _id: string; name: string; code?: string };

  items: TransferItem[];
  totalItems?: number;
  totalQuantity?: number;
  totalValue?: number;

  transport?: TransportDetails;
  remarks?: string;
  internalNotes?: string;

  statusHistory?: TransferStatusHistoryEntry[];
  dispatchMovements?: string[];
  receiveMovements?: string[];

  createdAt: string;
  updatedAt: string;

  createdBy?: string | { _id: string; name: string };
  approvedBy?: string | { _id: string; name: string };
  approvedAt?: string;
  dispatchedBy?: string | { _id: string; name: string };
  dispatchedAt?: string;
  receivedBy?: string | { _id: string; name: string };
  receivedAt?: string;

  // Virtual fields (computed by API)
  isComplete?: boolean;
  canEdit?: boolean;
  canApprove?: boolean;
  canDispatch?: boolean;
  canReceive?: boolean;
  canCancel?: boolean;
}

// Alias for hooks
export type Transfer = InventoryTransfer;

export interface CreateTransferPayload {
  senderBranchId?: string; // Defaults to head office
  receiverBranchId: string;
  documentType?: 'delivery_challan' | 'dispatch_note' | 'delivery_slip';
  items: TransferItemPayload[];
  remarks?: string;
}

// Single action payload following Stripe pattern
export interface TransferActionPayload {
  action: TransferActionType;
  transport?: TransportDetails; // For 'dispatch'
  items?: {
    itemId?: string;
    productId: string;
    variantSku?: string;
    quantityReceived: number;
  }[]; // For 'receive' (partial receipt)
  reason?: string; // For 'cancel'
}

// Individual action payloads (for type-safe hooks)
export interface UpdateTransferPayload {
  items?: TransferItemPayload[];
  remarks?: string;
  documentType?: 'delivery_challan' | 'dispatch_note' | 'delivery_slip';
}

export interface DispatchTransferPayload {
  transport?: TransportDetails;
}

export interface ReceiveTransferPayload {
  items?: {
    itemId?: string;
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
  // Legacy field
  approvedQuantity?: number;
  // Preferred field (API docs)
  quantityApproved?: number;
  quantityFulfilled?: number;
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
  totalQuantityRequested?: number;
  totalQuantityApproved?: number;
  totalQuantityFulfilled?: number;

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
    quantityApproved?: number;
    quantity?: number;
  }[];
  reason?: string;
  remarks?: string;
  reviewNotes?: string;
  documentType?: string;
}

// ============= Adjustments =============

export interface AdjustmentItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  mode: 'add' | 'remove' | 'set';
  reason?: string;
}

export interface CreateAdjustmentPayload {
  branchId?: string;
  // Bulk adjustments (preferred)
  adjustments?: AdjustmentItem[];
  // Legacy bulk field
  items?: AdjustmentItem[];
  // Single item adjustment (alternative to items[])
  productId?: string;
  variantSku?: string;
  quantity?: number;
  mode?: 'add' | 'remove' | 'set';
  reason?: string;
  lostAmount?: number; // Creates expense transaction if provided
  transactionData?: {
    paymentMethod?: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank_transfer';
    reference?: string;
  };
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
  processed?: number;
  failed?: number;
  results?: {
    success?: unknown[];
    failed?: { productId?: string; error?: string }[];
  };
  productId?: string;
  variantSku?: string | null;
  newQuantity?: number;
  message?: string;
  transaction?: {
    _id?: string;
    amount?: number;
    category?: string;
  };
}

// ============= Low Stock =============

export interface LowStockItem {
  _id?: string;
  product: { _id: string; name: string; slug?: string; sku?: string };
  variantSku?: string | null;
  /** Backend may omit this when querying for a single selected branch */
  branch?: { _id: string; name: string; code?: string };
  quantity: number;
  reorderPoint: number;
  needsReorder?: boolean;
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
  sort?: string;
  after?: string;
  cursor?: string;
}
