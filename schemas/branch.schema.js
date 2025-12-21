import { z } from "zod";

/**
 * Branch type values
 */
export const BRANCH_TYPE_VALUES = ['store', 'warehouse', 'outlet', 'franchise'];

/**
 * Branch address schema
 */
const branchAddressSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

/**
 * Branch create schema
 */
export const branchCreateSchema = z.object({
  code: z.string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be less than 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Code must contain only uppercase letters, numbers, and hyphens"),

  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),

  type: z.enum(BRANCH_TYPE_VALUES).default('store'),

  phone: z.string()
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),

  email: z.string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  operatingHours: z.string().optional(),

  isDefault: z.boolean().default(false).optional(),

  address: branchAddressSchema.optional(),
});

/**
 * Branch update schema
 */
export const branchUpdateSchema = z.object({
  code: z.string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be less than 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Code must contain only uppercase letters, numbers, and hyphens")
    .optional(),

  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),

  type: z.enum(BRANCH_TYPE_VALUES).optional(),

  phone: z.string()
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone format")
    .optional()
    .or(z.literal("")),

  email: z.string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  operatingHours: z.string().optional(),

  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),

  address: branchAddressSchema.optional(),
});
