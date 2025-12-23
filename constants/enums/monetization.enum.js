/**
 * 📋 UNIFIED MONETIZATION ENUMS - SINGLE SOURCE OF TRUTH
 * Matches backend lib/monetization/enums exactly
 *
 * All monetization, payment, subscription, and transaction enums
 * Used across Orders, Enrollments, and Platform Subscriptions
 *
 * @module constants/enums/monetization
 */

import { createOptionsFromEnum, mapToOptions } from '@/lib/utils/schema.utils';


// ============ TRANSACTION STATUS ============
/**
 * Transaction Status - Comprehensive state machine
 */
export const TRANSACTION_STATUS = {
  // Initial states
  PENDING: 'pending',
  PAYMENT_INITIATED: 'payment_initiated',
  // Processing states
  PROCESSING: 'processing',
  REQUIRES_ACTION: 'requires_action',
  // Success states
  VERIFIED: 'verified',
  COMPLETED: 'completed',
  // Failure states
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  // Refund states
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
};

export const TRANSACTION_STATUS_VALUES = Object.values(TRANSACTION_STATUS);

// Auto-generate options from values using utility function
export const TRANSACTION_STATUS_OPTIONS = mapToOptions(TRANSACTION_STATUS_VALUES);

// ============ TRANSACTION TYPE ============
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const TRANSACTION_TYPE_VALUES = Object.values(TRANSACTION_TYPES);

// Auto-generate options from values using utility function
export const TRANSACTION_TYPE_OPTIONS = mapToOptions(TRANSACTION_TYPE_VALUES);

// ============ TRANSACTION CATEGORIES ============
/**
 * Transaction Categories - Three-tier system matching backend
 * 1. Monetization-managed (library): SUBSCRIPTION, MEMBERSHIP, REFUND
 * 2. HRM-managed (library): SALARY, BONUS, COMMISSION, OVERTIME, SEVERANCE
 * 3. Manual operational (app): RENT, UTILITIES, etc.
 */

// Monetization library categories (system-managed)
export const LIBRARY_TRANSACTION_CATEGORIES = {
  ORDER_PURCHASE: 'order_purchase',       // Product purchase income
  ORDER_SUBSCRIPTION: 'order_subscription',
  WHOLESALE_SALE: 'wholesale_sale',
  PLATFORM_SUBSCRIPTION: 'platform_subscription',
  CREATOR_SUBSCRIPTION: 'creator_subscription',
  ENROLLMENT_PURCHASE: 'enrollment_purchase',
  ENROLLMENT_SUBSCRIPTION: 'enrollment_subscription',
};

// App-specific categories (system-managed)
export const OPERATIONAL_CATEGORIES = {
  // Inventory
  INVENTORY_PURCHASE: 'inventory_purchase',
  PURCHASE_RETURN: 'purchase_return',
  INVENTORY_LOSS: 'inventory_loss',
  INVENTORY_ADJUSTMENT: 'inventory_adjustment',
  COGS: 'cogs',

  // Operational Expenses
  RENT: 'rent',
  UTILITIES: 'utilities',
  EQUIPMENT: 'equipment',
  SUPPLIES: 'supplies',
  MAINTENANCE: 'maintenance',
  MARKETING: 'marketing',
  OTHER_EXPENSE: 'other_expense',

  // Operational Income
  CAPITAL_INJECTION: 'capital_injection',
  RETAINED_EARNINGS: 'retained_earnings',
  TIP_INCOME: 'tip_income',
  OTHER_INCOME: 'other_income',
};

// Complete transaction categories (all sources)
export const TRANSACTION_CATEGORIES = {
  ...LIBRARY_TRANSACTION_CATEGORIES,
  ...OPERATIONAL_CATEGORIES,
};

export const TRANSACTION_CATEGORIES_VALUES = Object.values(TRANSACTION_CATEGORIES);

// Legacy alias for compatibility
export const TRANSACTION_CATEGORY_VALUES = TRANSACTION_CATEGORIES_VALUES;

// Auto-generate options from values using utility function
export const TRANSACTION_CATEGORY_OPTIONS = mapToOptions(TRANSACTION_CATEGORIES_VALUES);

// Manual categories only (for frontend form dropdowns)
export const MANUAL_CATEGORY_VALUES = Object.values(OPERATIONAL_CATEGORIES);
export const MANUAL_CATEGORY_OPTIONS = mapToOptions(MANUAL_CATEGORY_VALUES);

// Library-managed categories (restricted - FE cannot create)
export const LIBRARY_CATEGORY_VALUES = [
  ...TRANSACTION_CATEGORIES_VALUES,
];

/**
 * Helper to categorize transaction categories by type
 * Useful for P&L reports and accounting views
 */
