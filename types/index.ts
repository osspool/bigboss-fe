/**
 * Types Barrel Export
 *
 * Central export point for all application types.
 * Import types from this file for convenience, or import from specific
 * modules for better tree-shaking and organization.
 *
 * @example
 * // Import from barrel (convenient)
 * import { Product, Cart, Order } from '@/types';
 *
 * // Import from specific module (better for tree-shaking)
 * import { Product } from '@/types/product.types';
 * import { Cart } from '@/types/cart.types';
 */

// ==================== Common Types ====================
export type {
  // API Responses
  PaginationInfo,
  ApiResponse,
  ListResponse,
  // Images
  ImageVariants,
  Image,
  // Discount
  DiscountType,
  Discount,
  // Stats
  Stats,
  // Payment Types
  PaymentMethodType,
  MfsProvider,
  CardType,
  PaymentMethodConfig,
  // Legacy Payment Config (backwards compatibility)
  // ManualPaymentMethod,
  // WalletDetails,
  // BankDetails,
  // CashPaymentConfig,
  // PlatformPaymentConfig,
} from "./common.types";

// ==================== Product Types ====================
export type {
  // Images
  ProductImage,
  // Variations (New System)
  VariationAttribute,
  ProductVariant,
  // Properties
  // Discount & Stats
  ProductDiscount,
  ProductStats,
  // Style
  // Main Product
  Product,
  // API Responses
  // ProductListResponse, // COMMENTED: doesn't exist
  // ProductDetailResponse, // COMMENTED: doesn't exist
  // ProductResponse, // COMMENTED: doesn't exist
  // Form/Input Types
  // ProductCreateInput, // COMMENTED: doesn't exist
  // ProductUpdateInput, // COMMENTED: doesn't exist
  // Display Types
  // ProductCardData, // COMMENTED: doesn't exist
} from "./product.types";

// ==================== Cart Types ====================
export type {
  // Variation
  CartItem,
  Cart,
  CartSummary,
  AddCartItemPayload,
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveCartItemPayload,
  CartResponse,
  // Legacy (deprecated)
  CartItemVariation, // @deprecated - for backwards compatibility only
} from "./cart.types";

// ==================== Order Types ====================
export type {
  // Delivery
  // DeliveryAddress, // COMMENTED: doesn't exist
  // DeliveryOption, // COMMENTED: doesn't exist
  // Status
  OrderStatus,
  PaymentStatus,
  // Order Item
  OrderItem,
  // Payment
  // CurrentPayment, // COMMENTED: doesn't exist
  // Order
  Order,
  // API Payloads
  // CreateOrderItem, // COMMENTED: doesn't exist
  // OrderPaymentData, // COMMENTED: use PaymentData instead
  // CreateOrderPayloadCOD, // COMMENTED: doesn't exist
  // CreateOrderPayloadManual, // COMMENTED: doesn't exist
  CreateOrderPayload,
  CancelOrderPayload,
  // UpdateOrderStatusPayload, // COMMENTED: use UpdateStatusPayload instead
  FulfillOrderPayload,
  RefundOrderPayload,
  // API Responses
  // OrderListResponse, // COMMENTED: doesn't exist
  // OrderResponse, // COMMENTED: doesn't exist
  // Summary
  // OrderSummary, // COMMENTED: doesn't exist
  // Query
  // OrderQueryParams,
} from "./order.types";

