import { z } from "zod";
import { coerceToIsoDateTimeString, optionalObjectIdString } from "@/lib/utils/zod-utils";

/**
 * Gender enum values
 */
export const GENDER_VALUES = ['male', 'female', 'other', 'prefer-not-to-say'];

/**
 * Address schema matching backend
 */
const addressSchema = z.object({
  _id: z.string().optional(), // Added by backend
  label: z.string().min(1, "Label is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("Bangladesh"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  isDefault: z.boolean().default(false).optional(),
});

/**
 * Customer create schema
 * Per API guide: Customers are auto-created via bookings/memberships
 * Manual creation is not typically exposed in admin UI, but schema is provided for completeness
 *
 * Required fields:
 * - name
 * - phone (unique)
 *
 * Optional fields:
 * - email
 * - dateOfBirth
 * - gender
 * - address
 *
 * System-managed (DO NOT send):
 * - userId (set by backend when user account is created)
 * - stats.* (orders, revenue, subscriptions dates/counts)
 */
export const customerCreateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),

  phone: z.string()
    .min(10, "Phone number must be at least 10 digits"),

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
 * Per API guide: All customer fields can be updated EXCEPT system-managed fields
 *
 * Allowed fields:
 * - name, phone, email, dateOfBirth, gender, address.*
 *
 * DO NOT send:
 * - userId (system-managed)
 * - stats.* (system-managed)
 */
export const customerUpdateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),

  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .optional(),

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
 * Customer view schema (for displaying customer data)
 * Includes all fields returned by backend
 */
export const customerViewSchema = z.object({
  _id: z.string(),
  userId: optionalObjectIdString,
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(GENDER_VALUES).optional(),
  addresses: z.array(addressSchema).optional().default([]),

  // System-managed stats (read-only)
  // Revenue is stored in pence on backend
  stats: z.object({
    orders: z.object({
      total: z.number().optional(),        // Total appointments booked
      completed: z.number().optional(),    // Appointments with confirmed payment
      cancelled: z.number().optional(),    // Cancelled appointments
      refunded: z.number().optional(),     // Refunded appointments
      noShow: z.number().optional(),       // No-shows
    }).optional(),
    revenue: z.object({
      total: z.number().optional(),        // Current revenue in pence (decreases on refund)
      lifetime: z.number().optional(),     // Lifetime revenue in pence (never decreases)
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