export const INCOME_CATEGORIES = [
  TRANSACTION_CATEGORIES.ORDER_PURCHASE,
  TRANSACTION_CATEGORIES.ORDER_SUBSCRIPTION,
  TRANSACTION_CATEGORIES.WHOLESALE_SALE,
  TRANSACTION_CATEGORIES.PLATFORM_SUBSCRIPTION,
  TRANSACTION_CATEGORIES.CREATOR_SUBSCRIPTION,
  TRANSACTION_CATEGORIES.ENROLLMENT_PURCHASE,
  TRANSACTION_CATEGORIES.ENROLLMENT_SUBSCRIPTION,
  TRANSACTION_CATEGORIES.PURCHASE_RETURN,
  TRANSACTION_CATEGORIES.CAPITAL_INJECTION,
  TRANSACTION_CATEGORIES.RETAINED_EARNINGS,
  TRANSACTION_CATEGORIES.TIP_INCOME,
  TRANSACTION_CATEGORIES.OTHER_INCOME,
];

export const EXPENSE_CATEGORIES = [
  TRANSACTION_CATEGORIES.INVENTORY_PURCHASE,
  TRANSACTION_CATEGORIES.INVENTORY_LOSS,
  TRANSACTION_CATEGORIES.INVENTORY_ADJUSTMENT,
  TRANSACTION_CATEGORIES.COGS,
  TRANSACTION_CATEGORIES.RENT,
  TRANSACTION_CATEGORIES.UTILITIES,
  TRANSACTION_CATEGORIES.EQUIPMENT,
  TRANSACTION_CATEGORIES.SUPPLIES,
  TRANSACTION_CATEGORIES.MAINTENANCE,
  TRANSACTION_CATEGORIES.MARKETING,
  TRANSACTION_CATEGORIES.OTHER_EXPENSE,
];

// Manual income/expense categories (for form filtering)
export const MANUAL_INCOME_CATEGORIES = [
  TRANSACTION_CATEGORIES.CAPITAL_INJECTION,
  TRANSACTION_CATEGORIES.RETAINED_EARNINGS,
  TRANSACTION_CATEGORIES.TIP_INCOME,
  TRANSACTION_CATEGORIES.OTHER_INCOME,
];

export const MANUAL_EXPENSE_CATEGORIES = [
  TRANSACTION_CATEGORIES.INVENTORY_PURCHASE,
  TRANSACTION_CATEGORIES.INVENTORY_LOSS,
  TRANSACTION_CATEGORIES.INVENTORY_ADJUSTMENT,
  TRANSACTION_CATEGORIES.COGS,
  TRANSACTION_CATEGORIES.RENT,
  TRANSACTION_CATEGORIES.UTILITIES,
  TRANSACTION_CATEGORIES.EQUIPMENT,
  TRANSACTION_CATEGORIES.SUPPLIES,
  TRANSACTION_CATEGORIES.MAINTENANCE,
  TRANSACTION_CATEGORIES.MARKETING,
  TRANSACTION_CATEGORIES.OTHER_EXPENSE,
];

// ============ TRANSACTION TARGET MODELS ============
/**
 * Valid target models for polymorphic reference
 */
export const TRANSACTION_TARGET_MODELS = {
  APPOINTMENT: 'Appointment',  // Appointment consultation fees
};

export const TRANSACTION_TARGET_MODEL_VALUES = Object.values(TRANSACTION_TARGET_MODELS);

// Auto-generate options from values using utility function
export const TRANSACTION_TARGET_MODEL_OPTIONS = mapToOptions(TRANSACTION_TARGET_MODEL_VALUES);

// ============ PAYMENT STATUS ============
/**
 * Payment Status - Used across all payment flows
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

// Auto-generate options from values using utility function
export const PAYMENT_STATUS_OPTIONS = mapToOptions(PAYMENT_STATUS_VALUES);

// ============ PAYMENT METHOD ============
export const PAYMENT_METHOD = {
  CASH: 'cash',
  BKASH: 'bkash',
  NAGAD: 'nagad',
  ROCKET: 'rocket',
  BANK_TRANSFER: 'bank_transfer',
  CARD: 'card',
  ONLINE: 'online',
  MANUAL: 'manual',
};

export const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHOD);

/**
 * Payment method options for select inputs
 * Extracts values from PAYMENT_METHOD enum with custom labels
 */
export const PAYMENT_METHOD_OPTIONS = createOptionsFromEnum(PAYMENT_METHOD, {
  cash: 'Cash',
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
  bank_transfer: 'Bank Transfer',
  card: 'Card',
  online: 'Online',
  manual: 'Manual',
});

// ============ PAYMENT GATEWAY TYPES ============
export const PAYMENT_GATEWAY_TYPE = {
  MANUAL: 'manual',
  // STRIPE: 'stripe',
};

export const PAYMENT_GATEWAY_TYPE_VALUES = Object.values(PAYMENT_GATEWAY_TYPE);

/**
 * Active payment gateways (currently enabled)
 * Only manual and cash are active right now
 */
