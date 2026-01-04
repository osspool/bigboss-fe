/**
 * Types Barrel Export
 *
 * Re-exports types from @classytic/commerce-sdk.
 * App-specific types (filter, review) are kept locally.
 *
 * @example
 * import { Product, Order, Customer } from '@/types';
 */

// ==================== Core Types ====================
export type {
  ApiResponse,
  PaginatedResponse,
  OffsetPaginationResponse,
  KeysetPaginationResponse,
  QueryParams,
} from "@classytic/commerce-sdk/core";

// ==================== Auth Types ====================
export type {
  User,
  UserRoleType,
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "@classytic/commerce-sdk/auth";

// ==================== Catalog Types ====================
export type {
  // Product
  Product,
  ProductImage,
  ProductVariant,
  VariationAttribute,
  ProductDiscount,
  ProductStats,
  CreateProductPayload,
  UpdateProductPayload,
  // Category
  Category,
  CategoryTreeNode,
  // Size Guide
  SizeGuide,
  SizeDefinition,
} from "@classytic/commerce-sdk/catalog";

// ==================== Sales Types ====================
// Enums (exported as values)
export {
  OrderStatus,
  PaymentStatus,
} from "@classytic/commerce-sdk/sales";

export type {
  // Cart
  Cart,
  CartItem,
  CartSummary,
  CartItemVariation,
  AddCartItemPayload,
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveCartItemPayload,
  CartResponse,
  // Order
  Order,
  OrderItem,
  OrderShipping,
  CreateOrderPayload,
  CancelOrderPayload,
  FulfillOrderPayload,
  RefundOrderPayload,
  ShippingStatus,
  ShippingProvider,
  // Customer
  Customer,
  CustomerMembership,
  CustomerAddress,
  // POS
  PosProduct,
  PosOrderPayload,
  PosPayment,
  PosCustomer,
  PosReceipt,
  PosReceiptData,
  PosReceiptItem,
  PosReceiptVat,
  PosLookupData,
  PosLookupResponse,
  PosLookupResult,
  PosProductsParams,
  PosProductsResponse,
  PosProductsSummary,
  PosProductsBranch,
  VariantStock,
  BranchStock,
  PosOrderItem,
  PosCartItem,
  PaymentOption,
  PaymentState,
  SplitPaymentEntry,
  PosPaymentMethod,
} from "@classytic/commerce-sdk/sales";

// ==================== Transaction Types ====================
// Enums (exported as values)
export {
  TransactionFlow,
  TransactionStatus,
  TransactionCategory,
  /** @deprecated Use TransactionFlow instead. Backend uses flow (inflow/outflow) */
  TransactionType,
} from "@classytic/commerce-sdk/transaction";

export type {
  Transaction,
  TransactionFlowType,
  TransactionCategoryType,
  TaxType,
  TransactionTaxDetails,
  TransactionCommission,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  PaymentMethod,
  PaymentGatewayType,
  PaymentIntent,
  TransactionPaymentDetails,
  TransactionGateway,
  TransactionSplitPayment,
  // Report types
  FinancialReport,
  CashFlowReport,
  CategoryReport,
  StatementRow,
  StatementResponse,
} from "@classytic/commerce-sdk/transaction";

// ==================== Inventory Types ====================
export type {
  // Stock
  StockEntry,
  StockMovement,
  StockMovementType,
  LowStockItem,
  MovementQueryParams,
  // Purchase
  Purchase,
  PurchaseItem,
  PurchaseItemDoc,
  PurchaseStatus,
  PurchasePaymentStatus,
  PurchasePaymentTerms,
  PurchasePaymentDetails,
  PurchaseStatusHistoryEntry,
  CreatePurchasePayload,
  RecordPurchasePayload,
  // Transfer
  Transfer,
  InventoryTransfer,
  TransferItem,
  TransferStatus,
  TransferStatusHistoryEntry,
  TransferActionType,
  TransferActionPayload,
  CreateTransferPayload,
  UpdateTransferPayload,
  DispatchTransferPayload,
  ReceiveTransferPayload,
  TransportDetails,
  TransferStats,
  // Request
  StockRequest,
  StockRequestItem,
  StockRequestStatus,
  StockRequestPriority,
  StockRequestActionType,
  StockRequestActionPayload,
  CreateStockRequestPayload,
  // Adjustment
  AdjustmentItem,
  CreateAdjustmentPayload,
  BulkAdjustmentPayload,
  AdjustStockPayload,
  AdjustStockResult,
  // Supplier
  Supplier,
} from "@classytic/commerce-sdk/inventory";

// ==================== Platform Types ====================
export type {
  // Branch
  Branch,
  BranchType,
  BranchRole,
  BranchAddress,
  CreateBranchPayload,
  UpdateBranchPayload,
  // Coupon
  Coupon,
  CouponValidationResult,
  ValidateCouponPayload,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponListResponse,
  CouponResponse,
  CouponValidationResponse,
  CouponUsage,
  // Platform Config
  PlatformConfig,
  DeliveryZone,
  MembershipConfig,
  MembershipTierConfig,
  PaymentMethodConfig,
} from "@classytic/commerce-sdk/platform";

// ==================== Finance Types ====================
export type {
  FinanceStatement,
  FinanceStatementParams,
  FinanceTotals,
  FinanceByMethod,
  FinanceByDay,
  FinanceSummary,
  FinanceSummaryParams,
} from "@classytic/commerce-sdk/finance";

// ==================== Logistics Types ====================
export type {
  // Delivery
  DeliveryMethod,
  DeliveryOption,
  DeliveryFeeSource,
  CheckoutSettings,
  PickupBranchInfo,
  // Provider
  LogisticsProvider,
  LogisticsConfig,
  ProviderConfig,
  ProviderCharges,
  // Shipment
  ShipmentStatus,
  ShipmentTimelineEvent,
  CreateShipmentPayload,
  UpdateShipmentStatusPayload,
  CancelShipmentPayload,
  CalculateChargeParams,
  // Tracking
  TrackingData,
  TrackingResult,
  // Pickup
  PickupStore,
} from "@classytic/commerce-sdk/logistics";

// ==================== Content Types ====================
export type {
  // Media
  Media,
  MediaFolder,
  VariantName,
  // CMS
  CMSPage,
  CMSPageStatus,
  CMSMetadata,
  HomePageContent,
  AboutPageContent,
  ContactPageContent,
  PolicyPageContent,
  ReturnsPageContent,
  FAQPageContent,
  SizeGuidePageContent,
  ShippingPageContent,
} from "@classytic/commerce-sdk/content";

// ==================== Payments Types ====================
export type {
  VerifyPaymentPayload,
  RejectPaymentPayload,
  VerificationResult,
  RejectResult,
} from "@classytic/commerce-sdk/payments";

// ==================== App-Specific Types (Local) ====================
// These types are specific to the app and not part of the SDK

// Common types not in SDK
export type {
  PaginationInfo,
  ListResponse,
  ImageVariants,
  Image,
  DiscountType,
  Discount,
  Stats,
  MfsProvider,
  CardType,
  CategoryVatRate,
  VatInvoiceSettings,
  PlatformVatConfig,
  PaymentDetails,
  GatewayInfo,
} from "./common.types";

// Filter types (app-specific UI)
export type {
  PriceRange,
  ProductFilterState,
  SortOption,
  SortOptionConfig,
  FilterOption,
  GroupedFilterOption,
  ProductSearchParams,
  ActiveFilters,
  Facet,
  FacetedSearchResults,
  FilterPreset,
  FilterQueryParams,
  FilterURLSync,
} from "./filter.types";

// Review types (not in SDK)
export type {
  ReviewUser,
  Review,
  ReviewSummary,
  ReviewFilter,
  ReviewSortOption,
  CreateReviewPayload,
  UpdateReviewPayload,
  ReviewHelpfulnessPayload,
  ReviewListResponse,
  ReviewResponse,
  ReviewSummaryResponse,
  ReviewModerationAction,
  ReviewReport,
} from "./review.types";
