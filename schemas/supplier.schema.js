import { z } from "zod";

/**
 * Supplier type enum values
 */
export const SUPPLIER_TYPE_VALUES = ["local", "import", "manufacturer", "wholesaler"];

/**
 * Payment terms enum values
 */
export const PAYMENT_TERMS_VALUES = ["cash", "credit"];

/**
 * Supplier create schema
 */
export const supplierCreateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),

  code: z.string()
    .max(20, "Code must be less than 20 characters")
    .optional()
    .or(z.literal("")),

  type: z.enum(SUPPLIER_TYPE_VALUES)
    .optional()
    .or(z.literal("")),

  contactPerson: z.string()
    .max(100, "Contact person must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  phone: z.string()
    .min(11, "Phone number must be at least 11 digits")
    .regex(/^01[0-9]{9}$/, "Invalid phone format (01XXXXXXXXX)")
    .optional()
    .or(z.literal("")),

  email: z.string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  address: z.string()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  taxId: z.string()
    .max(50, "Tax ID must be less than 50 characters")
    .optional()
    .or(z.literal("")),

  paymentTerms: z.enum(PAYMENT_TERMS_VALUES)
    .optional()
    .or(z.literal("")),

  creditDays: z.coerce.number()
    .int("Credit days must be a whole number")
    .min(0, "Credit days cannot be negative")
    .max(365, "Credit days cannot exceed 365")
    .optional()
    .or(z.literal("")),

  creditLimit: z.coerce.number()
    .min(0, "Credit limit cannot be negative")
    .optional()
    .or(z.literal("")),

  openingBalance: z.coerce.number()
    .min(0, "Opening balance cannot be negative")
    .optional()
    .or(z.literal("")),

  notes: z.string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .or(z.literal("")),

  tags: z.array(z.string()).optional().default([]),

  isActive: z.boolean().optional().default(true),
});

/**
 * Supplier update schema
 */
export const supplierUpdateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),

  code: z.string()
    .max(20, "Code must be less than 20 characters")
    .optional()
    .or(z.literal("")),

  type: z.enum(SUPPLIER_TYPE_VALUES)
    .optional()
    .or(z.literal("")),

  contactPerson: z.string()
    .max(100, "Contact person must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  phone: z.string()
    .regex(/^01[0-9]{9}$/, "Invalid phone format (01XXXXXXXXX)")
    .optional()
    .or(z.literal("")),

  email: z.string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  address: z.string()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal("")),

  taxId: z.string()
    .max(50, "Tax ID must be less than 50 characters")
    .optional()
    .or(z.literal("")),

  paymentTerms: z.enum(PAYMENT_TERMS_VALUES)
    .optional()
    .or(z.literal("")),

  creditDays: z.coerce.number()
    .int("Credit days must be a whole number")
    .min(0, "Credit days cannot be negative")
    .max(365, "Credit days cannot exceed 365")
    .optional()
    .or(z.literal("")),

  creditLimit: z.coerce.number()
    .min(0, "Credit limit cannot be negative")
    .optional()
    .or(z.literal("")),

  openingBalance: z.coerce.number()
    .min(0, "Opening balance cannot be negative")
    .optional()
    .or(z.literal("")),

  notes: z.string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .or(z.literal("")),

  tags: z.array(z.string()).optional(),

  isActive: z.boolean().optional(),
});
