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
  CreateOrderItem,
  OrderPaymentData,
  CreateOrderPayloadCOD,
  CreateOrderPayloadManual,
  CreateOrderPayload,
  CancelOrderPayload,
  UpdateOrderStatusPayload,
  FulfillOrderPayload,
  RefundOrderPayload,
  // API Responses
  OrderListResponse,
  OrderResponse,
  // Summary
  OrderSummary,
  // Query
  OrderQueryParams,
} from "./order.types";

// ==================== Payment Types ====================
export type {
  // Gateway & Methods
  PaymentGateway,
  ManualPaymentMethod,
  // Details
  WalletDetails,
  BankDetails,
  // Configuration
  PlatformPaymentConfig,
  // Payment Data
  PaymentData,
  // Payment Intent
  PaymentIntent,
  // Responses
  PaymentResponse,
  // Verification
  PaymentVerificationRequest,
  // History
  PaymentRecord,
  // Refund
  Refund,
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
  ApplyCouponPayload,
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
export type {
  // Metadata
  CMSMetadata,
  // Status
  CMSPageStatus,
  // Page
  CMSPage,
  CMSPageWithContent,
  // Content Types
  HomePageContent,
  HomepageContent,
  AboutPageContent,
  ContactPageContent,
  TextPageContent,
  PrivacyPageContent,
  ReturnsPageContent,
  FAQPageContent,
  CookiesPageContent,
  TermsPageContent,
  SizeGuideContent,
  // Content Blocks
  ContentBlock,
  // Navigation
  NavigationItem,
  NavigationMenu,
  // Footer
  FooterConfig,
  // Shared shapes
  CTA,
  StatItem,
  FeatureItem,
  SupportContactSection,
  LegalContact,
  LegalSection,
  ReturnsSection,
  // Typed Pages
  Homepage,
  HomePage,
  AboutPage,
  ContactPage,
  TextPage,
  PrivacyPage,
  ReturnsPage,
  FAQPage,
  CookiesPage,
  TermsPage,
  SizeGuidePage,
  // API Responses
  CMSPageListResponse,
  CMSPageResponse,
} from "./cms.types";