// ==================== Payment Types ====================
// NOTE: Many payment types don't exist in payment.types.ts
// The payment.types.ts only exports: PaymentGatewayType, PaymentMethod, PaymentStatus,
// PaymentDetails, GatewayInfo, CurrentPayment, VerifyPaymentPayload, RejectPaymentPayload,
// VerificationResult, RejectResult
export type {
  // PaymentGateway, // COMMENTED: use PaymentGatewayType instead
  // ManualPaymentMethod, // COMMENTED: doesn't exist (use PaymentMethod)
  // WalletDetails, // COMMENTED: doesn't exist
  // BankDetails, // COMMENTED: doesn't exist
  // PlatformPaymentConfig, // COMMENTED: doesn't exist
  // PaymentData, // COMMENTED: doesn't exist in payment.types (exists in order.types)
  // PaymentIntent, // COMMENTED: doesn't exist
  // PaymentResponse, // COMMENTED: doesn't exist
  // PaymentVerificationRequest, // COMMENTED: doesn't exist
  // PaymentRecord, // COMMENTED: doesn't exist
  // Refund, // COMMENTED: doesn't exist
  PaymentGatewayType,
  PaymentMethod,
  // CurrentPayment is already exported from order.types
  VerifyPaymentPayload,
  RejectPaymentPayload,
  VerificationResult,
  RejectResult,
} from "./payment.types";

// ==================== Review Types ====================
export type {
  // User
  ReviewUser,
  // Review
  Review,
  // Summary
  ReviewSummary,
  // Filter & Sort
  ReviewFilter,
  ReviewSortOption,
  // API Payloads
  CreateReviewPayload,
  UpdateReviewPayload,
  ReviewHelpfulnessPayload,
  // API Responses
  ReviewListResponse,
  ReviewResponse,
  ReviewSummaryResponse,
  // Moderation
  ReviewModerationAction,
  ReviewReport,
} from "./review.types";

// ==================== Coupon Types ====================
export type {
  // Coupon
  Coupon,
  // Validation
  CouponValidationResult,
  // API Payloads
  // ApplyCouponPayload, // COMMENTED: use ValidateCouponPayload instead
  ValidateCouponPayload,
  CreateCouponPayload,
  UpdateCouponPayload,
  // API Responses
  CouponListResponse,
  CouponResponse,
  CouponValidationResponse,
  // Usage
  CouponUsage,
} from "./coupon.types";

// ==================== Filter Types ====================
export type {
  // Price Range
  PriceRange,
  // Filter State
  ProductFilterState,
  // Sort
  SortOption,
  SortOptionConfig,
  // Filter Options
  FilterOption,
  GroupedFilterOption,
  // Search
  ProductSearchParams,
  ActiveFilters,
  // Faceted Search
  Facet,
  FacetedSearchResults,
  // Presets
  FilterPreset,
  // URL Sync
  FilterQueryParams,
  FilterURLSync,
} from "./filter.types";

// ==================== Inventory Types ====================
export type {
  // Movement Types
  StockMovementType,
  TransferStatus,
  StockRequestStatus,
  TransferActionType,
  StockRequestActionType,
  // Stock Entry
  StockEntry,
  // Stock Movement (Audit)
  StockMovement,
  // Purchase
  PurchasePaymentDetails,
  PurchaseItem,
  CreatePurchasePayload,
  RecordPurchasePayload,
  // Transfer (Challan)
  TransferItem,
  TransportDetails,
  InventoryTransfer,
  Transfer,
  CreateTransferPayload,
  TransferActionPayload,
  UpdateTransferPayload,
  DispatchTransferPayload,
  ReceiveTransferPayload,
  // Stock Request
  StockRequestItem,
  StockRequest,
  CreateStockRequestPayload,
  StockRequestActionPayload,
  // Adjustments
  AdjustmentItem,
  CreateAdjustmentPayload,
  BulkAdjustmentPayload,
  AdjustStockPayload,
  AdjustStockResult,
  // Low Stock
  LowStockItem,
  // Transfer Stats
  TransferStats,
  // Movement Query Params
  MovementQueryParams,
} from "./inventory.types";

// ==================== POS Types ====================
export type {
  // Branch Stock
  VariantStock,
  BranchStock,
  // POS Product
  PosProduct,
  // Products Response
  PosProductsSummary,
  PosProductsBranch,
  PosProductsResponse,
  // Products Params
  PosProductsParams,
  // Lookup
  PosLookupData,
  PosLookupResponse,
  PosLookupResult,
  // Order
  PosOrderItem,
  PosPayment,
  PosCustomer,
  PosOrderPayload,
  // Receipt
  PosReceiptItem,
  PosReceiptVat,
  PosReceiptData,
  PosReceiptResponse,
  PosReceipt,
} from "./pos.types";

