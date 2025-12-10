import { z } from "zod";

/**
 * Discount type enum values (without empty string - handled separately)
 */
export const DISCOUNT_TYPE_VALUES = ['percentage', 'fixed'];

/**
 * Image variants schema for responsive images
 */
const imageVariantsSchema = z.object({
  thumbnail: z.string().url("Invalid thumbnail URL").optional().or(z.literal("")),
  medium: z.string().url("Invalid medium URL").optional().or(z.literal("")),
}).optional();

/**
 * Image schema for product images
 */
const imageSchema = z.object({
  _id: z.string().optional(),
  url: z.string().url("Invalid image URL"),
  variants: imageVariantsSchema,
  order: z.number().min(0).default(0),
  isFeatured: z.boolean().default(false),
  alt: z.string().optional(),
});

/**
 * Variation option schema for product variations
 */
const variationOptionSchema = z.object({
  value: z.string().min(1, "Option value is required"),
  priceModifier: z.coerce.number().default(0),
  quantity: z.coerce.number().int().min(0).default(0),
  images: z.array(imageSchema).optional().default([]),
});

/**
 * Variation schema for product variations (e.g., Size, Color)
 */
const variationSchema = z.object({
  name: z.string().min(1, "Variation name is required"),
  options: z.array(variationOptionSchema).min(1, "At least one option is required"),
});

/**
 * Discount schema for product discounts
 * Allows empty string for "No Discount" selection
 */
const discountSchema = z.object({
  type: z.enum(DISCOUNT_TYPE_VALUES).or(z.literal('')).optional(),
  // Accept numeric strings and coerce to number to avoid RHF string errors
  value: z.coerce.number().min(0).optional(),
  // Date pickers may return Date objects; allow both string and Date
  startDate: z.union([z.string(), z.date()]).optional(),
  endDate: z.union([z.string(), z.date()]).optional(),
  description: z.string().optional(),
}).optional();

/**
 * Product create schema
 * Per API guide: Products require admin role to create
 *
 * Required fields:
 * - name
 * - category
 * - basePrice (min: 0)
 * - quantity (min: 0)
 *
 * Optional fields:
 * - description
 * - parentCategory
 * - images
 * - tags
 * - discount
 * - isActive
 *
 * System-managed (DO NOT send):
 * - slug (auto-generated from name)
 * - totalSales
 * - averageRating
 * - numReviews
 * - stats.*
 */
export const productCreateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be less than 200 characters"),

  shortDescription: z.string()
    .max(200, "Short description must be less than 200 characters")
    .optional()
    .or(z.literal("")),

  description: z.string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .or(z.literal("")),

  basePrice: z.coerce.number()
    .min(0, "Price must be a positive number"),

  quantity: z.coerce.number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity must be a positive number"),

  category: z.string()
    .min(1, "Category is required"),

  parentCategory: z.string()
    .optional()
    .or(z.literal("")),

  images: z.array(imageSchema).optional().default([]),

  variations: z.array(variationSchema).optional().default([]),

  tags: z.array(z.string()).optional().default([]),

  style: z.array(z.enum(['casual', 'street', 'urban', 'desi', 'formal', 'sport', 'ethnic', 'party'])).optional().default([]),

  discount: discountSchema,

  isActive: z.boolean().default(true),
});

/**
 * Product update schema
 * Per API guide: All product fields can be updated EXCEPT system-managed fields
 *
 * Allowed fields:
 * - name, description, basePrice, quantity, category, parentCategory
 * - images, tags, discount, isActive
 *
 * DO NOT send:
 * - slug (system-managed)
 * - totalSales, averageRating, numReviews, stats.* (system-managed)
 */
export const productUpdateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be less than 200 characters")
    .optional(),

  shortDescription: z.string()
    .max(200, "Short description must be less than 200 characters")
    .optional()
    .or(z.literal("")),

  description: z.string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .or(z.literal("")),

  basePrice: z.coerce.number()
    .min(0, "Price must be a positive number")
    .optional(),

  quantity: z.coerce.number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity must be a positive number")
    .optional(),

  category: z.string()
    .min(1, "Category is required")
    .optional(),

  parentCategory: z.string()
    .optional()
    .or(z.literal("")),

  images: z.array(imageSchema).optional(),

  variations: z.array(variationSchema).optional(),

  tags: z.array(z.string()).optional(),

  style: z.array(z.enum(['casual', 'street', 'urban', 'desi', 'formal', 'sport', 'ethnic', 'party'])).optional(),

  discount: discountSchema,

  isActive: z.boolean().optional(),
});

/**
 * Product view schema (for displaying product data)
 * Includes all fields returned by backend
 */
export const productViewSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  basePrice: z.number(),
  currentPrice: z.number().optional(),
  quantity: z.number(),
  category: z.string(),
  parentCategory: z.string().optional(),
  images: z.array(imageSchema).optional().default([]),
  featuredImage: imageSchema.optional(),
  tags: z.array(z.string()).optional().default([]),
  style: z.array(z.string()).optional().default([]),

  // Discount info
  discount: z.object({
    type: z.enum(DISCOUNT_TYPE_VALUES).or(z.literal('')).optional(),
    value: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional(),
  }).optional(),

  // System-managed stats (read-only)
  stats: z.object({
    totalSales: z.number().optional(),
    totalQuantitySold: z.number().optional(),
    viewCount: z.number().optional(),
  }).optional(),

  averageRating: z.number().optional(),
  numReviews: z.number().optional(),
  isActive: z.boolean(),
  isDiscountActive: z.boolean().optional(),
  totalSales: z.number().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
});
