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
 * Variation Attribute schema - Defines what variation dimensions exist
 * Backend auto-generates all variant combinations from this
 * @example { name: "Size", values: ["S", "M", "L"] }
 */
const variationAttributeSchema = z.object({
  name: z.string().min(1, "Attribute name is required"),
  values: z.array(z.string().min(1, "Value cannot be empty")).min(1, "At least one value is required"),
});

/**
 * Product Variant Payload schema - For setting initial variant overrides or updates
 * Use attributes for CREATE (to match generated variants), sku for UPDATE
 */
const productVariantPayloadSchema = z.object({
  sku: z.string().optional(), // For updates
  attributes: z.record(z.string(), z.string()).optional(), // For initial creation
  priceModifier: z.coerce.number().default(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  vatRate: z.coerce.number().min(0).max(100).optional().nullable(), // Per-variant VAT override (null = inherit)
  barcode: z.string().optional(),
  images: z.array(imageSchema).optional(),
  shipping: z.object({
    weightGrams: z.number().optional(),
    dimensionsCm: z.object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    }).optional(),
  }).optional(),
  isActive: z.boolean().optional(),
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
 *
 * Optional fields:
 * - description, shortDescription
 * - parentCategory
 * - images
 * - tags, style
 * - discount
 * - isActive
 * - sku (auto-generated if not provided)
 * - costPrice (admin-only, for profit margin calculation)
 * - vatRate (null = inherit from category/platform)
 * - variationAttributes, variants
 * - barcode
 *
 * System-managed (DO NOT send):
 * - slug (auto-generated from name)
 * - quantity (managed by inventory service)
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

  costPrice: z.coerce.number()
    .min(0, "Cost price must be a positive number")
    .optional(),

  vatRate: z.coerce.number()
    .min(0, "VAT rate must be between 0 and 100")
    .max(100, "VAT rate must be between 0 and 100")
    .optional()
    .nullable(), // null = inherit from category/platform

  sku: z.string()
    .max(100, "SKU must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  // quantity is system-managed by inventory service - read-only display only
  quantity: z.coerce.number().int().min(0).optional(),

  category: z.string()
    .min(1, "Category is required"),

  parentCategory: z.string()
    .optional()
    .or(z.literal("")),

  barcode: z.string()
    .optional()
    .or(z.literal("")),

  images: z.array(imageSchema).optional().default([]),

  variationAttributes: z.array(variationAttributeSchema).optional().default([]),

  variants: z.array(productVariantPayloadSchema).optional().default([]),

  tags: z.array(z.string()).optional().default([]),

  style: z.array(z.string()).optional().default([]),

  discount: discountSchema,

  isActive: z.boolean().default(true),

  // Size Guide reference (ObjectId or null)
  sizeGuide: z.string().optional().nullable().or(z.literal("")),
});

/**
 * Product update schema
 * Per API guide: All product fields can be updated EXCEPT system-managed fields
 *
 * Allowed fields:
 * - name, description, shortDescription, basePrice, category, parentCategory
 * - images, tags, style, discount, isActive
 * - sku, costPrice, vatRate, barcode
 * - variationAttributes, variants
 *
 * DO NOT send:
 * - slug (system-managed)
 * - quantity (managed by inventory service)
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

  costPrice: z.coerce.number()
    .min(0, "Cost price must be a positive number")
    .optional(),

  vatRate: z.coerce.number()
    .min(0, "VAT rate must be between 0 and 100")
    .max(100, "VAT rate must be between 0 and 100")
    .optional()
    .nullable(), // null = inherit from category/platform

  sku: z.string()
    .max(100, "SKU must be less than 100 characters")
    .optional()
    .or(z.literal("")),

  // quantity is system-managed by inventory service - read-only display only
  quantity: z.coerce.number().int().min(0).optional(),

  category: z.string()
    .min(1, "Category is required")
    .optional(),

  parentCategory: z.string()
    .optional()
    .or(z.literal("")),

  barcode: z.string()
    .optional()
    .or(z.literal("")),

  images: z.array(imageSchema).optional(),

  variationAttributes: z.array(variationAttributeSchema).optional(),

  variants: z.array(productVariantPayloadSchema).optional(),

  tags: z.array(z.string()).optional(),

  style: z.array(z.string()).optional(),

  discount: discountSchema,

  isActive: z.boolean().optional(),

  // Size Guide reference (ObjectId or null to remove)
  sizeGuide: z.string().optional().nullable().or(z.literal("")),
});

// ==================== Product Type ====================

/**
 * Product type values
 * - 'simple': Regular product without variations
 * - 'variant': Product with variations (Size, Color, etc.)
 *
 * NOTE: productType is auto-determined by backend based on presence of variationAttributes.
 * Frontend should NOT send this field - it's read-only.
 */
export const PRODUCT_TYPE_VALUES = ['simple', 'variant'];

/**
 * Product view schema (for displaying product data)
 * Includes all fields returned by backend
 */
export const productViewSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  sku: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.number(),
  costPrice: z.number().optional(), // Role-restricted (admin only)
  vatRate: z.number().optional().nullable(), // null = inherit from category/platform
  currentPrice: z.number().optional(),
  profitMargin: z.number().optional(), // Role-restricted (admin only)
  profitMarginPercent: z.number().optional(), // Role-restricted (admin only)
  quantity: z.number(),
  /**
   * Product type: 'simple' or 'variant'
   * Auto-determined by backend based on presence of variationAttributes.
   * - If variationAttributes is provided → 'variant'
   * - If no variationAttributes → 'simple'
   */
  productType: z.enum(PRODUCT_TYPE_VALUES).default('simple'),
  category: z.string(),
  parentCategory: z.string().optional(),
  // Simple product identifiers
  barcode: z.string().optional(),

  images: z.array(imageSchema).optional().default([]),
  featuredImage: imageSchema.optional(),
  tags: z.array(z.string()).optional().default([]),
  style: z.array(z.string()).optional().default([]),

  // Variant product fields
  variationAttributes: z.array(z.object({
    name: z.string(),
    values: z.array(z.string()),
  })).optional().default([]),

  variants: z.array(z.object({
    sku: z.string(),
    barcode: z.string().optional(),
    attributes: z.record(z.string(), z.string()),
    priceModifier: z.number().default(0),
    costPrice: z.number().optional(),
    vatRate: z.number().optional().nullable(),
    images: z.array(imageSchema).optional(),
    shipping: z.object({
      weightGrams: z.number().optional(),
      dimensionsCm: z.object({
        length: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      }).optional(),
    }).optional(),
    isActive: z.boolean().optional(),
  })).optional().default([]),

  // Shipping info (simple products)
  shipping: z.object({
    weightGrams: z.number().optional(),
    dimensionsCm: z.object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    }).optional(),
  }).optional(),

  // Properties (key-value)
  properties: z.record(z.unknown()).optional(),

  // Size Guide reference
  sizeGuide: z.string().optional().nullable(),

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

  // Stock projection for variant products (read-only)
  stockProjection: z.object({
    variants: z.array(z.object({
      sku: z.string(),
      quantity: z.number(),
    })).optional(),
    syncedAt: z.string().optional(),
  }).optional(),

  averageRating: z.number().optional(),
  numReviews: z.number().optional(),
  isActive: z.boolean(),
  isDiscountActive: z.boolean().optional(),
  totalSales: z.number().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
});