// ==================== Finance Types ====================
export type {
  // Statement
  FinanceStatement,
  FinanceStatementParams,
  // Summary
  FinanceTotals,
  FinanceByMethod,
  FinanceByDay,
  FinanceSummary,
  FinanceSummaryParams,
} from "./finance.types";

// ==================== CMS Types ====================
// NOTE: Many CMS types don't exist. Only exporting what actually exists.
export type {
  // Metadata
  CMSMetadata,
  // Status
  CMSPageStatus,
  // Page
  CMSPage,
  // CMSPageWithContent, // COMMENTED: doesn't exist
  // Content Types
  HomePageContent,
  // HomepageContent, // COMMENTED: use HomePageContent instead
  AboutPageContent,
  ContactPageContent,
  // TextPageContent, // COMMENTED: doesn't exist
  // PrivacyPageContent, // COMMENTED: use PolicyPageContent instead
  PolicyPageContent,
  ReturnsPageContent,
  FAQPageContent,
  // CookiesPageContent, // COMMENTED: doesn't exist
  // TermsPageContent, // COMMENTED: doesn't exist
  // SizeGuideContent, // COMMENTED: use SizeGuidePageContent instead
  SizeGuidePageContent,
  // Content Blocks
  // ContentBlock, // COMMENTED: doesn't exist
  // Navigation
  // NavigationItem, // COMMENTED: doesn't exist
  // NavigationMenu, // COMMENTED: doesn't exist
  // Footer
  // FooterConfig, // COMMENTED: doesn't exist
  // Shared shapes - none are exported from cms.types
  // CTA, // COMMENTED: not exported
  // StatItem, // COMMENTED: doesn't exist
  // FeatureItem, // COMMENTED: doesn't exist
  // SupportContactSection, // COMMENTED: doesn't exist
  // LegalContact, // COMMENTED: doesn't exist
  // LegalSection, // COMMENTED: doesn't exist
  // ReturnsSection, // COMMENTED: doesn't exist
  // Typed Pages - none exist
  // Homepage, // COMMENTED: doesn't exist
  // HomePage, // COMMENTED: doesn't exist
  // AboutPage, // COMMENTED: doesn't exist
  // ContactPage, // COMMENTED: doesn't exist
  // TextPage, // COMMENTED: doesn't exist
  // PrivacyPage, // COMMENTED: doesn't exist
  // ReturnsPage, // COMMENTED: doesn't exist
  // FAQPage, // COMMENTED: doesn't exist
  // CookiesPage, // COMMENTED: doesn't exist
  // TermsPage, // COMMENTED: doesn't exist
  // SizeGuidePage, // COMMENTED: doesn't exist
  // API Responses
  // CMSPageListResponse, // COMMENTED: doesn't exist
  // CMSPageResponse, // COMMENTED: doesn't exist
} from "./cms.types";

// ==================== Logistics Types ====================
export type {
  // Delivery
  DeliveryMethod,
  DeliveryOption,
  DeliveryFeeSource,
  PickupBranchInfo,
  CheckoutSettings,
  // Provider
  LogisticsProvider,
  ProviderCharges,
  ProviderConfig,
  LogisticsConfig,
  // Shipment
  ShipmentStatus,
  ShipmentParcel,
  ShipmentPickup,
  ShipmentDelivery,
  ShipmentCashCollection,
  ShipmentTimelineEvent,
  Shipment,
  CreateShipmentPayload,
  UpdateShipmentStatusPayload,
  CancelShipmentPayload,
  CalculateChargeParams,
  // Tracking
  TrackingData,
  TrackingResult,
  // Pickup
  PickupStore,
} from "./logistics.types";
