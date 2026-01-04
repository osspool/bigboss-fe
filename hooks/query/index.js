/**
 * Query hooks barrel export
 *
 * Re-exports hooks from @classytic/commerce-sdk for most functionality.
 * App-specific hooks remain local.
 */

// ==================== SDK Hooks ====================
// These are re-exported from the SDK for consistency

// Catalog hooks (products, categories, size-guides)
export {
  // Product hooks
  productHooks,
  PRODUCT_KEYS,
  useProducts,
  useProductDetail,
  useProductActions,
  useProductNavigation,
  useProductBySlug,
  useProductRecommendations,
  useDeletedProducts,
  useRestoreProduct,
  useHardDeleteProduct,
  useSyncProductStock,
  // Category hooks
  categoryHooks,
  CATEGORY_KEYS,
  useCategories,
  useCategoryDetail,
  useCategoryActions,
  useCategoryNavigation,
  useCategoryTree,
  useCategoryBySlug,
  useCategorySyncProductCount,
  flattenCategoryTree,
  getParentCategoryOptions,
  getAllCategoryOptions,
  findCategoryBySlug,
  getCategoryBreadcrumb,
  getChildCategorySlugs,
  getRootCategories,
  // Size Guide hooks
  sizeGuideHooks,
  SIZE_GUIDE_KEYS,
  useSizeGuides,
  useSizeGuideDetail,
  useSizeGuideActions,
  useSizeGuideNavigation,
  useSizeGuideBySlug,
  getSizeGuideOptions,
  findSizeGuideById,
  findSizeGuideBySlug,
  formatMeasurement,
  getSizeTableHeaders,
  getSizeTableRows,
} from "@classytic/commerce-sdk/catalog";

// Sales hooks (orders, customers, cart, pos, transactions)
export {
  // Order hooks
  orderHooks,
  ORDER_KEYS,
  useOrders,
  useOrderDetail,
  useOrderActions,
  useOrderNavigation,
  // Customer-facing order hooks
  useMyOrders,
  useMyOrderDetail,
  useCustomerOrderActions,
  // Admin order hooks
  useAdminOrderActions,
  // Customer hooks
  customerHooks,
  CUSTOMER_KEYS,
  useCustomers,
  useCustomerDetail,
  useCustomerActions,
  useCustomerNavigation,
  // Customer profile hooks
  useCurrentCustomer,
  useCustomerMembership,
  // Cart hooks
  CART_KEYS,
  useCart,
  useCartCount,
  // Cart utilities
  calculateItemPrice,
  calculateItemTotal,
  calculateCartSubtotal,
  getCartItemCount,
  getCartItemVariant,
  formatVariantAttributes,
  // POS hooks
  POS_KEYS,
  usePosProducts,
  usePosLookup,
  usePosLookupMutation,
  usePosOrders,
  usePosReceipt,
  usePosStockActions,
  // POS helper functions
  calculateVariantPrice,
  formatVariantLabel,
  isVariantProduct,
  getAvailableVariants,
  findVariantBySku,
  getVariantStock,
  isInStock,
  getPosProductImage,
  generateIdempotencyKey,
} from "@classytic/commerce-sdk/sales";

// Transaction hooks (independent module)
export {
  transactionHooks,
  TRANSACTION_KEYS,
  useTransactions,
  useTransactionDetail,
  useTransactionActions,
  useTransactionNavigation,
  // Report hooks
  useProfitLoss,
  useCashFlow,
  useCategoryReport,
  useStatement,
} from "@classytic/commerce-sdk/transaction";

// Platform hooks (branches, users, coupons, config)
export {
  // Platform Config hooks
  PLATFORM_KEYS,
  usePlatformConfig,
  useUpdatePlatformConfig,
  usePaymentMethods,
  useDeliveryZones,
  useMembershipConfig,
  // Branch hooks
  branchHooks,
  BRANCH_KEYS,
  useBranches,
  useBranchDetail,
  useBranchActions,
  useBranchNavigation,
  // User hooks
  userHooks,
  USER_KEYS,
  useUsers,
  useUserDetail,
  useUserActions,
  useUserNavigation,
  // Coupon hooks
  couponHooks,
  COUPON_KEYS,
  useCoupons,
  useCouponDetail,
  useCouponActions,
  useCouponNavigation,
} from "@classytic/commerce-sdk/platform";

