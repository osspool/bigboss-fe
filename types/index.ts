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
  // Payment Config (from platform settings)
  ManualPaymentMethod,
  WalletDetails,
  BankDetails,
  PlatformPaymentConfig,
} from "./common.types";

// ==================== Product Types ====================
export type {
  // Images
  ProductImage,
  // Variations
  VariationOption,
  ProductVariation,
  // Properties
  ProductProperties,
  // Discount & Stats
  ProductDiscount,
  ProductStats,
  // Style
  ProductStyle,
  // Main Product
  Product,
  // API Responses
  ProductListResponse,
  ProductDetailResponse,
  ProductResponse,
  // Form/Input Types
  ProductCreateInput,
  ProductUpdateInput,
  // Display Types
  ProductCardData,
  ProductWithVariation,
} from "./product.types";

// ==================== Cart Types ====================
export type {
  // Variation
  CartItemVariation,
  // Product in Cart
  CartProduct,
  // Cart Item
  CartItem,
  // Cart
  Cart,
  // API Payloads
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveFromCartPayload,
  ClearCartPayload,
  // API Responses
  CartResponse,
  CartOperationResponse,
  // Computed Types
  CartItemWithTotal,
  CartSummary,
  CartWithSummary,
} from "./cart.types";

// ==================== Order Types ====================
export type {
  // Delivery
  DeliveryAddress,
  DeliveryOption,
  // Status
  OrderStatus,
  PaymentStatus,
  // Order Item
  OrderItem,
  // Payment
  CurrentPayment,
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
  OrderQueryParams,
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