export const ACTIVE_PAYMENT_GATEWAYS = [
  PAYMENT_GATEWAY_TYPE.MANUAL,
  // PAYMENT_GATEWAY_TYPE.STRIPE,  // Uncomment when Stripe is integrated
  // PAYMENT_GATEWAY_TYPE.SSLCOMMERZ,  // Uncomment when SSLCommerz is integrated
];

// ============ SUBSCRIPTION STATUS ============
/**
 * Subscription Status - Canonical definition
 */
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PENDING: 'pending',
  INACTIVE: 'inactive',
};

export const SUBSCRIPTION_STATUS_VALUES = Object.values(SUBSCRIPTION_STATUS);

// Auto-generate options from values using utility function
export const SUBSCRIPTION_STATUS_OPTIONS = mapToOptions(SUBSCRIPTION_STATUS_VALUES);

// ============ MONETIZATION TYPES ============
export const MONETIZATION_TYPES = {
  FREE: 'free',
  PURCHASE: 'purchase',
  SUBSCRIPTION: 'subscription',
};

export const MONETIZATION_TYPE_VALUES = Object.values(MONETIZATION_TYPES);

// ============ PLAN KEYS ============
/**
 * Supported plan intervals
 */
export const PLAN_KEYS = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
};

export const PLAN_KEY_VALUES = Object.values(PLAN_KEYS);



// ============ GATEWAY FEE RATES ============
export const DEFAULT_GATEWAY_FEES = {
  // stripe: 0.029,
};


export const COMMISSION_STATUS = {
  PENDING: 'pending',
  DUE: 'due',
  PAID: 'paid',
  WAIVED: 'waived',
};

export const COMMISSION_STATUS_VALUES = Object.values(COMMISSION_STATUS);

// ============ ORDER STATUS ============
/**
 * Order Status - Matches backend order model
 * Flow: pending → processing → confirmed → shipped → delivered
 *       ↓           ↓            ↓
 *    cancelled   cancelled    cancelled
 */
export const ORDER_STATUS = {
  PENDING: 'pending',           // Order placed, awaiting payment verification
  PROCESSING: 'processing',     // Payment verified, preparing order
  CONFIRMED: 'confirmed',       // Order confirmed, ready to ship
  SHIPPED: 'shipped',           // Order dispatched
  DELIVERED: 'delivered',       // Order delivered
  CANCELLED: 'cancelled',       // Order cancelled
};

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

export const ORDER_STATUS_OPTIONS = mapToOptions(ORDER_STATUS_VALUES);

/**
 * Order status labels for display
 */
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
};

/**
 * Order status colors for badges
 */
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.PROCESSING]: 'info',
  [ORDER_STATUS.CONFIRMED]: 'success',
  [ORDER_STATUS.SHIPPED]: 'info',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'destructive',
};

// ============ ORDER SOURCE ============
/**
 * Order Source - Where the order originated from
 * Matches backend order model source field
 */
export const ORDER_SOURCE = {
  WEB: 'web',     // Online store/website
  POS: 'pos',     // Point of Sale
  API: 'api',     // External API integration
};

export const ORDER_SOURCE_VALUES = Object.values(ORDER_SOURCE);

export const ORDER_SOURCE_OPTIONS = mapToOptions(ORDER_SOURCE_VALUES);


// Default export for convenience
export default {
  // Transaction
  TRANSACTION_STATUS,
  TRANSACTION_STATUS_VALUES,
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_VALUES,
  TRANSACTION_TYPE_OPTIONS,
  TRANSACTION_CATEGORIES,
  TRANSACTION_CATEGORIES_VALUES,
  TRANSACTION_CATEGORY_OPTIONS,
  LIBRARY_TRANSACTION_CATEGORIES,
  OPERATIONAL_CATEGORIES,
  MANUAL_CATEGORY_VALUES,
  MANUAL_CATEGORY_OPTIONS,
  LIBRARY_CATEGORY_VALUES,
  TRANSACTION_TARGET_MODELS,
  TRANSACTION_TARGET_MODEL_VALUES,
  TRANSACTION_TARGET_MODEL_OPTIONS,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  MANUAL_INCOME_CATEGORIES,
  MANUAL_EXPENSE_CATEGORIES,
  // Payment
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_METHOD,
  PAYMENT_METHOD_VALUES,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_GATEWAY_TYPE,
  PAYMENT_GATEWAY_TYPE_VALUES,
  ACTIVE_PAYMENT_GATEWAYS,
  // Subscription
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_STATUS_VALUES,
  SUBSCRIPTION_STATUS_OPTIONS,
  // Monetization
  MONETIZATION_TYPES,
  MONETIZATION_TYPE_VALUES,
  PLAN_KEYS,
  PLAN_KEY_VALUES,
  // Order
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_SOURCE,
  ORDER_SOURCE_VALUES,
  ORDER_SOURCE_OPTIONS,
  // Platform
  DEFAULT_GATEWAY_FEES,
  // Commission
  COMMISSION_STATUS,
  COMMISSION_STATUS_VALUES,
};
