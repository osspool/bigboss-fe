import { z } from "zod";
import { coerceToIsoDateTimeString, optionalObjectIdString } from "@/lib/utils/zod-utils";

/**
 * Gender enum values
 */
export const GENDER_VALUES = ['male', 'female', 'other', 'prefer-not-to-say'];

/**
 * Customer Address Schema (Simplified)
 *
 * Customer addresses are basic - they only store:
 * - label, recipientName, addressLine1/2, city, division, postalCode, country, phone
 *
 * Area-specific data (areaId, zone, providerAreaIds) is resolved at CHECKOUT time
 * using #data/redx and sent with the order's DeliveryAddress.
 */
const addressSchema = z.object({
  _id: z.string().optional(), // Added by backend
  recipientName: z.string().optional(),
  label: z.string().min(1, "Label is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().optional(), // District name
  division: z.string().optional(), // Division name
  postalCode: z.string().optional(),
  country: z.string().default("Bangladesh"),
  phone: z.string()
    .min(11, "Phone number must be 11 digits")
    .regex(/^01[0-9]{9}$/, "Invalid phone format (01XXXXXXXXX)"),
  isDefault: z.boolean().default(false).optional(),
});

/**
 * Relaxed address schema for updates
 */
const addressUpdateSchema = z.object({
  _id: z.string().optional(),
  recipientName: z.string().optional(),
  label: z.string().min(1, "Label is required").optional(),
  addressLine1: z.string().min(1, "Address line 1 is required").optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  division: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string()
    .regex(/^01[0-9]{9}$/, "Invalid phone format (01XXXXXXXXX)")
    .optional()
    .or(z.literal("")),
  isDefault: z.boolean().optional(),
});

// Export for use in form components
export { addressSchema, addressUpdateSchema };

/**
 * Customer create schema
 */
export const customerCreateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),

  phone: z.string()
    .min(11, "Phone number must be 11 digits")
    .regex(/^01[0-9]{9}$/, "Invalid phone format (01XXXXXXXXX)"),

  email: z.string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  dateOfBirth: coerceToIsoDateTimeString.optional(),

  gender: z.enum(GENDER_VALUES).optional()
    .or(z.literal("")),

  addresses: z.array(addressSchema).optional().default([]),
});

/**
 * Customer update schema
 */
export const customerUpdateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),

  phone: z.string()
    .min(11, "Phone number must be 11 digits")
    .regex(/^01[0-9]{9}$/, "Invalid phone format (01XXXXXXXXX)")
    .optional(),

  email: z.string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  dateOfBirth: coerceToIsoDateTimeString.optional(),

  gender: z.enum(GENDER_VALUES).optional()
    .or(z.literal("")),

  addresses: z.array(addressUpdateSchema).optional().default([]),
});

/**
 * Customer view schema (for displaying customer data)
 */
export const customerViewSchema = z.object({
  _id: z.string(),
  userId: optionalObjectIdString,
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(GENDER_VALUES).optional(),
  addresses: z.array(z.object({
    _id: z.string().optional(),
    recipientName: z.string().optional(),
    label: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    division: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    isDefault: z.boolean().optional(),
  })).optional().default([]),

  // System-managed stats (read-only)
  stats: z.object({
    orders: z.object({
      total: z.number().optional(),
      completed: z.number().optional(),
      cancelled: z.number().optional(),
      refunded: z.number().optional(),
      noShow: z.number().optional(),
    }).optional(),
    revenue: z.object({
      total: z.number().optional(),
      lifetime: z.number().optional(),
    }).optional(),
    subscriptions: z.object({
      active: z.number().optional(),
      cancelled: z.number().optional(),
    }).optional(),
    firstOrderDate: z.string().optional(),
    lastOrderDate: z.string().optional(),
  }).optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
});