// Inventory hooks
export {
  // Inventory hooks (products with branch stock)
  useInventory,
  useInventoryLookup,
  useStockActions,
  INVENTORY_KEYS,
  getStockStatus,
  getStockStatusBadge,
  // Stock entry hooks
  stockHooks,
  STOCK_KEYS,
  useStock,
  useStockDetail,
  useStockEntryActions,
  useStockNavigation,
  // Adjustment hooks
  adjustmentHooks,
  ADJUSTMENT_KEYS,
  useAdjustments,
  useAdjustmentDetail,
  useAdjustmentActions,
  useAdjustmentNavigation,
  // Purchase hooks
  purchaseHooks,
  PURCHASE_KEYS,
  usePurchases,
  usePurchaseDetail,
  usePurchaseActions,
  usePurchaseNavigation,
  usePurchaseStateActions,
  // Transfer hooks
  transferHooks,
  TRANSFER_KEYS,
  useTransfers,
  useTransferDetail,
  useTransferActions,
  useTransferNavigation,
  useTransferStateActions,
  // Transfer stats
  TRANSFER_STATS_KEYS,
  useTransferStats,
  // Movement hooks
  MOVEMENT_KEYS,
  useMovements,
  useLowStock,
  getStockChangeInvalidationKeys,
  // Request hooks
  REQUEST_KEYS,
  useStockRequests,
  usePendingStockRequests,
  useStockRequestDetail,
  useStockRequestActions,
  getTransferStateInvalidationKeys,
  // Supplier hooks
  supplierHooks,
  SUPPLIER_KEYS,
  useSuppliers,
  useSupplierDetail,
  useSupplierActions,
  useSupplierNavigation,
} from "@classytic/commerce-sdk/inventory";

// Logistics hooks
export {
  LOGISTICS_KEYS,
  usePickupStores,
  useDeliveryChargeCalculation,
  useDeliveryCharge,
  useShipment,
  useTrackShipment,
  useCreateShipment,
  useCancelShipment,
  useUpdateShipmentStatus,
  useLogisticsActions,
} from "@classytic/commerce-sdk/logistics";

// Finance hooks
export {
  FINANCE_KEYS,
  useFinanceStatements,
  useFinanceSummary,
} from "@classytic/commerce-sdk/finance";

// Content hooks (media, cms)
export {
  // Media hooks
  MEDIA_KEYS,
  useMediaList,
  useMediaDetail,
  useMediaFolders,
  useMediaUpload,
  useMediaBulkDelete,
  useMediaMove,
  useMediaUpdate,
  getMediaVariantUrl,
  getMediaThumbnailUrl,
  getMediaMediumUrl,
  // CMS hooks
  CMS_KEYS,
  useCMSPage,
  useCMSUpdate,
  // CMS API functions (for direct use)
  getCmsPage,
  updateCmsPage,
  mediaApi,
} from "@classytic/commerce-sdk/content";

// Payments hooks
export {
  usePaymentActions,
} from "@classytic/commerce-sdk/payments";

// Analytics hooks
export {
  ANALYTICS_KEYS,
  useAnalyticsDashboard,
  analyticsApi,
} from "@classytic/commerce-sdk/analytics";

// Auth hooks
export {
  useUserSearch,
  // Auth APIs
  authApi,
  loginApi,
  registerApi,
  forgetPassApi,
  resetPassApi,
  tokenRefreshApi,
  verifyManagerAuth,
  getUser,
  getUserByPhone,
  createUser,
  getProfile,
  updateUser,
  // Auth types/constants
  UserRole,
  DISCOUNT_ALLOWED_ROLES,
} from "@classytic/commerce-sdk/auth";
