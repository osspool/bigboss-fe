/**
 * Schema Utilities
 *
 * Common utility functions for schema transformations
 * Reduces code duplication across enums and schemas
 */

/**
 * Convert enum value to human-readable label
 * @param {string} value - Enum value (e.g., "pending_payment")
 * @returns {string} - Labeled value (e.g., "Pending Payment")
 *
 * @example
 * labelize("pending_payment") // "Pending Payment"
 * labelize("active") // "Active"
 * labelize("awaiting_payment") // "Awaiting Payment"
 */
export const labelize = (value) => {
  if (!value) return "";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Map array of enum values to select options
 * @param {string[]} values - Array of enum values
 * @param {Function} customLabeler - Optional custom labeling function
 * @returns {Array<{value: string, label: string}>} - Array of options
 *
 * @example
 * mapToOptions(["pending", "verified", "failed"])
 * // [
 * //   { value: "pending", label: "Pending" },
 * //   { value: "verified", label: "Verified" },
 * //   { value: "failed", label: "Failed" }
 * // ]
 */
export const mapToOptions = (values, customLabeler = null) => {
  if (!Array.isArray(values)) return [];

  const labeler = customLabeler || labelize;

  return values.map((value) => ({
    value,
    label: labeler(value),
  }));
};

/**
 * Create options with custom labels for specific values
 * @param {Object} mapping - Object mapping values to labels
 * @returns {Array<{value: string, label: string}>}
 *
 * @example
 * createOptionsFromMapping({
 *   "bkash": "bKash",
 *   "nagad": "Nagad",
 *   "bank": "Bank Transfer"
 * })
 */
export const createOptionsFromMapping = (mapping) => {
  return Object.entries(mapping).map(([value, label]) => ({
    value,
    label,
  }));
};

/**
 * Create options from an enum object with custom label mapping
 * Extracts values from enum and maps them to custom labels
 *
 * @param {Object} enumObject - Enum object (e.g., { BKASH: 'bkash', NAGAD: 'nagad' })
 * @param {Object} labelMapping - Optional mapping of values to custom labels
 * @returns {Array<{value: string, label: string}>}
 *
 * @example
 * const PAYMENT_METHOD = { BKASH: 'bkash', NAGAD: 'nagad' };
 * createOptionsFromEnum(PAYMENT_METHOD, {
 *   bkash: 'bKash',
 *   nagad: 'Nagad'
 * })
 * // [{ value: 'bkash', label: 'bKash' }, { value: 'nagad', label: 'Nagad' }]
 */
export const createOptionsFromEnum = (enumObject, labelMapping = {}) => {
  return Object.values(enumObject).map(value => ({
    value,
    label: labelMapping[value] || labelize(value),
  }));
};

/**
 * Get status color based on status type
 * @param {string} status - Status value
 * @returns {string} - Color class or variant
 */
export const getStatusVariant = (status) => {
  const statusMap = {
    // Payment statuses
    pending: "warning",
    verified: "success",
    failed: "destructive",
    refunded: "secondary",

    // Order statuses
    awaiting_payment: "warning",
    paid: "success",
    processing: "default",
    fulfilled: "success",
    cancelled: "destructive",

    // Enrollment statuses
    pending_payment: "warning",
    active: "success",
    completed: "success",
    expired: "secondary",

    // Transaction statuses
    payment_initiated: "default",
    requires_action: "warning",
    completed: "success",
  };

  return statusMap[status] || "default";
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: "BDT")
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = "BDT") => {
  if (typeof amount !== "number") return "৳0";

  const symbol = currency === "BDT" ? "৳" : currency;
  return `${symbol}${amount.toLocaleString()}`;
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ("short", "long", "time")
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = "short") => {
  if (!date) return "N/A";

  const d = new Date(date);

  if (format === "short") {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  if (format === "long") {
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  if (format === "time") {
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return d.toLocaleDateString();
};

const schemaUtils = {
  labelize,
  mapToOptions,
  createOptionsFromMapping,
  createOptionsFromEnum,
  getStatusVariant,
  formatCurrency,
  formatDate,
};

export default schemaUtils;
